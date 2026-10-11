# Rebuilds the Xray config on every start from the repo files.
# The panel's Core Settings are read-only, so the repo is the single source of truth:
# no stale config from an old deploy, no corrupt JSON, and the locked inbound is always first.
# ⚡ Fast transports are added ONLY when this image's Xray AND Marzban both support them,
#    so a newer feature can never stop the core (all WS configs keep working no matter what).
import json, os, re, shutil, subprocess, time
DST = "/var/lib/marzban/xray_config.json"
base = json.load(open("/opt/xray_config.json"))
locked = json.load(open("/opt/locked_inbound.json"))
if os.path.exists(DST):
    try:
        json.load(open(DST))
    except Exception:
        shutil.copy(DST, DST + f".broken-{int(time.time())}")
        print("[lock] old config was corrupt, backed up and replaced", flush=True)

def xray_version():
    exe = os.environ.get("XRAY_EXECUTABLE_PATH") or shutil.which("xray") or "/usr/local/bin/xray"
    try:
        out = subprocess.run([exe, "version"], capture_output=True, text=True, timeout=10).stdout
        m = re.search(r"Xray (\d+)\.(\d+)\.(\d+)", out)
        return tuple(int(v) for v in m.groups()) if m else (0, 0, 0)
    except Exception:
        return (0, 0, 0)

def marzban_knows(word):
    for root, _, files in os.walk("/code/app"):
        for f in files:
            if f.endswith(".py"):
                try:
                    if word in open(os.path.join(root, f), encoding="utf-8", errors="ignore").read():
                        return True
                except Exception:
                    pass
    return False

def inbound(tag, port, net, settings):
    return {"tag": tag, "listen": "127.0.0.1", "port": port, "protocol": "vless",
            "settings": {"clients": [], "decryption": "none"},
            "streamSettings": dict({"network": net, "security": "none",
                                    "sockopt": {"tcpKeepAliveIdle": 30, "tcpKeepAliveInterval": 15}}, **settings),
            "sniffing": {"enabled": True, "destOverride": ["http", "tls", "quic"], "routeOnly": True}}

# 🔐 secret config path: /cdn/<random id> (start.sh makes it once and keeps it in the Volume)
def ws_base():
    b = (os.environ.get("JINX_WS_BASE") or "").strip()
    if not re.fullmatch(r"/cdn/[A-Za-z0-9-]{8,64}", b):
        try:
            b = "/cdn/" + open("/var/lib/marzban/jinx_path").read().strip()
        except Exception:
            b = ""
    return b if re.fullmatch(r"/cdn/[A-Za-z0-9-]{8,64}", b) else "/cdn/jinx"
B = ws_base()
SUB = {"VLESS WS": "/v", "VMESS WS": "/m", "TROJAN WS": "/t"}
locked["streamSettings"]["wsSettings"]["path"] = B
for _i in base.get("inbounds", []):
    _ws = (_i.get("streamSettings") or {}).get("wsSettings")
    if isinstance(_ws, dict) and _i.get("tag") in SUB:
        _ws["path"] = B + SUB[_i["tag"]]
print(f"[lock] secret config path ready ({B[:9]}…)", flush=True)

ver = xray_version()
extra = []
if os.environ.get("JINX_FAST", "1") != "0":
    # HTTPUpgrade: same path as WS through Railway/Cloudflare, but lighter (no WS framing) -> faster
    if ver >= (1, 8, 9) and marzban_knows("httpupgrade"):
        extra.append(inbound("VLESS HTTPUPGRADE", 2005, "httpupgrade", {"httpupgradeSettings": {"path": B + "/u"}}))
    # XHTTP (or the older SplitHTTP): plain HTTP requests, passes any CDN, very stable on strict operators.
    #   Same recipe as the Vodiwalker panel (runs on Railway): TWO XHTTP configs, each with its own fixed mode
    #     packet-up  = many short uploads + one download stream (passes every web edge, best on strict operators)
    #     stream-up  = one long upload + one download stream (fewer requests = higher speed)
    #   ON by default (JINX_XHTTP=0 turns it off; its 2 names then move to HTTPUpgrade automatically).
    XH = os.environ.get("JINX_XHTTP", "1") != "0"
    if XH and ver >= (24, 11, 0) and marzban_knows("xhttp"):
        extra.append(inbound("VLESS XHTTP", 2006, "xhttp", {"xhttpSettings": {"path": B + "/x", "mode": "packet-up"}}))
        extra.append(inbound("VLESS XHTTP SU", 2007, "xhttp", {"xhttpSettings": {"path": B + "/s", "mode": "stream-up"}}))
    elif XH and ver >= (1, 8, 16) and marzban_knows("splithttp"):
        extra.append(inbound("VLESS XHTTP", 2006, "splithttp", {"splithttpSettings": {"path": B + "/x"}}))   # older Xray: packet style only

