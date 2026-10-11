# ⚡ Super JinX account service (internal, 127.0.0.1:8090, reached through nginx at /jinx-api/)
# Changes the panel admin's USERNAME and/or PASSWORD safely:
#   1) checks the CURRENT username + password with the panel itself
#   2) validates the new values (clear error messages, nothing half-done)
#   3) renames + re-hashes in ONE database transaction (the admin keeps all its users)
#   4) logs in with the new values and returns a fresh token -> the user is never kicked out
# Brute-force protection: 5 wrong current passwords for an account -> that account is locked for 5 minutes.
# Also: QR codes for the sub page, and the reseller panels (پنل‌های نمایندگی) with their limits.
import json, re, sys, time, threading, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
# 💎 donation page backup (used only if nginx can't read the file itself)
DON_FILES = ("/opt/jinx/donate.html", "/opt/jinx/donate.golden.html")
DONCFG_FILES = ("/opt/jinx/donate-config.js", "/opt/jinx/donate-config.golden.js")
DON_FALLBACK = ('<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                '<title>حمایت مالی</title><body style="font-family:Tahoma,sans-serif;background:#1a202c;color:#e2e8f0;text-align:center;padding:40px 16px">'
                '<h2>💎 حمایت مالی</h2><p>صفحه در حال بازسازی است، چند ثانیه دیگر دوباره باز کنید.</p>'
                '<p><a style="color:#9f7aea" href="/donate/">دوباره</a> · <a style="color:#9f7aea" href="/dashboard/">بازگشت به پنل</a></p></body></html>').encode()
sys.path.insert(0, "/code")

try:
    import io, segno  # QR codes for the subscription page
except Exception:
    segno = None
from passlib.context import CryptContext
from app.db import GetDB
from app.db.models import Admin

PANEL = "http://127.0.0.1:8000"
SYSTEM = "jinx-system"
USER_RE = re.compile(r"^[A-Za-z0-9_.@-]{3,32}$")
DOMAIN_RE = re.compile(r"^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$")

def clean_domain(v):
    """'https://Panel.Example.com/agent/' -> 'panel.example.com' ('' = this panel's own address)"""
    v = str(v or "").strip().lower()
    v = re.sub(r"^[a-z]+://", "", v).split("/")[0].split("?")[0].split("#")[0].strip().rstrip(".")
    if v.count(":") == 1:                       # host:443 -> host (a port is never needed on Railway)
        h, _, pt = v.partition(":")
        if pt.isdigit():
            v = h
    if v and not DOMAIN_RE.match(v):
        raise ValueError("bad_domain")
    return v

def panel_domains():
    """every address this service answers on (Railway domain, custom domain, extra mirror domains, tunnel)"""
    env = os.environ
    out = [env.get("PANEL_DOMAIN", ""), env.get("RAILWAY_PUBLIC_DOMAIN", "")]
    out += [x for x in re.split(r"[\s,]+", env.get("JINX_EXTRA_DOMAINS", "")) if x]
    if env.get("CF_TUNNEL_TOKEN"):
        out.append(env.get("CF_TUNNEL_HOSTNAME", ""))
    res = []
    for d in out:
        try:
            d = clean_domain(d)
        except ValueError:
            continue
        if d and d not in res:
            res.append(d)
    return res
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
fails, lock = {}, threading.Lock()

def panel_login(username, password):
    data = urllib.parse.urlencode({"username": username, "password": password, "grant_type": "password"}).encode()
    try:
        r = urllib.request.urlopen(urllib.request.Request(PANEL + "/api/admin/token", data=data), timeout=10)
        return json.loads(r.read()).get("access_token")
    except urllib.error.HTTPError as e:
        if e.code in (400, 401, 403, 422):
            return None
        raise PanelDown()          # 5xx = panel trouble, never counted as a wrong password
    except Exception:
        raise PanelDown()

class PanelDown(Exception):
    pass

def client_ip(headers, peer):
    """real visitor ip. nginx overwrites every X-Jinx-* header, so a browser can't fake them:
       via the Cloudflare tunnel -> CF-Connecting-IP; via Railway -> X-Real-IP (set by Railway's edge),
       else the first X-Forwarded-For entry (Railway rebuilds that header, the visitor is leftmost)"""
    remote = (headers.get("X-Jinx-Remote") or peer or "").strip()
    cf = (headers.get("X-Jinx-CF") or "").strip()
    real = (headers.get("X-Jinx-Real") or "").strip()
    xff = [x.strip() for x in (headers.get("X-Jinx-XFF") or "").split(",") if x.strip()]
    if cf and remote in ("127.0.0.1", "::1"):
        return cf
    return real or (xff[0] if xff else "") or remote or "?"

def blocked(ip):
    with lock:
        f = [t for t in fails.get(ip, []) if time.time() - t < 300]
        fails[ip] = f
        return len(f) >= 5

def failed(ip):
    with lock:
        now = time.time()
        if len(fails) > 5000:      # never grows without limit
            for k in [k for k, v in fails.items() if not v or now - v[-1] >= 300]:
                fails.pop(k, None)
        fails.setdefault(ip, []).append(now)

