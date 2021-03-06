# telegram-bot-telegraf



## Обзор
Telegram bot на базе фреймворка [telegraf](https://github.com/telegraf/telegraf).

![Image](https://github.com/ars-anosov/telegram-bot-telegraf/blob/master/images/drawio_main.png)

1. Принимает платежи через [Яндекс Кассу](https://kassa.yandex.ru/)
2. Взаимодействует с API клиентской [bitrix24](https://www.bitrix24.ru/)
3. Взаимодействует с инфраструктурой клиента через его CRM систему

## Установка / Использование

### Окружение
Работал в следующем окружении:

- **telegram-bot-telegraf** - Docker-контейнер NodeJS v.9 для разработки. Деплой утилитой **rsync**.
- **WEBHOOK_IP** - IP Pruduction машины. Доступна по **HTTPS**, **HTTP**. Умеет **rsync**.
- **TOKEN** - токен бота, выдает @BotFather
- **WEBHOOK_PORT** - https порт на Pruduction машине для WebHook от Telegram
- **PROVIDER_TOKEN** - токен платежной системы, привязанной к боту через @BotFather
- **BX_API_URL** - адрес клиентского портала на Bitrix24
- **BX_CLIENT_ID** - client_id приложения на Bitrix24
- **BX_CLIENT_SECRET** - client_secret приложения на Bitrix24
- **SMTP_USER** - почтовый адрес для рассылок через mail.ru
- **SMTP_PASS** - пароль mail.ru
- **DB_URL** - по этому URL выдает список Telegram подписчиков
- **8443** - https порт на Pruduction машине для WebHook от Telegram
- **8010** - http порт на Pruduction машине для OAuth2 запросов от Bitrix24

Разрешенные TCP-порты: 443, 80, 88, 8443 (см. [офф.док.](https://core.telegram.org/bots/api) метод "setWebhook").
```
cd telegram-bot-telegraf

sudo docker run \
  --name telegram-bot-telegraf \
  -v $PWD:/telegram-bot-telegraf \
  -w /telegram-bot-telegraf \
  --publish=8443:8443 \
  --publish=8010:8010 \
  --env="WEBHOOK_IP=89.188.100.200" \
  --env="TOKEN=123456789:abcdefABCDEFabcdefABCDEFabcdefABCDE" \
  --env="PROVIDER_TOKEN=123456789:LIVE:1234" \
  --env="BX_API_URL=https://xxx.bitrix24.ru" \
  --env="BX_CLIENT_ID=local.1ab2345678cd90.12345678" \
  --env="BX_CLIENT_SECRET=abcdefABCDEF123abcdefABCDEF123abcdefABCDEF123abcde" \
  --env="SMTP_USER=telegram@xxx.ru" \
  --env="SMTP_PASS=yyy" \
  --env="DB_URL=secret_path" \
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

Создавал x.509 PKI по порядку. Ниже CN=<INSERT_WEBHOOK_IP_HERE> меняем на свой внешний IP.

### CA (Certification Authority)
```
openssl genrsa -out ca.key 4096

openssl req -new -x509 -days 10950 -key ca.key -out ca.pem -outform PEM \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=Ars DevOps/CN=<INSERT_WEBHOOK_IP_HERE>"
```

### Ключи для телеграм-бота
закрытый ".key"
```
openssl genrsa -out client.key 4096
```
запрос на подпись ".csr" (certificate signing request)
```
openssl req -new -key client.key -out client.csr \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=Ars DevOps/CN=<INSERT_WEBHOOK_IP_HERE>"
```
подписанный сертификат ".pem"
```
openssl x509 -req -days 10950 -CA ca.pem -CAkey ca.key -set_serial 01 \
        -in client.csr -out client.pem -outform PEM 
```



## Запуск бота

В контейнере - не забыть сделать port redirect 8443 и 8010 с реального EXTERNAL IP. Запускаем:
```
npm install
node index.js $WEBHOOK_IP $TOKEN $PROVIDER_TOKEN \
              $BX_API_URL $BX_CLIENT_ID $BX_CLIENT_SECRET \
              $SMTP_USER $SMTP_PASS
```

На production машине:
```
npm install
node index.js <INSERT_WEBHOOK_IP> <INSERT_TOKEN> <INSERT_PROVIDER_TOKEN> \
              <INSERT_BX_API_URL> <INSERT_BX_CLIENT_ID> <INSERT_BX_CLIENT_SECRET> \
              <INSERT_SMTP_USER> <INSERT_SMTP_PASS>
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
scp /root/.ssh/id_rsa.pub arseny@<INSERT_WEBHOOK_IP_HERE>:~/
ssh -t arseny@<INSERT_WEBHOOK_IP_HERE> 'cat id_rsa.pub >> ~/.ssh/authorized_keys'

# Deploy
gulp deploy
```



## Всякое
- [telegram API](https://core.telegram.org/bots/api)
- [webhooks](https://core.telegram.org/bots/webhooks)
- [bitrix24 OAuth2](https://dev.1c-bitrix.ru/learning/course/index.php?COURSE_ID=99&LESSON_ID=2486#full_auth)

Состояние бота через браузер на api.telegram.org
```
https://api.telegram.org/bot<INSERT_BOT_TOKEN_HERE>/getMe
https://api.telegram.org/bot<INSERT_BOT_TOKEN_HERE>/getWebhookInfo
```

Несколько "ручных" запросов
```
# установить webhook
curl -F "url=https://<INSERT_WEBHOOK_IP_HERE>:8443/<INSERT_BOT_TOKEN_HERE>" \
     -F "certificate=@cert/client.pem" \
     https://api.telegram.org/bot<INSERT_BOT_TOKEN_HERE>/setWebhook

# запрос к боту
curl -v -k https://<INSERT_WEBHOOK_IP_HERE>:8443/
```

Пользователь сообщает bitrix24 что он авторизован - в ответ OAuth2
```
https://xxx.bitrix24.ru/oauth/authorize/?client_id=<INSERT_BX_CLIENT_ID>
```