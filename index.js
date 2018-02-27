var nodePath = process.argv[0];
var appPath = process.argv[1];
var token = process.argv[2];
 
console.log("token: " + token);



const Telegraf = require('telegraf')
var fs = require('fs'),
    path = require('path')


const bot = new Telegraf(token)











// TLS options
const tlsOptions = {
  key: fs.readFileSync( path.join(__dirname, 'cert/client.key') ),   
  cert: fs.readFileSync( path.join(__dirname, 'cert/client.pem') ),
  ca: [
    // This is necessary only if the client uses the self-signed certificate.
    fs.readFileSync( path.join(__dirname, 'cert/ca.pem') )
  ]
}

// Set telegram webhook (upload cert)
bot.telegram.setWebhook('https://89.188.160.102:8443/xxx', {
  source: fs.readFileSync( path.join(__dirname, 'cert/client.pem') )
})

// Start https webhook
bot.startWebhook('/xxx', tlsOptions, 8443)










bot.on('message', (ctx) =>  {
  console.log(ctx.message)
  return ctx.reply('Hey there!')
})







/*
# Пара для сервера
https://core.telegram.org/bots/self-signed

openssl req -newkey rsa:2048 -sha256 -nodes -keyout server-key.key -x509 -days 10950 -out server-cert.pem -subj "/C=RU/ST=Moscow/L=Moscow/O=Test Company/CN=89.188.160.102"


  # Всякое для CA
  http://blog.regolit.com/2010/02/16/personal-ca-and-self-signed-certificates

  # CA
  openssl genrsa -out ca.key 2048
  openssl req -new -x509 -days 10950 -key ca.key -out ca.crt -subj "/C=RU/ST=Moscow/L=Moscow/O=Test Company/CN=89.188.160.102"
  openssl x509 -in ca.crt -out ca.pem -outform PEM

  # новый ключ клиента
  openssl genrsa -out client.key 2048

  # запрос на подпись certificate signing request (csr)
  openssl req -new -key client.key -out client.csr -subj "/C=RU/ST=Moscow/L=Moscow/O=Test Company/CN=89.188.160.102"

  # отправляем в CA на подпись
  openssl x509 -req -days 10950 -CA ca.crt -CAkey ca.key -set_serial 01 -in client.csr -out client.crt 
  openssl x509 -in client.crt -out client.pem -outform PEM


# На ручнике
https://core.telegram.org/bots/webhooks

https://api.telegram.org/bot<INSERT_TOKEN_HERE>/getMe

curl --tlsv1 -v -k https://89.188.160.102:8443/

curl -F "url=https://89.188.160.102:8443/xxx" \
     -F "certificate=@cert/client.pem" \
    https://api.telegram.org/bot<INSERT_TOKEN_HERE>/setWebhook
*/