def change(body, _ip=None):
    cu = str(body.get("current_username", "")).strip()
    cp = str(body.get("current_password", ""))
    nu = str(body.get("new_username", "")).strip() or cu
    np = str(body.get("new_password", ""))
    if not cu or not cp:
        return 400, "current_required"
    key = cu.lower()
    if blocked(key):
        return 429, "too_many"
    if cu == SYSTEM or nu == SYSTEM:
        return 403, "reserved"
    try:
        ok_login = panel_login(cu, cp)
    except PanelDown:
        return 503, "network"
    if not ok_login:
        failed(key)
        return 401, "wrong_current"
    if not USER_RE.match(nu):
        return 400, "bad_username"
    if not np:
        return 400, "password_required"
    if len(np.encode("utf-8")) > 72:
        return 400, "password_too_long"
    with GetDB() as db:
        a = db.query(Admin).filter(Admin.username == cu).first()
        if a is None:
            return 404, "not_found"
        if nu != cu and db.query(Admin).filter(Admin.username == nu).first() is not None:
            return 409, "username_taken"
        try:
            a.username = nu
            a.hashed_password = pwd.hash(np)          # role is NOT touched: a reseller stays a reseller
            if hasattr(a, "password_reset_at"):
                a.password_reset_at = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)  # whole second: tokens issued right after stay valid
            db.commit()
        except Exception:
            db.rollback()
            raise
    tok = None
    for _ in range(3):
        try:
            tok = panel_login(nu, np)
        except PanelDown:
            tok = None
        if tok:
            break
        time.sleep(0.5)
    if nu != cu:                                   # a renamed reseller keeps its limits
        try:
            with rs_lock:
                d = rs_load()
                if cu in d:
                    d[nu] = d.pop(cu); rs_save(d)
        except Exception as e:
            print(f"[account] reseller rename error: {e}", flush=True)
    print(f"[account] admin '{cu}' -> '{nu}' updated", flush=True)
    return 200, {"ok": True, "username": nu, "access_token": tok}


# =====================================================================================================
# 🤝 Reseller panels (پنل‌های نمایندگی)
# A reseller is a normal (non-sudo) Marzban admin: same panel, same login page, sees ONLY its own users.
# Limits are enforced here, in front of the panel API (nginx sends the few write calls through us):
#   max_users  - how many users it may have            (0 = unlimited)
#   quota      - total data it may sell, in bytes       (0 = unlimited)
#                charge = sum(max(limit, used)) of its users + traffic of deleted/reset users ("burned")
#   expire     - unix time the reseller panel stops     (0 = never)
#   enabled    - off = cannot log in, sessions are closed at once
# =====================================================================================================
import os, shutil
RS_FILE = "/var/lib/marzban/jinx_resellers.json"
rs_lock = threading.RLock()
GB = 1073741824

class StoreBroken(Exception):
    pass

def rs_load():
    """agency data; a corrupt file is NEVER treated as empty (that would erase every agency on the next save)"""
    for path in (RS_FILE, RS_FILE + ".bak"):
        try:
            d = json.load(open(path, encoding="utf-8"))
        except FileNotFoundError:
            continue
        except Exception:
            print(f"[reseller] {path} is unreadable, trying the backup", flush=True)
            continue
        if isinstance(d, dict) and all(isinstance(v, dict) for v in d.values()):
            if path != RS_FILE:
                print("[reseller] restored agency data from the backup copy", flush=True)
            return d
    if os.path.exists(RS_FILE) or os.path.exists(RS_FILE + ".bak"):
        raise StoreBroken("agency data unreadable")
    return {}

def rs_save(d):
    """atomic write of the data file AND of an identical backup copy (both always hold the latest good state)"""
    body = json.dumps(d, ensure_ascii=False, indent=1)
    for path in (RS_FILE, RS_FILE + ".bak"):
        tmp = path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(body); f.flush(); os.fsync(f.fileno())
        os.replace(tmp, path)
        try:
            os.chmod(path, 0o600)
        except OSError:
            pass

def rs_meta(d, name):
    m = d.get(name) or {}
    return {"title": str(m.get("title") or "")[:40], "max_users": int(m.get("max_users") or 0), "quota": int(m.get("quota") or 0), "expire": int(m.get("expire") or 0),
            "enabled": m.get("enabled", True) is not False, "note": str(m.get("note") or "")[:200],
            "burned": int(m.get("burned") or 0), "created": int(m.get("created") or 0), "killed": bool(m.get("killed")),
            "domain": str(m.get("domain") or "")[:253]}

def rs_state(m, now=None):
    now = now or time.time()
    if not m["enabled"]:
        return "disabled"
    if m["expire"] and m["expire"] <= now:
        return "expired"
    return "active"

def now_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)

_who_cache = {}
def who(auth):
    """Admin behind a dashboard token, asked from the panel itself (cached 20s)."""
    if not auth or not auth.lower().startswith("bearer "):
        return None
    hit = _who_cache.get(auth)
    if hit and time.time() - hit[0] < 20:
        return hit[1]
    try:
        r = urllib.request.urlopen(urllib.request.Request(PANEL + "/api/admin", headers={"Authorization": auth}), timeout=8)
        a = json.loads(r.read())
        res = {"username": a.get("username"), "is_sudo": bool(a.get("is_sudo"))} if a and a.get("username") else None
    except Exception:
        res = None
    if len(_who_cache) > 500:
        _who_cache.clear()
    _who_cache[auth] = (time.time(), res)
    return res

def user_cols():
    from app.db.models import User
    return User

