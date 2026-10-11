#!/bin/bash
# ⚡ Super JinX | Iran relay (optional, lowest ping)
# Run on an IRANIAN VPS (Ubuntu/Debian):   sudo bash iran-relay.sh xxxx.up.railway.app
# Users connect to this Iranian server -> it forwards the encrypted traffic (untouched) to Railway.
# Then add  IRAN_RELAY_IP=<this server IP>  in Railway variables and redeploy.
set -e
DOMAIN="${1:-}"
PORTS="${RELAY_PORTS:-443}"            # e.g. RELAY_PORTS="443 8443"
if [ -z "$DOMAIN" ]; then echo "usage: sudo bash iran-relay.sh <your-app.up.railway.app>"; exit 1; fi
if [ "$(id -u)" != "0" ]; then echo "run as root (sudo)"; exit 1; fi

echo "== installing nginx stream =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx libnginx-mod-stream || apt-get install -y nginx-full

# free port 443 from the default website
rm -f /etc/nginx/sites-enabled/default

LISTEN=""
for p in $PORTS; do LISTEN="$LISTEN    listen $p reuseport so_keepalive=on;\n"; done

cat > /etc/nginx/jinx-relay.conf <<CONF
# ⚡ Super JinX relay -> $DOMAIN (TLS passthrough, nothing is decrypted here)
stream {
    resolver 8.8.8.8 1.1.1.1 178.22.122.100 valid=60s ipv6=off;
    resolver_timeout 5s;
    map \$remote_addr \$jinx_up { default "$DOMAIN:443"; }
    server {
$(printf "$LISTEN")
        proxy_pass \$jinx_up;
        proxy_connect_timeout 5s;
        proxy_timeout 1h;
        proxy_buffer_size 64k;          # bigger chunks = higher speed on the long Iran -> Amsterdam path
        tcp_nodelay on;
    }
}
CONF

# include the stream block at top level of nginx.conf (once)
grep -q "jinx-relay.conf" /etc/nginx/nginx.conf || echo "include /etc/nginx/jinx-relay.conf;" >> /etc/nginx/nginx.conf

echo "== network tuning (BBR + fast open) =="
cat > /etc/sysctl.d/99-jinx.conf <<SYS
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
net.ipv4.tcp_fastopen=3
net.ipv4.tcp_slow_start_after_idle=0
net.ipv4.tcp_mtu_probing=1
net.core.rmem_max=16777216
net.core.wmem_max=16777216
net.ipv4.tcp_rmem=4096 131072 16777216
net.ipv4.tcp_wmem=4096 65536 16777216
net.ipv4.tcp_notsent_lowat=16384
SYS
sysctl --system >/dev/null 2>&1 || true

nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl restart nginx

IP=$(curl -fsS4 --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
echo
echo "✅ relay is up: ports [$PORTS] -> $DOMAIN"
echo "👉 now in Railway add:  IRAN_RELAY_IP=$IP"
[ "$PORTS" != "443" ] && echo "👉 and:                 IRAN_RELAY_PORT=$(echo $PORTS | awk '{print $1}')"
echo "   then Redeploy and update the subscription in your app."
