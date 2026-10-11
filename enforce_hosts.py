# Super JinX host guard (every 20s)
# 1) Locked inbound: every route is forced and reverted within 20s if anyone edits it
# 2) Other inbounds: get the same full route set automatically and are kept in sync,
#    as long as they still look like ours. Rename a host in the panel and the guard leaves it alone.
# Every config name starts with the locked brand name, then shows its route and protocol, e.g.
#   جینکس | 𝗝𝗶𝗻𝗫 ✦ 🚀 Turbo Iran · VLESS      (the apps still pick the fastest one with their ping test)
import json, os, time, urllib.error, urllib.request, urllib.parse

API = "http://127.0.0.1:8000"
LOCKED_TAG = json.load(open("/opt/locked_inbound.json"))["tag"]
LOCKED_REMARK = "جینکس | 𝗝𝗶𝗻𝗫"                    # every config name starts with this
OLD_REMARKS = ("جینکس | 𝙎𝙪𝙥𝙚𝙧 𝗝𝗶𝗻𝗫",)               # names of the previous version -> renamed automatically
DOMAIN = os.environ.get("PANEL_DOMAIN") or os.environ.get("RAILWAY_PUBLIC_DOMAIN", "")
CF_HOST = os.environ.get("CF_TUNNEL_HOSTNAME", "") if os.environ.get("CF_TUNNEL_TOKEN") else ""
def _list(name, default=""):
    return [x.strip() for x in os.environ.get(name, default).replace(" ", ",").split(",") if x.strip()]

CF_IPS = _list("CF_CLEAN_IP")                        # one or more Cloudflare clean IPs (best one per operator)
# Cloudflare HTTPS ports: different operators throttle different ports, so every clean IP is offered on each
CF_PORTS = [int(p) for p in _list("CF_PORTS", "443,2053,8443") if p.isdigit() and int(p) in (443, 2053, 2083, 2087, 2096, 8443)] or [443]
RELAY_IPS = _list("IRAN_RELAY_IP")                   # optional Iranian relay server(s), see iran-relay.sh
try:
    RELAY_PORT = int(os.environ.get("IRAN_RELAY_PORT", "443") or 443)
    assert 1 <= RELAY_PORT <= 65535
except Exception:
    print("[guard] WARNING: IRAN_RELAY_PORT is not a valid port -> using 443", flush=True); RELAY_PORT = 443
FRAG = os.environ.get("JINX_FRAGMENT", "10-20,10-20,tlshello").strip()   # "" disables the fragment route
# 🔐 secret path /cdn/<random id> + ?ed=2560 early data: exactly the SuperJinX config style
#    (vless://...@<app>.up.railway.app:443?type=ws&security=tls&path=/cdn/<id>?ed=2560&alpn=http/1.1&fp=ios)
import re as _re
def _ws_base():
    b = (os.environ.get("JINX_WS_BASE") or "").strip()
    if not _re.fullmatch(r"/cdn/[A-Za-z0-9-]{8,64}", b):
        try:
            b = "/cdn/" + open("/var/lib/marzban/jinx_path").read().strip()
        except Exception:
            b = ""
    return b if _re.fullmatch(r"/cdn/[A-Za-z0-9-]{8,64}", b) else "/cdn/jinx"
WSB = _ws_base()
PATHS = {LOCKED_TAG: WSB + "?ed=2560", "VLESS WS": WSB + "/v?ed=2560", "VMESS WS": WSB + "/m?ed=2560",
         "TROJAN WS": WSB + "/t?ed=2560", "VLESS HTTPUPGRADE": WSB + "/u?ed=2560", "VLESS XHTTP": WSB + "/x", "VLESS XHTTP SU": WSB + "/s"}
# paths of v12 and before: hosts that still have them are ours too and get moved to the new path
OLD_PATHS = {LOCKED_TAG: "/panel-ws", "VLESS WS": "/vless", "VMESS WS": "/vmess", "TROJAN WS": "/trojan",
             "VLESS HTTPUPGRADE": "/vhu", "VLESS XHTTP": "/vxh", "VLESS XHTTP SU": ""}