def usage_of(db, admin):
    """users, charge (bytes), used (bytes) of one admin, straight from the database"""
    User = user_cols()
    rows = db.query(User).filter(User.admin_id == admin.id).all()
    used = sum(int(getattr(u, "used_traffic", 0) or 0) for u in rows)
    charge = sum(max(int(u.data_limit or 0), int(getattr(u, "used_traffic", 0) or 0)) for u in rows)
    unlimited = sum(1 for u in rows if not u.data_limit)
    return {"users": len(rows), "used": used, "charge": charge, "unlimited": unlimited}

def kill_sessions(db, admin, strict=False):
    """close every open session of this admin.
    strict (disable / expire): one second ahead, so even a token from this very second dies (login is blocked anyway).
    normal (new password / rename): the current whole second, so the login made right after works at once."""
    if hasattr(admin, "password_reset_at"):
        from datetime import timedelta
        admin.password_reset_at = now_naive() + (timedelta(seconds=1) if strict else timedelta(0))

def rs_list(caller):
    out = []
    with rs_lock, GetDB() as db:
        d = rs_load()
        for a in db.query(Admin).filter(Admin.is_sudo == False).all():  # noqa: E712
            if a.username == SYSTEM:
                continue
            m = rs_meta(d, a.username); u = usage_of(db, a)
            out.append({"username": a.username, "title": str((d.get(a.username) or {}).get("title") or ""), "state": rs_state(m), "max_users": m["max_users"], "quota": m["quota"],
                        "expire": m["expire"], "note": m["note"], "domain": m["domain"], "users": u["users"], "used": u["used"],
                        "charge": u["charge"] + m["burned"], "created": m["created"] or int(a.created_at.timestamp()) if getattr(a, "created_at", None) else m["created"]})
    out.sort(key=lambda x: x["username"].lower())
    return 200, {"ok": True, "resellers": out, "now": int(time.time()), "domains": panel_domains()}

MIN_CAPACITY = 10

def rs_clean(body, creating):
    def num(k, lo=0, hi=10 ** 15):
        try:
            v = float(body.get(k) or 0)
        except Exception:
            raise ValueError("bad_number")
        if v != v or v < lo or v > hi:          # NaN / range
            raise ValueError("bad_number")
        return v
    has = lambda k: creating or k in body        # an edit only changes the fields it really sent
    f = {}
    if has("max_users"):
        mu = num("max_users", 0, 100000)
        if mu % 1:
            raise ValueError("bad_number")
        if 0 < mu < MIN_CAPACITY:
            raise ValueError("min_capacity")
        f["max_users"] = int(mu)
    if has("quota_gb"):
        qgb = num("quota_gb", 0, 10 ** 6)
        if 0 < qgb < 1 / 1024:                  # anything from 1 MB up; tiny values never silently become "unlimited"
            raise ValueError("min_quota")
        f["quota"] = int(round(qgb * GB))
    if has("note"):
        f["note"] = str(body.get("note") or "").strip()[:200]
    if has("title"):
        f["title"] = str(body.get("title") or "").strip()[:40]
    if has("expire"):
        exp = body.get("expire")
        f["expire"] = int(num("expire", 0, 4102444800)) if exp not in (None, "") else 0
    if has("domain"):
        f["domain"] = clean_domain(body.get("domain"))
    if "enabled" in body:
        f["enabled"] = bool(body.get("enabled"))
    return f

def rs_log(d, name, actor, text):
    """per-agency activity history (newest 80 kept, shown in the panel)"""
    if name in d:
        lg = d[name].setdefault("log", [])
        lg.append({"t": int(time.time()), "by": actor, "x": str(text)[:160]})
        del lg[:-80]

def rs_create(caller, body):
    nu = str(body.get("username", "")).strip(); np = str(body.get("password", ""))
    if not USER_RE.match(nu):
        return 400, "bad_username"
    if nu == SYSTEM:
        return 403, "reserved"
    if not np:
        return 400, "password_required"
    if len(np.encode("utf-8")) > 72:
        return 400, "password_too_long"
    try:
        f = rs_clean(body, True)
    except ValueError as e:
        return 400, str(e)
    with rs_lock, GetDB() as db:
        if db.query(Admin).filter(Admin.username == nu).first() is not None:
            return 409, "username_taken"
        d = rs_load(); f.update(enabled=f.get("enabled", True), burned=0, created=int(time.time()), by=caller["username"], killed=False)
        d[nu] = f; rs_log(d, nu, caller["username"], "create"); rs_save(d)
        try:
            db.add(Admin(username=nu, hashed_password=pwd.hash(np), is_sudo=False))
            db.commit()
        except Exception:
            db.rollback(); d.pop(nu, None); rs_save(d)
            raise
    print(f"[reseller] '{caller['username']}' created reseller '{nu}'", flush=True)
    return 200, {"ok": True, "username": nu}