# 🛰 VLESS REALITY on a Railway TCP Proxy (optional): raw TCP, no web edge in between -> the lowest overhead.
#    Only when you turn on Settings > Networking > TCP Proxy for this service (Railway then sets these variables).
REALITY_TAG = "VLESS REALITY"
def reality_keys():
    kf = "/var/lib/marzban/jinx_reality.json"
    try:
        k = json.load(open(kf))
        if k.get("private") and k.get("sid"):
            return k
    except Exception:
        pass
    exe = os.environ.get("XRAY_EXECUTABLE_PATH") or shutil.which("xray") or "/usr/local/bin/xray"
    out = subprocess.run([exe, "x25519"], capture_output=True, text=True, timeout=10).stdout
    m = re.search(r"Private\s*key:\s*(\S+)", out, re.I)
    if not m:
        raise RuntimeError("xray x25519 gave no key")
    k = {"private": m.group(1), "sid": os.urandom(4).hex()}
    tmpk = kf + ".tmp"; json.dump(k, open(tmpk, "w")); os.chmod(tmpk, 0o600); os.replace(tmpk, kf)   # same key forever = configs never break
    return k
try:
    _rp = int(os.environ.get("RAILWAY_TCP_APPLICATION_PORT") or 0)
except ValueError:
    _rp = 0
if _rp and os.environ.get("JINX_REALITY", "1") != "0":
    if _rp in (8080, 8000, 8090, 2001, 2002, 2003, 2004, 2005, 2006, 2007) or not 1024 <= _rp <= 65535:
        print(f"[lock] TCP Proxy port {_rp} is already used inside -> set the TCP Proxy port to 2010 (Reality skipped)", flush=True)
    elif ver >= (1, 8, 0) and marzban_knows("reality"):
        try:
            k = reality_keys(); sni = (os.environ.get("JINX_REALITY_SNI") or "www.speedtest.net").strip()
            extra.append({"tag": REALITY_TAG, "listen": "0.0.0.0", "port": _rp, "protocol": "vless",
                          "settings": {"clients": [], "decryption": "none"},
                          "streamSettings": {"network": "tcp", "security": "reality",
                                             "realitySettings": {"show": False, "dest": sni + ":443", "xver": 0, "serverNames": [sni],
                                                                 "privateKey": k["private"], "shortIds": [k["sid"]]},
                                             "sockopt": {"tcpFastOpen": True, "tcpKeepAliveIdle": 30, "tcpKeepAliveInterval": 15}},
                          "sniffing": {"enabled": True, "destOverride": ["http", "tls", "quic"], "routeOnly": True}})
            print(f"[lock] Reality on TCP Proxy port {_rp} (sni {sni})", flush=True)
        except Exception as e:
            print(f"[lock] Reality skipped: {e}", flush=True)

# 🚀 BBR: much steadier speed on lossy mobile networks. Turned on ONLY if this server's kernel allows it for us
#    (otherwise Xray would refuse to connect, so we never guess).
def bbr_ok():
    try:
        allowed = open("/proc/sys/net/ipv4/tcp_allowed_congestion_control").read().split()
        avail = open("/proc/sys/net/ipv4/tcp_available_congestion_control").read().split()
        return "bbr" in allowed and "bbr" in avail and os.environ.get("JINX_BBR", "1") != "0"
    except Exception:
        return False
BBR = bbr_ok()
if BBR:
    for o in base.get("outbounds", []):
        if o.get("protocol") == "freedom":
            o.setdefault("streamSettings", {}).setdefault("sockopt", {})["tcpcongestion"] = "bbr"
    for i in extra:
        if i.get("tag") == "VLESS REALITY":
            i["streamSettings"]["sockopt"]["tcpcongestion"] = "bbr"
print(f"[lock] BBR {'on' if BBR else 'not allowed by this server, normal TCP'}", flush=True)

