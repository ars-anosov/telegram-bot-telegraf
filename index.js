var nodePath      = process.argv[0]
var appPath       = process.argv[1]
var token         = process.argv[2]
var whIp          = process.argv[3]
var whPort        = process.argv[4]
var whPath        = 'https://'+whIp+':'+whPort+'/'+token
console.log('webhook path: '+whPath)

const fs          = require('fs')
const path        = require('path')
const https       = require('https')
const express     = require('express')

const Telegraf    = require('telegraf')
const bot         = new Telegraf(token)

const sslCredentials = {
  key:  fs.readFileSync( path.join(__dirname, 'cert/client.key') ),
  cert: fs.readFileSync( path.join(__dirname, 'cert/client.pem') ),
  ca:   fs.readFileSync( path.join(__dirname, 'cert/ca.pem') )
}



// Set telegram webhook (upload cert)
bot.telegram.setWebhook('https://'+whIp+':'+whPort+'/'+token, {source: sslCredentials.cert})
/*
// TLS options
const tlsOptions = {
  key: sslCredentials.key,   
  cert: sslCredentials.cert,
  ca: [
    // This is necessary only if the client uses the self-signed certificate.
    sslCredentials.ca
  ]
}

// Start https webhook (https server)
bot.startWebhook('/'+token, tlsOptions, whPort)
*/



//----------------------------------------------------------------------------|
//                                  express                                   |
//----------------------------------------------------------------------------|
var app = express()
var httpsServer = https.createServer(sslCredentials, app)

app.get('/', (req, res) => res.send('Answer to the Ultimate Question of Life, the Universe, and Everything\n'))
app.use(bot.webhookCallback('/'+token))

httpsServer.listen(whPort, () => {
  console.log('express app started on https server, port: '+whPort)
})



//----------------------------------------------------------------------------|
//                                    bot                                     |
//----------------------------------------------------------------------------|

// context extend ------------------------------------------------------------
bot.context.localDb = [

]


//const Router = require('telegraf/router')
const session = require('telegraf/session')
//const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
//
//const Stage = require('telegraf/stage')
//const Scene = require('telegraf/scenes/base')
//const { enter, leave } = Stage




// middleware ----------------------------------------------------------------

// timer
bot.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log('Response time %sms', ms)
})

// Naive authorization middleware
bot.use((ctx, next) => {
  ctx.state.role = false
  ctx.localDb.map( (row, i) => {
    if (row.id === ctx.message.from.id) { ctx.state.role = row }
  })
  return next()
})

// session
bot.use(session())






const request = require('request');
var reqOptions = {  
  url:      'http://xn--80ahqgegdcb.xn--p1ai/newtest.php',
  method:   'POST',
  encoding: 'utf8'
}




/*
Я абонент домонлан.рф

  Введите свой ID (числовое значение, полученное Вами при включении)
  
  Поздравляем! Вы подписались на домонлайн.рф.
  Используйте /off чтобы приостановить подписку.

  Ваша подписка деактивирована.
  Вы всегда можете включить ее снова с помощью команды /on.

Я хочу стать абонентом домонлайн.рф
*/

// curl -d "request_type=SRGP_API_DOG_BALANCE&dog_id=01234513042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://xn--80ahqgegdcb.xn--p1ai/newtest.php

const l1_1        = '\u26F3 Я абонент домонлайн.рф'
const l1_2        = '\u26F9 Я хочу стать абонентом'
const l1_1_l2_1   = 'Проверить баланс'


bot.start((ctx) => {
  ctx.reply(
    'Поздравляем '+ctx.message.from.username+'! Вы подписались на домонлайн.рф.\nИспользуйте /off чтобы приостановить подписку.',
    Markup
    .keyboard([
      [l1_1, l1_2]
    ])
    .oneTime()
    .resize()
    .extra()
  )
})



bot.hears(l1_1, ctx => {
  
  if (ctx.state.role) {
    ctx.reply(
      'Ваш ID '+ctx.state.role.do.id,
      Markup
      .keyboard([
        [l1_1_l2_1, '/start']
      ])
      .oneTime()
      .resize()
      .extra()
    )
  }
  else {
    ctx.reply('Введите свой ID (числовое значение, полученное Вами при включении)')
  }

})




bot.hears(l1_1_l2_1, (ctx) => {
  let reqOp = {...reqOptions}
  reqOp.form = {request_type: 'SRGP_API_DOG_BALANCE', dog_id: ctx.state.role.do.id}
  
  let resultJson = ['x', 'x']
  request(reqOp, (requestErr, requestRes, requestBody) => {
    resultJson = JSON.parse(requestBody)
    ctx.reply('Ваш баланс: '+resultJson[0]+' \u20BD')
    ctx.reply('Оплачено дней: '+resultJson[1])
  })
  ctx.reply('Запрос данных...')
})



bot.hears(l1_2, ctx => {
  ctx.reply('Превращаемся в абонента.')
})

