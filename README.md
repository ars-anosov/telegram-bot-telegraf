# telegram-bot-telegraf



## Обзор
Telegram bot на базе фреймворка [telegraf](https://github.com/telegraf/telegraf).



## Установка / Использование

### Окружение
Работал в следующем окружении (для себя правим на нужные IP):

- **telegram-bot-telegraf** - Docker-контейнер NodeJS v.9 для разработки. Деплой утилитой **rsync**.
- **89.188.160.102** - Pruduction машина. Доступна по **HTTPS**. Умеет **rsync**.
- **TOKEN** - выдает @BotFather
- **PROVIDER_TOKEN** - привязка платежной системы к боту через @BotFather

Поддерживаемые TCP-порты: 443, 80, 88, 8443 (см. [офф.док.](https://core.telegram.org/bots/api) метод "setWebhook").
```
cd telegram-bot-telegraf

sudo docker run \
  --name telegram-bot-telegraf \
  -v $PWD:/telegram-bot-telegraf \
  -w /telegram-bot-telegraf \
  --publish=8443:8443 \
  --env="TOKEN=INSERT_BOT_TOKEN_HERE" \
  --env="PROVIDER_TOKEN=INSERT_PROVIDER_TOKEN_HERE" \
  -it \
  node:9 bash
```

Дальше все действия в контейнере. Выскочить из контейнера : Ctrl+P+Q



## TLS сертификаты

Webhook работает по шифрованому TLS-каналу. Складываем сертификаты в директорию "cert". В контейнере свои, на production-машине свои. Использую самоподписные сертификаты.
```
mkdir cert && cd cert
```

Офф. документация - https://core.telegram.org/bots/self-signed (не делал).

Создавал x.509 PKI по порядку. Ниже CN=89.188.160.102 меняем на свой внешний IP.

### CA (Certification Authority)
```
openssl genrsa -out ca.key 4096

openssl req -new -x509 -days 10950 -key ca.key -out ca.pem -outform PEM \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=Ars DevOps/CN=89.188.160.102"
```

### Ключи для телеграм-бота
закрытый ".key"
```
openssl genrsa -out client.key 4096
```
запрос на подпись ".csr" (certificate signing request)
```
openssl req -new -key client.key -out client.csr \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=Ars DevOps/CN=89.188.160.102"
```
подписанный сертификат ".pem"
```
openssl x509 -req -days 10950 -CA ca.pem -CAkey ca.key -set_serial 01 \
        -in client.csr -out client.pem -outform PEM 
```



## Запуск бота

В контейнере - не забыть сделать port redirect с реального EXTERNAL IP. Запускаем:
```
npm install
node index.js $TOKEN <INSERT_EXTERNAL_IP_HERE> 8443 $PROVIDER_TOKEN
```

На production машине:
```
npm install
node index.js <INSERT_BOT_TOKEN_HERE> 89.188.160.102 8443 <INSERT_PROVIDER_TOKEN_HERE>
```



## Deploy

Деплой делаем через gulp утилитой rsync.
```
# gulp tools
npm install -g gulp-cli gulp rimraf gulp-rsync gulp-if gulp-util
npm link                gulp rimraf gulp-rsync gulp-if gulp-util

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



## Всякое
- [webhooks](https://core.telegram.org/bots/webhooks)
- [telegram API](https://core.telegram.org/bots/api)

Состояние бота через браузер на api.telegram.org
```
https://api.telegram.org/bot<INSERT_BOT_TOKEN_HERE>/getMe
https://api.telegram.org/bot<INSERT_BOT_TOKEN_HERE>/getWebhookInfo
```

Пара "ручных" запросов
```
# запрос к боту
curl -v -k https://89.188.160.102:8443/

# установить webhook
curl -F "url=https://89.188.160.102:8443/<INSERT_BOT_TOKEN_HERE>" \
     -F "certificate=@cert/client.pem" \
     https://api.telegram.org/bot<INSERT_BOT_TOKEN_HERE>/setWebhook
```