# 💓 WS heartbeat: a tiny ping every 30 s keeps the phone's line open (operators cut idle lines),
#    so the app never has to reconnect = no ping jump after a pause. Old Xray simply ignores it.
_hb = os.environ.get("JINX_HEARTBEAT", "30").strip()
HB = int(_hb) if _hb.isdigit() else 30          # JINX_HEARTBEAT=0 turns it off
for i in [locked] + base.get("inbounds", []) + extra:
    ss = i.get("streamSettings") or {}
    if ss.get("network") == "ws" and isinstance(ss.get("wsSettings"), dict):
        if HB > 0:
            ss["wsSettings"]["heartbeatPeriod"] = HB
        else:
            ss["wsSettings"].pop("heartbeatPeriod", None)

base["inbounds"] = [locked] + [i for i in base["inbounds"]
                               if i["tag"] != locked["tag"] and i["port"] != locked["port"]] + extra
_seen_t, _seen_p, _keep = set(), set(), []
for i in base["inbounds"]:                       # a duplicate tag/port would stop Xray -> keep the first, drop the copy
    if i["tag"] in _seen_t or i["port"] in _seen_p:
        print(f"[lock] WARNING: duplicate inbound {i['tag']} / {i['port']} skipped", flush=True); continue
    _seen_t.add(i["tag"]); _seen_p.add(i["port"]); _keep.append(i)
# 🚫 ad blocker: ads and trackers of sites and apps are dropped on the server (less data, pages open faster).
#    Turned on only if this image's geosite file really has the ads list (a missing list would stop Xray).
def geosite_has(word):
    dirs = [os.environ.get("XRAY_ASSETS_PATH") or "", "/usr/local/share/xray", "/usr/share/xray", "/usr/local/lib/xray",
            os.path.dirname(os.environ.get("XRAY_EXECUTABLE_PATH") or "/usr/local/bin/xray")]
    for d in dirs:
        f = os.path.join(d, "geosite.dat") if d else ""
        if f and os.path.exists(f):
            try:
                with open(f, "rb") as fh:
                    return word.upper().encode() in fh.read()
            except Exception:
                return False
    return False
if os.environ.get("JINX_ADBLOCK", "1") != "0" and geosite_has("category-ads-all"):
    rules = base.setdefault("routing", {}).setdefault("rules", [])
    rule = {"type": "field", "domain": ["geosite:category-ads-all"], "outboundTag": "BLOCK"}
    if rule not in rules:
        rules.insert(0, rule)
    print("[lock] ad blocker on (geosite:category-ads-all)", flush=True)
else:
    print("[lock] ad blocker off (no ads list in this image, or JINX_ADBLOCK=0)", flush=True)

# order = order in the subscription: lightest / steadiest first (the locked inbound always stays first)
_RANK = {locked["tag"]: 0, "VLESS REALITY": 1, "VLESS HTTPUPGRADE": 2, "VLESS XHTTP": 3, "VLESS XHTTP SU": 4, "VLESS WS": 5, "TROJAN WS": 6, "VMESS WS": 7}
base["inbounds"] = sorted(_keep, key=lambda i: _RANK.get(i["tag"], 50))

# 🧷 TCP Fast Open: kept only if this server's kernel really accepts it (a refused socket option = no connection at all)
def tfo_ok():
    import socket
    try:
        for opt, val in ((30, 1), (getattr(socket, "TCP_FASTOPEN", 23), 256)):   # 30 = TCP_FASTOPEN_CONNECT (outbound)
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                s.setsockopt(socket.IPPROTO_TCP, opt, val)
            finally:
                s.close()
        return True
    except OSError:
        return False

def all_sockopts(cfg):
    for part in (cfg.get("inbounds") or []) + (cfg.get("outbounds") or []):
        so = (part.get("streamSettings") or {}).get("sockopt")
        if isinstance(so, dict):
            yield so

# TCP Fast Open is OFF unless JINX_TFO=1: on Railway's network it can make new connections fail silently
#   (the proven SuperJinX setup runs without it), and the WS keep-alive already removes most reconnects
if os.environ.get("JINX_TFO", "0") != "1" or not tfo_ok():
    for so in all_sockopts(base):
        so.pop("tcpFastOpen", None)
    print("[lock] TCP Fast Open off", flush=True)

