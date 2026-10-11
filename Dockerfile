FROM gozargah/marzban:latest

RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx curl ca-certificates procps \
 && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default
# ⚡ nginx defaults allow only 768 connections per worker: every config uses 2 (phone + core), so busy panels got slow.
#    Raised to 16384 per worker with a matching file limit (never fails the build)
RUN ( sed -i 's/worker_connections [0-9]*;/worker_connections 16384;/; s/# *multi_accept on;/multi_accept on;/' /etc/nginx/nginx.conf \
      && (grep -q '^worker_rlimit_nofile' /etc/nginx/nginx.conf || sed -i '1i worker_rlimit_nofile 65535;' /etc/nginx/nginx.conf) \
      && grep -E 'worker_connections|worker_rlimit_nofile|multi_accept' /etc/nginx/nginx.conf ) || echo "nginx tuning skipped"
# Cloudflare tunnel client (optional feature): a download hiccup never fails the build
RUN ( curl -fsSL --retry 3 --retry-delay 2 -o /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
      && chmod +x /usr/local/bin/cloudflared && cloudflared --version ) || ( rm -f /usr/local/bin/cloudflared; echo "cloudflared download skipped, tunnel mode disabled" )

COPY ws.inc /etc/nginx/ws.inc
COPY gate.inc /etc/nginx/gate.inc
COPY nginx.conf /etc/nginx/conf.d/marzban.conf
COPY nginx.conf /opt/jinx/nginx.conf.tpl
COPY xray_config.json locked_inbound.json lock.py enforce_hosts.py ensure_admin.py doctor.py jinx_api.py /opt/
COPY jinx.css jinx.js donate.html donate-config.js /opt/jinx/
COPY sub.html /opt/jinx/templates/subscription/index.html
COPY sub.html /opt/jinx/sub.golden.html
COPY donate.html /opt/jinx/donate.golden.html
COPY donate-config.js /opt/jinx/donate-config.golden.js

# QR codes for the subscription page are made on our own server (no external site). Never fails the build.
RUN pip install --no-cache-dir segno==1.6.6 || echo "segno install skipped, QR button will hide itself"

# Persian font bundled inside the image (works even when Google Fonts is blocked). Never fails the build.
RUN mkdir -p /opt/jinx/fonts \
 && ( curl -fsSL -o /tmp/vz.zip https://github.com/rastikerdar/vazirmatn/releases/download/v33.003/vazirmatn-v33.003.zip \
      && mkdir -p /tmp/vz && cd /tmp/vz && python -c "import zipfile; zipfile.ZipFile('/tmp/vz.zip').extractall('.')" \
      && for w in Regular Medium Bold; do f=$(find /tmp/vz -name "Vazirmatn-$w.woff2" | head -1); [ -n "$f" ] && cp "$f" /opt/jinx/fonts/; done \
      ; rm -rf /tmp/vz /tmp/vz.zip ) || echo "font download skipped, using system font" \
 && ls /opt/jinx/fonts
COPY start.sh /start.sh

# fix Windows line endings, just in case
RUN sed -i 's/\r$//' /start.sh /opt/*.py /opt/*.json /opt/jinx/jinx.css /opt/jinx/jinx.js /opt/jinx/donate.html /opt/jinx/donate-config.js /opt/jinx/templates/subscription/index.html /opt/jinx/sub.golden.html /opt/jinx/donate.golden.html /opt/jinx/donate-config.golden.js /etc/nginx/ws.inc /etc/nginx/gate.inc /etc/nginx/conf.d/marzban.conf /opt/jinx/nginx.conf.tpl \
 && chmod +x /start.sh && chmod -R a+rX /opt/jinx

ENV PORT=8080 \
    UVICORN_HOST=127.0.0.1 \
    UVICORN_PORT=8000 \
    XRAY_JSON=/var/lib/marzban/xray_config.json \
    SQLALCHEMY_DATABASE_URL=sqlite:////var/lib/marzban/db.sqlite3 \
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES=43200 \
    CUSTOM_TEMPLATES_DIRECTORY=/opt/jinx/templates/ \
    SUBSCRIPTION_PAGE_TEMPLATE=subscription/index.html
EXPOSE 8080
ENTRYPOINT ["/start.sh"]
CMD []