# 🛰 Reality over a Railway TCP Proxy (only when TCP Proxy is on; see lock.py)
REALITY_TAG = "VLESS REALITY"
TCP_DOMAIN = os.environ.get("RAILWAY_TCP_PROXY_DOMAIN", "").strip()
try:
    TCP_PORT = int(os.environ.get("RAILWAY_TCP_PROXY_PORT") or 0)
except ValueError:
    TCP_PORT = 0
REALITY_SNI = (os.environ.get("JINX_REALITY_SNI") or "www.speedtest.net").strip()
if TCP_DOMAIN and TCP_PORT and os.environ.get("JINX_REALITY", "1") != "0":
    PATHS[REALITY_TAG] = ""
PROTO = {REALITY_TAG: "Reality", LOCKED_TAG: "JinX Core", "VLESS WS": "VLESS", "VMESS WS": "VMess", "TROJAN WS": "Trojan", "VLESS HTTPUPGRADE": "HTTPUpgrade", "VLESS XHTTP": "XHTTP", "VLESS XHTTP SU": "XHTTP"}
# route names (each config gets its own name; the apps still pick the fastest one with their ping test)
R_RELAY, R_CDN_IP, R_CDN = "🚀 Turbo Iran", "🌩 Cloud Storm", "☁️ Cloud Shield"
# Railway region of this service (works in all 4; Amsterdam = lowest ping from Iran)
_REG = (os.environ.get("RAILWAY_REPLICA_REGION") or os.environ.get("JINX_REGION") or "europe-west4").lower()
REGION = ("🇺🇸 Virginia" if "us-east" in _REG else "🇺🇸 California" if "us-west" in _REG else
          "🇸🇬 Singapore" if "asia" in _REG or "southeast" in _REG else "🇳🇱 Amsterdam")
# two fragment profiles: strong (SNI-filtered operators) and light (almost no speed cost)
FRAG_LIGHT = os.environ.get("JINX_FRAGMENT_LIGHT", "100-200,1-3,tlshello").strip()
# ⚡ 12 direct methods, each one different (transport x TLS fingerprint x ALPN x fragment) -> one of them always flies
#    WebSocket / HTTPUpgrade connections stay open forever on Railway (steadiest); XHTTP uses HTTP/2 multiplexing
#    (fastest to open new connections) but Railway caps one HTTP request at 15 min, so it gets only 2 of the 12
#    (inbound, name, fingerprint, alpn, fragment profile)
METHODS = [
    (None,                "🚀 Rocket",          "ios",        "http/1.1", ""),        # 1  locked JinX Core (= the SuperJinX config)
    (None,                "👻 Ghost Anti-Filter", "chrome",   "http/1.1", "strong"),  # 2
    ("VLESS WS",          "💫 Hyper Drive",     "firefox",    "http/1.1", ""),        # 3
    ("VLESS WS",          "🌪 Swift Shield",    "chrome",     "http/1.1", "light"),   # 4
    ("VMESS WS",          "🌀 Vortex",          "safari",     "http/1.1", ""),        # 5
    ("TROJAN WS",         "🔱 Trident",         "edge",       "http/1.1", ""),        # 6
    ("TROJAN WS",         "🥷 Ninja Stealth",   "random",     "http/1.1", "strong"),  # 7
    ("VLESS HTTPUPGRADE", "⚡ Lightning",       "chrome",     "http/1.1", ""),        # 8
    ("VLESS HTTPUPGRADE", "🌠 Meteor",          "ios",        "http/1.1", "light"),   # 9
    ("VLESS XHTTP",       "🛸 Warp Speed",      "chrome",     "h2,http/1.1", ""),     # 10 (XHTTP packet-up, Vodiwalker style)
    ("VLESS HTTPUPGRADE", "🌌 Nebula",          "firefox",    "http/1.1", ""),        # 11 (upgrade = no 15-min cap on Railway)
    ("VLESS XHTTP SU",    "🧬 Quantum",         "edge",       "h2,http/1.1", ""),     # 12 (XHTTP stream-up, Vodiwalker style)
]
# 🔁 Mux (only in apps that get the full Xray JSON: v2rayNG, v2rayN, Streisand, Happ; sing-box / Clash ignore it):
#    new connections reuse an open tunnel -> no new handshake to Amsterdam -> pages and the in-app test answer faster.
#    The other half stays without Mux for the highest single-download speed.
# Mux is OFF by default: Hiddify / sing-box / Clash would use THEIR mux (smux / h2mux), which the Xray server does not
#   speak -> those configs never connect there. JINX_MUX=1 turns it on (only safe if your users use v2rayNG with JSON).
MUX_ON = os.environ.get("JINX_MUX", "0") == "1"
# the fastest picks (Rocket, Lightning, Vortex, Warp Speed) stay WITHOUT Mux: one tunnel per connection = full download speed
MUX = {"💫 Hyper Drive", "🔱 Trident", "🌌 Nebula", "🛰 Reality Pulse"}
SAFE_FP = False                                     # True after the panel refused a fingerprint value
SAFE_PLAIN = False                                  # True if the panel refused even that: plain http/1.1, no mux (last safe step)
AVAILABLE = set()                                   # inbound tags this panel really has (filled from the panel every round)
OLD_AUTO = {"𝗝𝗶𝗻𝗫 | VLESS", "𝗝𝗶𝗻𝗫 | VMess", "𝗝𝗶𝗻𝗫 | Trojan"}      # names of older versions -> renamed