# 🧪 the final config is tested by this image's own Xray BEFORE it is saved.
#    If Xray would refuse it, optional extras are switched off one at a time (newest first) until Xray accepts it.
#    The base WS configs + the locked inbound are never removed, and the 12 configs stay 12 (enforce_hosts fills in).
XRAY_EXE = os.environ.get("XRAY_EXECUTABLE_PATH") or shutil.which("xray") or "/usr/local/bin/xray"
def xray_test(cfg):
    """(True, msg) = accepted or no way to test; (False, msg) = Xray refused it"""
    if not (os.path.isfile(XRAY_EXE) and os.access(XRAY_EXE, os.X_OK)):
        return True, "no xray binary to test with"
    t = "/run/jinx/xray_test.json"
    try:
        os.makedirs("/run/jinx", exist_ok=True)
        json.dump(cfg, open(t, "w"), ensure_ascii=False)
        env = dict(os.environ)
        assets = os.environ.get("XRAY_ASSETS_PATH") or next((d for d in ("/usr/local/share/xray", "/usr/share/xray", "/usr/local/lib/xray")
                                                             if os.path.exists(os.path.join(d, "geoip.dat"))), "")
        if assets:
            env["XRAY_LOCATION_ASSET"] = assets
        r = subprocess.run([XRAY_EXE, "run", "-test", "-c", t], capture_output=True, text=True, timeout=40, env=env)
        out = (r.stdout + r.stderr).strip().splitlines()
        return r.returncode == 0, (out[-1] if out else f"exit {r.returncode}")[:300]
    except Exception as e:
        return True, f"test skipped ({e})"
    finally:
        try: os.remove(t)
        except OSError: pass

def drop_inbound(tag):
    def f(cfg):
        cfg["inbounds"] = [i for i in cfg["inbounds"] if i.get("tag") != tag]
    return f
def drop_adblock(cfg):
    r = cfg.get("routing") or {}
    r["rules"] = [x for x in r.get("rules") or [] if "geosite:category-ads-all" not in (x.get("domain") or [])]
def drop_sockopt(key):
    def f(cfg):
        for so in all_sockopts(cfg): so.pop(key, None)
    return f
def drop_heartbeat(cfg):
    for i in cfg.get("inbounds") or []:
        ws = (i.get("streamSettings") or {}).get("wsSettings")
        if isinstance(ws, dict): ws.pop("heartbeatPeriod", None)

ok, why = xray_test(base)
if ok:
    print(f"[lock] xray test: config accepted ({why})" if "skip" in why or "no xray" in why else "[lock] xray test: config OK", flush=True)
else:
    print(f"[lock] WARNING: xray refused the config: {why}", flush=True)
    import copy
    EXTRAS = [("Reality", drop_inbound("VLESS REALITY")), ("XHTTP", lambda c: (drop_inbound("VLESS XHTTP")(c), drop_inbound("VLESS XHTTP SU")(c))),
              ("HTTPUpgrade", drop_inbound("VLESS HTTPUPGRADE")), ("ad blocker", drop_adblock),
              ("BBR", drop_sockopt("tcpcongestion")), ("TCP Fast Open", drop_sockopt("tcpFastOpen")),
              ("WS heartbeat", drop_heartbeat)]
    def without(labels):
        c = copy.deepcopy(base)
        for label, fn in EXTRAS:
            if label in labels: fn(c)
        return c
    present = [l for l, fn in EXTRAS if json.dumps(without({l}), sort_keys=True) != json.dumps(base, sort_keys=True)]
    fixed, off = None, set()
    # 1) only ONE extra is the problem (the usual case): switch off just that one
    for l in present:
        if xray_test(without({l}))[0]:
            fixed, off = without({l}), {l}; break
    # 2) more than one: switch them off one by one, then turn back on every one that was not needed
    if fixed is None:
        for l in present:
            off.add(l)
            if xray_test(without(off))[0]:
                for back in [x for x in present if x in off and x != l]:
                    if xray_test(without(off - {back}))[0]:
                        off.discard(back)
                fixed = without(off); break
    if fixed is not None:
        print(f"[lock] switched off: {', '.join(l for l in present if l in off)} (everything else stays on)", flush=True)
    if fixed is not None:
        base = fixed
        print(f"[lock] fixed: Xray accepts the config now ({len(base['inbounds'])} inbounds)", flush=True)
    else:
        # not caused by our extras (e.g. a broken image): keep the full config, the panel shows Xray's own error
        print("[lock] WARNING: not caused by an optional extra -> full config kept, check the Xray error above", flush=True)
tags = [i["tag"] for i in base["inbounds"]]
tmp = DST + ".tmp"
json.dump(base, open(tmp, "w"), indent=2, ensure_ascii=False)
os.replace(tmp, DST)  # atomic write
print(f"[lock] xray {'.'.join(map(str, ver))} | config ready: {len(tags)} inbounds "
      f"({', '.join(tags)}) | locked = {locked['tag']}", flush=True)
