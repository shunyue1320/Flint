FROM nginx

WORKDIR /app

COPY web/flint-web/deploy/nginx /etc/nginx
COPY web/flint-web/dist /app

CMD [ "nginx" ]