# 🌐 mirrors: more Railway domains for the same service (Settings > Domains). If an operator or a city ever blocks
#    one domain name, the same server is still reachable through the others -> nothing goes down.
_RW = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
MIRRORS = [d for d in dict.fromkeys(_list("JINX_EXTRA_DOMAINS") + ([_RW] if _RW and DOMAIN and _RW != DOMAIN else []))
           if d and d != DOMAIN and "." in d]
HAS_RAILWAY_DOMAIN = bool(DOMAIN)
if not DOMAIN and CF_HOST:
    DOMAIN = CF_HOST  # tunnel-only setup: everything goes through the tunnel hostname

def name(route, tag):
    return f"{LOCKED_REMARK} ✦ {route} · {PROTO.get(tag, 'JinX')}"

def base(path, address=None, sni=None, port=443, frag="", alpn="http/1.1", remark=LOCKED_REMARK, fp="chrome", mux=False):
    sni = sni or DOMAIN
    return {"remark": remark, "path": path, "address": address or sni, "port": port, "sni": sni, "host": sni,
            "security": "tls", "alpn": "http/1.1" if SAFE_PLAIN else alpn, "fingerprint": "chrome" if SAFE_FP else fp,
            "allowinsecure": False, "is_disabled": False, "mux_enable": bool(mux and MUX_ON and not SAFE_PLAIN),
            "fragment_setting": frag or None}   # explicit, so no config ever inherits a fragment by accident

def reality_hosts():
    out = []
    for label, fp in (("🛰 Reality Pulse", "chrome"), ("🌑 Dark Matter", "firefox")):
        out.append({"remark": name(label, REALITY_TAG), "address": TCP_DOMAIN, "port": TCP_PORT, "sni": REALITY_SNI, "host": "",
                    "path": "", "security": "inbound_default", "alpn": "", "fingerprint": "chrome" if SAFE_FP else fp,
                    "allowinsecure": False, "is_disabled": False, "mux_enable": bool(label in MUX and MUX_ON), "fragment_setting": None})
    return out

def wanted(tag):
    """All routes for one inbound, best first (MCI / Irancell / TCI / Rightel each have a winner)."""
    if tag == REALITY_TAG:
        return reality_hosts() if REALITY_TAG in PATHS else []
    path = PATHS.get(tag)
    if not path:
        return []
    alpn = "h2,http/1.1" if tag in XH_TAGS else "http/1.1"
    out = []
    n = lambda r: name(r, tag)
    if HAS_RAILWAY_DOMAIN and tag in tunnel_tags():
        for k, ip in enumerate(RELAY_IPS):                             # 🇮🇷 Iran relay = lowest ping
            out.append(base(path, address=ip, port=RELAY_PORT, alpn=alpn, remark=n(R_RELAY + (f" {k + 1}" if len(RELAY_IPS) > 1 else ""))))
    if CF_HOST and tag in tunnel_tags():
        for k, ip in enumerate(CF_IPS):                                # ☁️ Cloudflare clean IPs x ports
            for p in CF_PORTS:
                out.append(base(path, address=ip, sni=CF_HOST, port=p, alpn=alpn, remark=n(f"{R_CDN_IP} {p}" + (f" #{k + 1}" if len(CF_IPS) > 1 else ""))))
        out.append(base(path, address=CF_HOST, sni=CF_HOST, alpn=alpn, remark=n(R_CDN)))  # ☁️ Cloudflare by hostname
    if HAS_RAILWAY_DOMAIN:
        out.extend(direct(tag, path))                               # ⚡ straight to Railway: the 12 methods
        if tag in tunnel_tags():
            for k, d in enumerate(MIRRORS):                        # 🌐 same server, other domain names
                out.append(base(path, address=d, sni=d, alpn=alpn, mux=True, remark=n(f"🌐 Mirror {k + 1}")))
    return out

