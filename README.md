# telegram-bot-telegraf



## Обзор
Telegram bot на базе фреймворка [telegraf](https://github.com/telegraf/telegraf).



## Установка / Использование

Собираю в Docker-контейнере, дальше деплой на машину IP=89.188.160.102.
```
cd telegram-bot-telegraf

sudo docker run \
  --name telegram-bot-telegraf \
  -v $PWD:/telegram-bot-telegraf \
  -w /telegram-bot-telegraf \
  --publish=8443:8443 \
  --env="TOKEN=INSERT_TOKEN_HERE" \
  --env="WH_URL=https://89.188.160.102" \
  --env="WH_S_PATH=INSERT_PATH_HERE" \
  -it \
  node:8 bash
```

## Deploy

Деплой делаем через gulp утилитой rsync.
```
# gulp tools
npm install -g gulp-cli
npm install --save gulp rimraf gulp-rsync gulp-if gulp-util

# system rsync
apt update
apt install rsync

# содержимое id_rsa.pub вписываем на удаленной машине в authorized_keys
ssh-keygen
scp /root/.ssh/id_rsa.pub arseny@89.188.160.102:~/
ssh -t arseny@89.188.160.102 'cat id_rsa.pub >> ~/.ssh/authorized_keys'

# Deploy
gulp deploy
```
Выскочить из контейнера : Ctrl+P+Q