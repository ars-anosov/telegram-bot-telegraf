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
  -it \
  node:8 bash
```

Бот общается с api.telegram.org по шифрованому SSL-каналу. В контейнере создаем самоподписные сертификаты.
```
mkdir cert && cd cert
```

Офф. документация - https://core.telegram.org/bots/self-signed (не делал)
```
openssl req -newkey rsa:2048 -sha256 -nodes -keyout client-key.key -x509 -days 10950 -out client-cert.pem -subj "/C=RU/ST=Moscow/L=Moscow/O=Test Company/CN=89.188.160.102"
```

Я создавал PKI x.509 по порядку

### CA (Certification Authority)
```
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 10950 -key ca.key -out ca.pem -outform PEM -subj "/C=RU/ST=Moscow/L=Moscow/O=Ars DevOps/CN=89.188.160.102"
```

### Ключи для телеграм-бота
1. закрытый ".key"
```
openssl genrsa -out client.key 4096
```
2. запрос на подпись ".csr" (certificate signing request)
```
openssl req -new -key client.key -out client.csr -subj "/C=RU/ST=Moscow/L=Moscow/O=Ars DevOps/CN=89.188.160.102"
```
3. подписанный сертификат ".pem"
```
openssl x509 -req -days 10950 -CA ca.pem -CAkey ca.key -set_serial 01 -in client.csr -out client.pem -outform PEM 
```

## Deploy

Деплой делаем через gulp утилитой rsync.
```
# gulp tools
npm install --save-dev gulp-cli gulp rimraf gulp-rsync gulp-if gulp-util

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

## Запуск бота

На production машине:
```
npm install
node index.js $TOKEN 89.188.160.102 8443
```


## Всякое
- [webhooks](https://core.telegram.org/bots/webhooks)
- [telegram API](https://core.telegram.org/bots/api)

Проверить бота на api.telegram.org
```
https://api.telegram.org/bot<INSERT_TOKEN_HERE>/getMe
https://api.telegram.org/bot<INSERT_TOKEN_HERE>/getWebhookInfo
```

Пара "ручных" запросов
```
curl -v -k https://89.188.160.102:8443/
curl -F "url=https://89.188.160.102:8443/<INSERT_TOKEN_HERE>" -F "certificate=@cert/client.pem" https://api.telegram.org/bot<INSERT_TOKEN_HERE>/setWebhook
```