def tunnel_tags():
    """relay / Cloudflare routes go on the 2 strongest transports only (JinX Core + the fastest one this image has),
       so the list stays short (HTTPUpgrade first: never cut by Railway)"""
    if not HAS_RAILWAY_DOMAIN:
        return set(PATHS)              # tunnel-only setup: the tunnel is the only way in, so every transport gets it
    fast = next((t for t in ("VLESS HTTPUPGRADE", "VLESS XHTTP", "VLESS WS") if not AVAILABLE or t in AVAILABLE), "VLESS WS")
    return {LOCKED_TAG, fast}

def frag_of(profile):
    if not FRAG or not profile:
        return ""
    return FRAG if profile == "strong" else (FRAG_LIGHT or FRAG)

# when an inbound is missing in this image, its methods move to the next best transport WITH THE SAME NAME,
# so the 12 names never change and never repeat (XHTTP -> HTTPUpgrade -> WebSocket, HTTPUpgrade -> WebSocket)
XH_TAGS = {"VLESS XHTTP", "VLESS XHTTP SU"}
FALLBACK = {"VLESS XHTTP SU": ("VLESS XHTTP", "VLESS HTTPUPGRADE", "VLESS WS"), "VLESS XHTTP": ("VLESS HTTPUPGRADE", "VLESS WS"), "VLESS HTTPUPGRADE": ("VLESS WS",)}

def plan_12():
    out = []
    for m in METHODS:
        t, label, fp, alpn, prof = (m[0] or LOCKED_TAG), m[1], m[2], m[3], m[4]
        if AVAILABLE and t not in AVAILABLE:
            alt = next((x for x in FALLBACK.get(t, ()) if x in AVAILABLE), None)
            if not alt:
                continue
            t, alpn = alt, ("h2,http/1.1" if alt in XH_TAGS else "http/1.1")   # WebSocket / HTTPUpgrade through Railway = http/1.1 only
            taken = [((x[0] or LOCKED_TAG), x[2], x[4]) for x in METHODS] + [(o[0], o[2], o[4]) for o in out]
            if (t, fp, prof) in taken:         # moved onto a transport that already has this exact setup: keep it a different config
                fp = next((f for f in ("android", "safari", "edge", "firefox", "ios", "chrome", "random") if (t, f, prof) not in taken), "android")
        out.append((t, label, fp, alpn, prof))
    return out

def direct(tag, path):
    """this inbound's share of the 12 direct methods (names stay the same even when a transport is missing)"""
    out, seen = [], set()
    for t, label, fp, alpn, prof in plan_12():
        if t != tag or label in seen:
            continue
        seen.add(label)
        mux = label in MUX and t not in XH_TAGS          # XHTTP has its own multiplexing
        if label == "🚀 Rocket":
            label = REGION + " Rocket"
        out.append(base(path, frag=frag_of(prof), alpn=alpn, fp=fp, remark=name(label, tag), mux=mux))
    return out

CORE = ("remark", "address", "port", "sni", "host", "path", "security", "alpn", "fingerprint")

def same(cur, want):
    # core fields must match; extra fields only if this Marzban version has them (no endless re-writes)
    return all(cur.get(k) == v for k, v in want.items() if k in CORE or k in cur)

def is_default(h):
    return (not h) or "{SERVER_IP}" in str(h.get("address", ""))

