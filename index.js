var nodePath      = process.argv[0]
var appPath       = process.argv[1]
var token         = process.argv[2]
var whIp          = process.argv[3]
var whPort        = process.argv[4]

const fs          = require('fs')
const path        = require('path')
const Telegraf    = require('telegraf')
const bot         = new Telegraf(token)











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
console.log('https://'+whIp+':'+whPort+'/'+token)
bot.telegram.setWebhook('https://'+whIp+':'+whPort+'/'+token, {
  source: fs.readFileSync( path.join(__dirname, 'cert/client.pem') )
})

// Start https webhook
bot.startWebhook('/'+token, tlsOptions, whPort)










bot.on('message', (ctx) =>  {
  console.log(ctx)
  return ctx.reply('ДомОнлайн тут!')
})








/*
# Запросы руками
https://core.telegram.org/bots/webhooks
https://core.telegram.org/bots/api

https://api.telegram.org/bot<INSERT_TOKEN_HERE>/getMe
https://api.telegram.org/bot<INSERT_TOKEN_HERE>/getWebhookInfo

curl --tlsv1 -v -k https://89.188.160.102:8443/
curl -F "url=https://89.188.160.102:8443/xxx" -F "certificate=@cert/client.pem" https://api.telegram.org/bot<INSERT_TOKEN_HERE>/setWebhook
*/