proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header Connection "";
proxy_set_header X-Forwarded-Proto https;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_request_buffering on;
proxy_buffering on;
client_max_body_size 1m;
proxy_connect_timeout 2s;
proxy_read_timeout 70s;
# real visitor ip for the login lock (these always overwrite whatever the browser sent)
proxy_set_header X-Jinx-Remote $remote_addr;
proxy_set_header X-Jinx-Real $http_x_real_ip;
proxy_set_header X-Jinx-XFF $http_x_forwarded_for;
proxy_set_header X-Jinx-CF $http_cf_connecting_ip;