def rs_update(caller, name, body):
    try:
        f = rs_clean(body, False)
    except ValueError as e:
        return 400, str(e)
    np = str(body.get("password") or "")
    if np and len(np.encode("utf-8")) > 72:
        return 400, "password_too_long"
    nn = str(body.get("new_username") or "").strip() or name
    if nn != name and not USER_RE.match(nn):
        return 400, "bad_username"
    if nn == SYSTEM:
        return 403, "reserved"
    with rs_lock, GetDB() as db:
        a = db.query(Admin).filter(Admin.username == name).first()
        if a is None or a.is_sudo or name == SYSTEM:
            return 404, "not_found"
        if nn != name and db.query(Admin).filter(Admin.username == nn).first() is not None:
            return 409, "username_taken"
        d = rs_load(); m = rs_meta(d, name); old = dict(m); m.update(f)
        notes = []
        if np:
            a.hashed_password = pwd.hash(np); kill_sessions(db, a); notes.append("password")
        if nn != name:
            a.username = nn; kill_sessions(db, a); notes.append("rename:" + name + ">" + nn)
        if rs_state(m) != "active":
            kill_sessions(db, a, strict=True); m["killed"] = True
        else:
            m["killed"] = False
        for k in ("max_users", "quota", "expire", "enabled", "title", "note", "domain"):
            if old.get(k) != m.get(k):
                notes.append(k)
        before = json.loads(json.dumps(d))
        rec = dict(d.pop(name, None) or {}, **m)
        d[nn] = rec
        rs_log(d, nn, caller["username"], "update:" + ",".join(notes) if notes else "update")
        rs_save(d)
        try:
            db.commit()
        except Exception:
            db.rollback(); rs_save(before)
            raise
    _who_cache.clear()
    print(f"[reseller] '{caller['username']}' updated reseller '{name}'" + (f" -> '{nn}'" if nn != name else ""), flush=True)
    return 200, {"ok": True, "username": nn}

def rs_charge(caller, name, body):
    """quick charge / renew: add (or remove) data, days and users in one atomic step"""
    def num(k, lo, hi):
        try:
            v = float(body.get(k) or 0)
        except Exception:
            raise ValueError("bad_number")
        if v != v or v < lo or v > hi:
            raise ValueError("bad_number")
        return v
    try:
        ag, ad, au = num("add_gb", -10 ** 6, 10 ** 6), num("add_days", -36500, 36500), num("add_users", -100000, 100000)
    except ValueError as e:
        return 400, str(e)
    if ad % 1 or au % 1:
        return 400, "bad_number"
    with rs_lock, GetDB() as db:
        a = db.query(Admin).filter(Admin.username == name).first()
        if a is None or a.is_sudo or name == SYSTEM:
            return 404, "not_found"
        d = rs_load(); m = rs_meta(d, name); t = int(time.time()); notes = []
        if ag:
            if not m["quota"]:
                return 400, "unlimited_quota"
            q = m["quota"] + int(round(ag * GB))
            if q < GB // 1024:                           # at least 1 MB left (0 would mean "unlimited")
                return 400, "min_quota"
            m["quota"] = q; notes.append(("+" if ag > 0 else "-") + size_txt(abs(int(round(ag * GB)))).replace(" ", ""))
        if ad:
            if not m["expire"]:
                return 400, "unlimited_time"
            base = max(m["expire"], t) if ad > 0 else m["expire"]      # an expired panel is renewed from today
            e = base + int(ad) * 86400
            if e <= t:
                return 400, "bad_number"
            m["expire"] = e; notes.append(("+" if ad > 0 else "") + "%dd" % ad)
        if au:
            if not m["max_users"]:
                return 400, "unlimited_users"
            mu = m["max_users"] + int(au)
            if mu < MIN_CAPACITY:
                return 400, "min_capacity"
            m["max_users"] = mu; notes.append(("+" if au > 0 else "") + "%du" % au)
        if not notes:
            return 400, "nothing"
        m["killed"] = rs_state(m) != "active"
        if m["killed"]:
            kill_sessions(db, a, strict=True)
        db.commit()
        d[name] = dict(d.get(name) or {}, **m)
        d[name].get("alerts", {}).clear()                 # fresh alerts after a charge
        rs_log(d, name, caller["username"], "charge:" + " ".join(notes))
        rs_save(d)
    _who_cache.clear()
    print(f"[reseller] '{caller['username']}' charged '{name}': {' '.join(notes)}", flush=True)
    return 200, {"ok": True}

def rs_history(name):
    d = rs_load()
    if name not in d:
        return 404, "not_found"
    return 200, {"ok": True, "log": list(reversed((d[name].get("log") or [])[-80:]))}

def rs_delete(caller, name):
    with rs_lock, GetDB() as db:
        a = db.query(Admin).filter(Admin.username == name).first()
        if a is None or a.is_sudo or name == SYSTEM:
            return 404, "not_found"
        me = db.query(Admin).filter(Admin.username == caller["username"]).first()
        User = user_cols(); moved = 0
        for u in db.query(User).filter(User.admin_id == a.id).all():   # users are kept: moved to you
            u.admin_id = me.id if me else None; moved += 1
        db.delete(a); db.commit()
        d = rs_load(); d.pop(name, None); rs_save(d)
    _who_cache.clear()
    print(f"[reseller] '{caller['username']}' deleted reseller '{name}', {moved} users moved", flush=True)
    return 200, {"ok": True, "moved": moved}

def rs_me(caller):
    with rs_lock, GetDB() as db:
        a = db.query(Admin).filter(Admin.username == caller["username"]).first()
        if a is None:
            return 404, "not_found"
        d = rs_load(); m = rs_meta(d, a.username); u = usage_of(db, a)
    return 200, {"ok": True, "username": a.username, "sudo": bool(a.is_sudo), "reseller": (not a.is_sudo) and a.username in d,
                 "state": rs_state(m), "max_users": m["max_users"], "quota": m["quota"], "expire": m["expire"], "domain": m["domain"],
                 "users": u["users"], "used": u["used"], "charge": u["charge"] + m["burned"]}

