#! /bin/bash

./scripts/compress_game_js.sh

echo woaijibatui1 | sudo /etc/init.d/nginx start

sudo redis-server /etc/redis/redis.conf

uwsgi --ini scripts/uwsgi.ini

daphne -b 0.0.0.0 -p 5015 myfirstapp.asgi:application