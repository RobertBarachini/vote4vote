# Server

TODO: write a proper README

# Deploy

TODO

# Start commands

## Develop

Terminals:
* pnpm watch
* pnpm dev

## Production

TODO

# Setup

## MongoDB

```shell
docker pull mongo
docker run --name mongo -d mongo:latest
```

## Redis

<!-- Adapted from: https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04 -->

Install
```shell
sudo apt update -y
sudo apt upgrade -y
sudo apt install redis-server
sudo nano /etc/redis/redis.conf
```

A strong password can be generated using
```shell
openssl rand 60 | openssl base64 -A
```

Uncomment or add tp config: 
```conf
supervised systemd
bind 127.0.0.1 ::1
requirepass <your_password>
```

Restart the service
```shell
sudo systemctl restart redis.service
sudo systemctl status redis
sudo netstat -lnp | grep redis
```

Enter Redis shell
```shell
redis-cli
```

Test it
```redis
auth <your_password>
ping
set test1 = "Hello redis"
get test1
KEYS *
quit
```