def ours(tag, lst):
    """Still managed by us: every host has our name (or an old auto name) and our path."""
    p = {(PATHS.get(tag) or "").split("?")[0], OLD_PATHS.get(tag, "")} - {""}
    pre = tuple(r + " ✦ " for r in (LOCKED_REMARK,) + OLD_REMARKS)
    return bool(lst) and all((h.get("remark") in OLD_AUTO | {LOCKED_REMARK} | set(OLD_REMARKS) or str(h.get("remark") or "").startswith(pre)) and str(h.get("path") or "").split("?")[0] in p for h in lst)

def req(method, path, data=None, token=None, form=False):
    h = {}
    if token:
        h["Authorization"] = "Bearer " + token
    if data is not None:
        if form:
            data = urllib.parse.urlencode(data).encode()
            h["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(data).encode()
            h["Content-Type"] = "application/json"
    r = urllib.request.Request(API + path, data=data, headers=h, method=method)
    return json.loads(urllib.request.urlopen(r, timeout=10).read() or b"null")

def sync(hosts, tag):
    want = wanted(tag)
    cur = hosts.get(tag) or []
    if not want or (len(cur) == len(want) and all(same(c, w) for c, w in zip(cur, want))):
        return False
    tmpl = cur[0] if cur else {}
    new = []
    for w in want:
        h = dict(tmpl); h.update(w); new.append(h)
    hosts[tag] = new
    return True

if not DOMAIN:
    print("[guard] WARNING: no domain yet. Generate a Railway domain (port 8080) and redeploy.", flush=True)
else:
    print(f"[guard] region {REGION} | 12 direct methods | tunnel routes on 2 transports: "
          f"relay {len(RELAY_IPS)}, cf ips {len(CF_IPS)} x ports {CF_PORTS if CF_HOST else []}, cf domain {int(bool(CF_HOST))}"
          f" | fragment {'on' if FRAG else 'off'}", flush=True)

while True:
    try:
        cred = json.load(open("/run/jinx/system.json"))
        tok = req("POST", "/api/admin/token", cred, form=True)["access_token"]
        hosts = req("GET", "/api/hosts", token=tok)
        AVAILABLE = {t for t in hosts if t in PATHS}
        changed = False
        if DOMAIN:
            for tag, lst in hosts.items():
                if tag == LOCKED_TAG or is_default(lst[0] if lst else None) and all(is_default(h) for h in lst) or ours(tag, lst):
                    if sync(hosts, tag):
                        changed = True
                        print(f"[guard] {'locked inbound restored' if tag == LOCKED_TAG else 'routes updated for ' + tag}", flush=True)
            if LOCKED_TAG not in hosts:
                print("[guard] locked inbound not loaded yet", flush=True)
        if changed:
            try:
                req("PUT", "/api/hosts", hosts, token=tok)
            except urllib.error.HTTPError as he:
                if he.code in (400, 422):
                    # this Marzban version rejected a fragment / fingerprint value -> plain chrome + no fragment,
                    # every config keeps working (and keeps its own name)
                    why = he.read().decode(errors="ignore")[:300]
                    print(f"[guard] panel rejected a host value ({he.code}): {why}", flush=True)
                    print("[guard] retrying with safe values (chrome, no fragment); every config keeps its name", flush=True)
                    FRAG = ""; SAFE_FP = True
                    for tag in list(hosts):
                        if tag == LOCKED_TAG or ours(tag, hosts[tag]):
                            for h in hosts[tag]:
                                h["fragment_setting"] = None; h["fingerprint"] = "chrome"
                    try:
                        req("PUT", "/api/hosts", hosts, token=tok)
                    except urllib.error.HTTPError as he2:
                        if he2.code not in (400, 422):
                            raise
                        # still refused: last safe step = plain http/1.1 and no Mux (works on every Marzban version)
                        print(f"[guard] still rejected ({he2.code}): {he2.read().decode(errors='ignore')[:300]}", flush=True)
                        print("[guard] last safe step: http/1.1 + no Mux on our configs", flush=True)
                        SAFE_PLAIN = True
                        for tag in list(hosts):
                            if tag == LOCKED_TAG or ours(tag, hosts[tag]):
                                for h in hosts[tag]:
                                    h["alpn"] = "http/1.1"
                                    if "mux_enable" in h: h["mux_enable"] = False
                        req("PUT", "/api/hosts", hosts, token=tok)
                else:
                    raise
    except Exception as e:
        print("[guard] waiting for panel:", e, flush=True)
    time.sleep(20)