TG_TOKEN, TG_CHAT = os.environ.get("DOCTOR_TG_TOKEN"), os.environ.get("DOCTOR_TG_CHAT")

def notify(msg):
    """alert to the admin's Telegram (same bot as JinX Doctor); never blocks or breaks the service"""
    print(f"[alert] {msg}", flush=True)
    if not (TG_TOKEN and TG_CHAT):
        return
    def go():
        try:
            urllib.request.urlopen(f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
                urllib.parse.urlencode({"chat_id": TG_CHAT, "text": "🤝 Super JinX | نمایندگی\n" + msg}).encode(), timeout=10)
        except Exception:
            pass
    threading.Thread(target=go, daemon=True).start()

def rs_alerts():
    """capacity alerts for every agency, each sent once until the situation changes"""
    with rs_lock, GetDB() as db:
        d = rs_load(); dirty = False
        for name in list(d):
            a = db.query(Admin).filter(Admin.username == name).first()
            if a is None or a.is_sudo:
                continue
            m = rs_meta(d, name); u = usage_of(db, a); charge = u["charge"] + m["burned"]
            sent = d[name].setdefault("alerts", {})
            cond = {
                "expired": rs_state(m) == "expired",
                "expire_soon": rs_state(m) == "active" and m["expire"] and 0 < m["expire"] - time.time() < 3 * 86400,
                "quota_full": bool(m["quota"]) and charge >= m["quota"],
                "quota_low": bool(m["quota"]) and m["quota"] * 0.9 <= charge < m["quota"],
                "users_full": bool(m["max_users"]) and u["users"] >= m["max_users"],
            }
            text = {
                "expired": f"⛔ اعتبار پنل نمایندگی «{name}» تمام شد و نماینده از پنل خارج شد.",
                "expire_soon": f"⏳ اعتبار پنل نمایندگی «{name}» کمتر از 3 روز دیگر تمام می‌شود.",
                "quota_full": f"📦 حجم پنل نمایندگی «{name}» تمام شد ({size_txt(charge)} از {size_txt(m['quota'])}). ساخت کاربر جدید بسته شد.",
                "quota_low": f"📦 بیش از 90% حجم پنل نمایندگی «{name}» مصرف شده ({size_txt(charge)} از {size_txt(m['quota'])}).",
                "users_full": f"👥 سقف کاربران پنل نمایندگی «{name}» پر شد ({u['users']} از {m['max_users']}).",
            }
            for k, on in cond.items():
                if on and not sent.get(k):
                    notify(text[k]); sent[k] = int(time.time()); dirty = True
                elif not on and sent.get(k):
                    sent.pop(k, None); dirty = True
        if dirty:
            rs_save(d)

def rs_watch():
    """every 30s: an expired reseller is logged out everywhere (once)"""
    while True:
        time.sleep(30)
        try:
            if int(time.time()) % 300 < 30:          # capacity alerts every ~5 minutes
                rs_alerts()
        except Exception as e:
            print(f"[reseller] alert error: {e}", flush=True)
        try:
            with rs_lock:
                d = rs_load(); dirty = False
                for name in list(d):
                    m = rs_meta(d, name)
                    if rs_state(m) != "active" and not m["killed"]:
                        with GetDB() as db:
                            a = db.query(Admin).filter(Admin.username == name).first()
                            if a is not None and not a.is_sudo:
                                kill_sessions(db, a, strict=True); db.commit()
                        d[name]["killed"] = True; dirty = True
                        print(f"[reseller] '{name}' is {rs_state(m)} -> logged out", flush=True)
                if dirty:
                    rs_save(d)
            _who_cache.clear()
        except Exception as e:
            print(f"[reseller] watch error: {e}", flush=True)

# ---------- gate: the few panel API calls that need the reseller limits ----------
MSG = {"disabled": "پنل نمایندگی شما غیرفعال است. با مدیر تماس بگیرید.",
       "expired": "اعتبار پنل نمایندگی شما به پایان رسیده است. برای تمدید با مدیر تماس بگیرید.",
       "max_users": "سقف تعداد کاربران پنل نمایندگی شما پر شده است ({n} کاربر).",
       "unlimited": "در پنل نمایندگی، ساخت کاربر با حجم نامحدود مجاز نیست. حجم کاربر را مشخص کنید.",
       "quota": "حجم باقی‌مانده‌ی پنل نمایندگی شما کافی نیست. باقی‌مانده: {left}"}

def gb(b):
    v = b / GB
    return ("%.2f" % v).rstrip("0").rstrip(".") if v < 100 else "%d" % v

def size_txt(b):
    """traffic as people read it: 300 MB, 1.5 GB, 2 TB"""
    b = max(0, int(b or 0))
    if b < GB:
        return "%d MB" % round(b / 1048576)
    if b >= 1024 * GB:
        return gb(b / 1024) + " TB"
    return gb(b) + " GB"

def reseller_of(auth):
    """(admin_name, meta) when the caller is a LIMITED reseller, else None"""
    w = who(auth)
    if not w or w["is_sudo"]:
        return None
    d = rs_load()
    if w["username"] not in d:
        return None
    return w["username"], rs_meta(d, w["username"])

# ---------- login brute-force guard: 10 failed logins in 5 minutes per IP or per username -> wait ----------
_lf, _lfl = {}, threading.Lock()
def login_keys(body, ip):
    try:
        name = urllib.parse.parse_qs(body.decode("utf-8", "ignore")).get("username", [""])[0].strip().lower()
    except Exception:
        name = ""
    return ["ip:" + (ip or "?"), "u:" + name]
