proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $conn_up;
proxy_set_header Host $host;
proxy_connect_timeout 5s;
proxy_read_timeout 1d;
proxy_send_timeout 1d;
proxy_socket_keepalive on;
proxy_buffering off;
proxy_request_buffering off;
access_log off;              # no disk write per connection = less delay
