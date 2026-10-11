# Super JinX admin manager (runs on every start)
#  - first install (no panel admin yet): creates  admin / admin
#  - after that it NEVER touches your admin: a username/password changed from the panel menu stays forever
#  - forgot it? set RESET_ADMIN_PASSWORD=1 in Railway + redeploy -> login is back to admin / admin
#  - creates a hidden internal admin for the support bots (random password, rotated every start)
import json, os, secrets, sys
from datetime import datetime, timezone
sys.path.insert(0, "/code")
ADMIN, DEFAULT_PW = "admin", "admin"
SYSTEM = "jinx-system"
CRED = "/run/jinx/system.json"
RESET = os.environ.get("RESET_ADMIN_PASSWORD", "").strip().lower() in ("1", "true", "yes", "on")

from passlib.context import CryptContext
from app.db import GetDB
from app.db.models import Admin
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def set_pw(a, password):
    a.hashed_password = pwd.hash(password)
    a.is_sudo = True
    if hasattr(a, "password_reset_at"):
        a.password_reset_at = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)  # whole second: tokens issued right after stay valid

RESELLERS = set()                                   # reseller panels are never promoted / reset
STORE_BROKEN = False                                # reseller file exists but can't be read -> touch no roles at all
_seen = False
for _p in ("/var/lib/marzban/jinx_resellers.json", "/var/lib/marzban/jinx_resellers.json.bak"):
    if not os.path.exists(_p):
        continue
    _seen = True
    try:
        with open(_p, encoding="utf-8") as _f:
            _d = json.load(_f)
        if not isinstance(_d, dict):
            raise ValueError("bad format")
        RESELLERS = set(_d)
        break
    except Exception:
        continue
else:
    STORE_BROKEN = _seen

with GetDB() as db:
    panel_admins = [a for a in db.query(Admin).all() if a.username != SYSTEM]
    owners = [a for a in panel_admins if a.username not in RESELLERS]      # reseller panels are never promoted
    sudo = [a for a in owners if a.is_sudo]
    if STORE_BROKEN:
        msg = "[admin] WARNING: reseller data unreadable -> admin roles left exactly as they are this start"
    elif not owners:
        if db.query(Admin).filter(Admin.username == ADMIN).first() is None:
            db.add(Admin(username=ADMIN, hashed_password=pwd.hash(DEFAULT_PW), is_sudo=True))
            msg = "[admin] first install: login is admin / admin"
        else:                                                                  # 'admin' is a reseller's name
            msg = "[admin] WARNING: only reseller admins exist and one is named 'admin'; rename it to recover"
    elif RESET:
        a = next((x for x in owners if x.username == ADMIN), None) or (sudo or owners)[0]
        taken = any(x.username == ADMIN and x is not a for x in panel_admins)   # 'admin' used by a reseller
        if not taken:
            a.username = ADMIN
        set_pw(a, DEFAULT_PW)
        msg = (f"[admin] RESET_ADMIN_PASSWORD -> login is back to {a.username} / admin (remove the variable now)")
    else:
        if not sudo:
            owners[0].is_sudo = True
        msg = "[admin] your admin username/password kept (change them any time from the panel menu)"
    sys_pw = secrets.token_urlsafe(24)
    s = db.query(Admin).filter(Admin.username == SYSTEM).first()
    if s is None:
        db.add(Admin(username=SYSTEM, hashed_password=pwd.hash(sys_pw), is_sudo=True))
    else:
        set_pw(s, sys_pw)
    db.commit()
    print(msg, flush=True)

os.makedirs("/run/jinx", exist_ok=True)
_tmp = CRED + ".tmp"
with open(_tmp, "w") as f:
    json.dump({"username": SYSTEM, "password": sys_pw}, f); f.flush(); os.fsync(f.fileno())
os.chmod(_tmp, 0o600)
os.replace(_tmp, CRED)
print("[admin] support bots credentials ready", flush=True)