LOGIN_MAX, LOGIN_WINDOW = 10, 300

def login_wait(keys):
    """seconds until login is open again (0 = open). Locked while 10 failures fall inside the last 5 minutes."""
    with _lfl:
        t = time.time(); wait = 0
        for k in keys:
            f = _lf[k] = [x for x in _lf.get(k, []) if t - x < LOGIN_WINDOW]
            if len(f) >= LOGIN_MAX:
                wait = max(wait, f[-LOGIN_MAX] + LOGIN_WINDOW - t)
        if len(_lf) > 5000:
            _lf.clear()
    return int(wait + 0.999)

def login_left(keys):
    with _lfl:
        t = time.time()
        return max(0, LOGIN_MAX - max([len([x for x in _lf.get(k, []) if t - x < LOGIN_WINDOW]) for k in keys] or [0]))

def login_ok(keys):
    with _lfl:
        for k in keys:
            if k.startswith("u:"):
                _lf.pop(k, None)          # a correct password clears that account's counter

def login_blocked(keys):
    return login_wait(keys) > 0

_lf_alerted = {}
def login_failed(keys):
    with _lfl:
        for k in keys:
            _lf.setdefault(k, []).append(time.time())
            if len(_lf[k]) >= 10 and time.time() - _lf_alerted.get(k, 0) > 1800:
                _lf_alerted[k] = time.time()
                who_ = k.split(":", 1)[1] or "?"
                notify(("🔐 10 رمز اشتباه پشت سر هم برای نام کاربری «%s». ورود 5 دقیقه بسته شد." if k.startswith("u:") else "🔐 10 تلاش ورود ناموفق از IP %s. ورود 5 دقیقه بسته شد.") % who_)

def gate_check(method, path, auth, body):
    """None = allowed; otherwise (status, detail) shown by the panel as its normal error toast"""
    if path == "/api/admin/token" and method == "POST":
        try:
            name = urllib.parse.parse_qs(body.decode("utf-8", "ignore")).get("username", [""])[0]
        except Exception:
            name = ""
        d = rs_load()
        if name in d:
            st = rs_state(rs_meta(d, name))
            if st != "active":
                return 403, MSG[st]
        return None
    r = reseller_of(auth)
    if not r:
        return None
    name, m = r
    st = rs_state(m)
    if st != "active" and method != "GET":
        return 403, MSG[st]
    if not (path == "/api/user" and method == "POST") and not (re.match(r"^/api/user/[^/]+$", path) and method == "PUT"):
        return None
    try:
        data = json.loads(body.decode("utf-8") or "{}")
    except Exception:
        return None                                   # let the panel answer with its own validation error
    if not isinstance(data, dict):
        return None
    with GetDB() as db:
        a = db.query(Admin).filter(Admin.username == name).first()
        if a is None:
            return None
        u = usage_of(db, a)
        cur = None
        if method == "PUT":
            User = user_cols()
            cur = db.query(User).filter(User.username == path.rsplit("/", 1)[1], User.admin_id == a.id).first()
            if cur is None:
                return None                           # not its user: the panel itself refuses
    if method == "POST" and m["max_users"] and u["users"] >= m["max_users"]:
        return 403, MSG["max_users"].format(n=m["max_users"])
    if m["quota"] and (method == "POST" or "data_limit" in data):
        try:
            new = int(float(data.get("data_limit") or 0))
        except (TypeError, ValueError):
            return None                               # not a number: the panel shows its own validation error
        if new <= 0:
            return 403, MSG["unlimited"]
        charge = u["charge"] + m["burned"]
        if cur is not None:
            charge -= max(int(cur.data_limit or 0), int(getattr(cur, "used_traffic", 0) or 0))
            new = max(new, int(getattr(cur, "used_traffic", 0) or 0))
        if charge + new > m["quota"]:
            return 403, MSG["quota"].format(left=size_txt(max(0, m["quota"] - charge)))
    return None

def gate_after(method, path, auth, status):
    """traffic of a deleted or reset user stays charged to its reseller"""
    return

def burn_before(method, path, auth):
    """remember the used traffic of a user that a limited reseller deletes / resets"""
    if not ((method == "DELETE" and re.match(r"^/api/user/[^/]+$", path)) or (method == "POST" and re.match(r"^/api/user/[^/]+/reset$", path))):
        return None
    r = reseller_of(auth)
    if not r or not r[1]["quota"]:
        return None
    uname = path.split("/")[3]
    with GetDB() as db:
        a = db.query(Admin).filter(Admin.username == r[0]).first()
        User = user_cols()
        u = db.query(User).filter(User.username == uname, User.admin_id == a.id).first() if a else None
        return (r[0], int(getattr(u, "used_traffic", 0) or 0)) if u else None

def burn_commit(b):
    if not b or not b[1]:
        return
    with rs_lock:
        d = rs_load()
        if b[0] in d:
            d[b[0]]["burned"] = int(d[b[0]].get("burned") or 0) + b[1]; rs_save(d)

_alocks, _alocks_l = {}, threading.Lock()
def agency_lock(name):
    with _alocks_l:
        return _alocks.setdefault(name, threading.Lock())

HOP = {"connection", "keep-alive", "transfer-encoding", "content-length", "content-encoding", "upgrade", "te", "trailer", "proxy-authorization", "proxy-authenticate"}
class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass
    def static_page(self, files, ctype, fallback):
        """first readable file wins; never an error page"""
        b = None
        for f in files:
            try:
                d = open(f, "rb").read()
                if d and (not ctype.startswith("text/html") or b"</html>" in d):
                    b = d; break
            except Exception:
                pass
        b = b or fallback
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def send(self, code, obj):
        b = json.dumps(obj if isinstance(obj, dict) else {"ok": False, "error": obj}, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def body(self, limit=1048576):
        n = int(self.headers.get("Content-Length") or 0)
        if n < 0 or n > limit:
            raise ValueError("too_big")
        return self.rfile.read(n) if n else b""

    # ---------- transparent gate in front of a few panel API calls ----------
    def gate(self, method):
        path = self.path.partition("?")[0]
        try:
            raw = self.body()
        except ValueError:
            return self.send(413, {"detail": "request too large"})
        auth = self.headers.get("Authorization") or ""
        is_login = path == "/api/admin/token" and method == "POST"
        if is_login:
            ip = self.client_ip()
            lk = login_keys(raw, ip)
            wait = login_wait(lk)
            if wait:
                return self.send_locked(wait)
        guard = None
        if method in ("POST", "PUT", "DELETE") and not is_login:
            try:
                r0 = reseller_of(auth)
                if r0:
                    guard = agency_lock(r0[0]); guard.acquire()   # one write at a time per agency: no race past the limits
            except StoreBroken:
                return self.send(503, {"detail": "اطلاعات نمایندگی موقتاً در دسترس نیست. چند لحظه دیگر دوباره امتحان کنید."})
            except Exception as e:
                print(f"[gate] lock error: {e}", flush=True)
                return self.send(503, {"detail": "اطلاعات نمایندگی موقتاً در دسترس نیست. چند لحظه دیگر دوباره امتحان کنید."})
        try:
            return self._gate(method, path, raw, auth, is_login, lk if is_login else None)
        finally:
            if guard:
                guard.release()

    def _gate(self, method, path, raw, auth, is_login, lk):
        try:
            deny = gate_check(method, path, auth, raw)
        except StoreBroken:
            deny = (503, "اطلاعات نمایندگی موقتاً در دسترس نیست. چند لحظه دیگر دوباره امتحان کنید.") if not is_login else None
        except Exception as e:
            print(f"[gate] check error: {e}", flush=True)
            deny = None if is_login else (503, "اطلاعات نمایندگی موقتاً در دسترس نیست. چند لحظه دیگر دوباره امتحان کنید.")
        if deny:
            return self.send(deny[0], {"detail": deny[1]})
        burn = None
        try:
            burn = burn_before(method, path, auth)
        except Exception as e:
            print(f"[gate] burn error: {e}", flush=True)
            if not is_login and method in ("DELETE", "POST") and re.match(r"^/api/user/[^/]+(/reset)?$", path):
                return self.send(503, {"detail": "اطلاعات نمایندگی موقتاً در دسترس نیست. چند لحظه دیگر دوباره امتحان کنید."})
        hdr = {k: v for k, v in self.headers.items() if k.lower() not in HOP and k.lower() != "accept-encoding"}   # plain body, never a gzip mismatch
        req = urllib.request.Request(PANEL + self.path, data=raw if raw else None, headers=hdr, method=method)
        try:
            r = urllib.request.urlopen(req, timeout=60); code, rh, rb = r.status, r.headers, r.read()
        except urllib.error.HTTPError as he:
            code, rh, rb = he.code, he.headers, he.read()
        except Exception as e:
            print(f"[gate] panel unreachable: {e}", flush=True)
            return self.send(502, {"detail": "پنل موقتاً در دسترس نیست. چند لحظه دیگر دوباره امتحان کنید."})
        extra = {}
        if is_login and code == 401:
            login_failed(lk)
            wait = login_wait(lk)
            if wait:
                return self.send_locked(wait)
            extra["X-Jinx-Attempts-Left"] = str(login_left(lk))
        elif is_login and 200 <= code < 300:
            login_ok(lk)
        if 200 <= code < 300 and not is_login and method in ("POST", "PUT", "DELETE"):
            try:
                r1 = reseller_of(auth)
                if r1:
                    m_ = re.match(r"^/api/user(?:/([^/]+))?(/reset|/revoke_sub)?$", path)
                    if m_:
                        uname = m_.group(1)
                        if not uname and method == "POST":
                            try:
                                uname = json.loads(raw.decode("utf-8") or "{}").get("username")
                            except Exception:
                                uname = "?"
                        act = {"POST": "user+", "PUT": "user~", "DELETE": "user-"}[method] if not m_.group(2) else "user" + m_.group(2).replace("/", ":")
                        with rs_lock:
                            d_ = rs_load(); rs_log(d_, r1[0], r1[0], f"{act}{uname}"); rs_save(d_)
            except Exception as e:
                print(f"[gate] activity log error: {e}", flush=True)
        if 200 <= code < 300 and burn:
            try:
                burn_commit(burn)
            except Exception as e:
                print(f"[gate] burn commit error: {e}", flush=True)
        self.send_response(code)
        for k, v in rh.items():
            if k.lower() not in HOP and k.lower() not in ("date", "server"):
                self.send_header(k, v)
        for k, v in extra.items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(rb)))
        self.end_headers()
        self.wfile.write(rb)

    def send_locked(self, wait):
        """429 with the exact time left; the dashboard shows its lock screen from this"""
        b = json.dumps({"detail": f"به دلیل {LOGIN_MAX} تلاش ناموفق، ورود موقتاً قفل شد. {wait} ثانیه دیگر دوباره امتحان کنید.",
                        "locked": True, "retry_after": wait, "locked_until": int(time.time()) + wait, "max": LOGIN_MAX,
                        "window": LOGIN_WINDOW}, ensure_ascii=False).encode()
        self.send_response(429)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Retry-After", str(wait))
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def client_ip(self):
        return client_ip(self.headers, self.client_address[0])

    # ---------- reseller management (sudo only) + /me ----------
    def caller(self, sudo=True):
        w = who(self.headers.get("Authorization") or "")
        if not w:
            self.send(401, "login_required"); return None
        if sudo and not w["is_sudo"]:
            self.send(403, "sudo_only"); return None
        return w
    def resellers(self, method, path):
        tail = path.split("/resellers", 1)[1].strip("/")
        c = self.caller(True)
        if not c:
            return
        body = {}
        if method in ("POST", "PUT"):
            try:
                body = json.loads(self.body(65536).decode("utf-8") or "{}")
            except ValueError:
                return self.send(400, "bad_request")
            if not isinstance(body, dict):
                return self.send(400, "bad_request")
        if method == "GET" and not tail:
            return self.send(*rs_list(c))
        if method == "POST" and not tail:
            return self.send(*rs_create(c, body))
        parts = [urllib.parse.unquote(x) for x in tail.split("/")] if tail else []
        if len(parts) == 2 and parts[1] == "charge" and method == "POST":
            return self.send(*rs_charge(c, parts[0], body))
        if len(parts) == 2 and parts[1] == "history" and method == "GET":
            return self.send(*rs_history(parts[0]))
        if len(parts) != 1 and tail:
            return self.send(404, "not_found")
        if method == "PUT" and tail:
            return self.send(*rs_update(c, parts[0], body))
        if method == "DELETE" and tail:
            return self.send(*rs_delete(c, parts[0]))
        return self.send(404, "not_found")

    def dispatch(self, method):
        path, _, query = self.path.partition("?")
        try:
            if path.startswith("/api/"):
                return self.gate(method)
            p = path.rstrip("/")
            if method == "GET" and p.endswith("/donate-page"):
                return self.static_page(DON_FILES, "text/html; charset=utf-8", DON_FALLBACK)
            if method == "GET" and p.endswith("/donate-config.js"):
                return self.static_page(DONCFG_FILES, "application/javascript; charset=utf-8", b"/* donate config missing */")
            if method == "GET" and p.endswith("/health"):
                return self.send(200, {"ok": True})
            if method == "GET" and p.endswith("/qr"):
                return self.qr(urllib.parse.parse_qs(query).get("d", [""])[0])
            if method == "POST" and p.endswith("/account"):
                return self.account()
            if method == "GET" and p.endswith("/lock-status"):
                u = urllib.parse.parse_qs(query).get("u", [""])[0][:64]
                keys = ["ip:" + self.client_ip()] + (["u:" + u.strip().lower()] if u.strip() else [])
                w = login_wait(keys)
                return self.send(200, {"ok": True, "locked": w > 0, "retry_after": w, "locked_until": int(time.time()) + w if w else 0,
                                       "left": login_left(keys), "max": LOGIN_MAX, "window": LOGIN_WINDOW})
            if method == "GET" and p.endswith("/me"):
                c = self.caller(False)
                return c and self.send(*rs_me(c))
            if "/resellers" in p:
                return self.resellers(method, p)
            return self.send(404, "not_found")
        except Exception as e:
            print(f"[jinx-api] error: {e}", flush=True)
            try:
                self.send(500, "server_error")
            except Exception:
                pass
    def do_GET(self): self.dispatch("GET")
    def do_POST(self): self.dispatch("POST")
    def do_PUT(self): self.dispatch("PUT")
    def do_DELETE(self): self.dispatch("DELETE")
    def do_PATCH(self): self.dispatch("PATCH")

    def qr(self, data):
        if segno is None or not data or len(data) > 3000:
            return self.send(404, "qr_unavailable")
        try:
            buf = io.BytesIO()
            segno.make(data, error="m").save(buf, kind="svg", scale=8, border=2, dark="#111111", light="#ffffff")
            b = buf.getvalue()
        except Exception:
            return self.send(400, "qr_failed")
        self.send_response(200)
        self.send_header("Content-Type", "image/svg+xml")
        self.send_header("Cache-Control", "private, max-age=3600")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def account(self):
        ip = self.client_ip()
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return self.send(400, "bad_request")
        if n <= 0 or n > 4096:
            return self.send(400, "bad_request")
        try:
            body = json.loads(self.rfile.read(n).decode("utf-8"))
        except (UnicodeDecodeError, ValueError):
            return self.send(400, "bad_request")
        if not isinstance(body, dict):
            return self.send(400, "bad_request")
        code, res = change(body, ip)
        self.send(code, res)

print("[account] service ready on 127.0.0.1:8090 (account, qr, resellers, gate)", flush=True)
threading.Thread(target=rs_watch, daemon=True).start()
ThreadingHTTPServer(("127.0.0.1", 8090), H).serve_forever()
