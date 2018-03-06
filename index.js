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

const request = require('request');
var reqOptions = {  
  url:      'http://xn--80ahqgegdcb.xn--p1ai/newtest.php',
  method:   'POST',
  encoding: 'utf8'
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
bot.context.localDb = []


const session = require('telegraf/session')
const Router = require('telegraf/router')
const Extra = require('telegraf/extra')
//const Markup = require('telegraf/markup')
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
  console.log('timer middleware ------------------------:')
  console.log('Response time %sms', ms)
})

// Naive authorization middleware
bot.use((ctx, next) => {
  ctx.state.role = false
  let objRef = {}

  if (ctx.message)                { objRef = ctx.message }
  if (ctx.update.callback_query)  { objRef = ctx.update.callback_query }

  console.log('role middleware ------------------------:')
  console.log(objRef)
  if (objRef.from) {
    ctx.localDb.map( (row, i) => {
      if (row.id === objRef.from.id) { ctx.state.role = row }
    })
  }

  return next()
})

// session
bot.use(session({ ttl: 10 }))











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


const id_input_text = 'Напишите свой <b>ID</b>\n(числовое значение, полученное Вами при включении)'
const id_change_text = 'Ok. Напишите новый ID.'


const level_1_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton('\u26F3 Я абонент домонлайн.рф', 'abonent:123'),
    m.callbackButton('\u26F9 Я хочу стать абонентом', 'not_abonent:456')
  ], {columns: 2}))


const level_2_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton('\u26FD Проверить баланс', 'balance_check:456'),
    m.callbackButton('\u267B У меня другой ID', 'id_change:123'),
    m.callbackButton('\u2693 Start', 'go_start:456')
  ], {columns: 2}))

const level_last_markup = Extra
  .HTML()
  //.markup((m) => m.inlineKeyboard([
  //  m.callbackButton('\u2693 Start', 'go_start:456')
  //], {columns: 1}))









const callbackRouter = new Router(({ callbackQuery }) => {
  if (!callbackQuery.data) {
    return
  }

  console.log('Router callbackQuery ------------------------:')
  console.log(callbackQuery)
  const parts = callbackQuery.data.split(':')
  return {
    route: parts[0],
    state: {
      amount: parseInt(parts[1], 10) || 0
    }
  }
})

callbackRouter.on('abonent', (ctx) => {
  if (ctx.state.role) {
    ctx.session.value = 'Ваш ID: <b>'+ctx.state.role.do.id+'</b>'
    ctx.editMessageText(ctx.session.value, level_2_markup).catch(() => undefined)
  }
  else {
    ctx.session.value = id_input_text
    ctx.editMessageText(ctx.session.value, level_last_markup).catch(() => undefined)
  }
})

callbackRouter.on('not_abonent', (ctx) => {
  ctx.session.value = 'В разработке...'
  ctx.editMessageText(ctx.session.value, level_1_markup).catch(() => undefined)
})

callbackRouter.on('id_change', (ctx) => {
  ctx.session.value = id_change_text
  ctx.editMessageText(ctx.session.value, level_last_markup).catch(() => undefined)
})

callbackRouter.on('balance_check', (ctx) => {

  let reqOp = {...reqOptions}
  reqOp.form = {request_type: 'SRGP_API_DOG_BALANCE', dog_id: ctx.state.role.do.id}
  
  request(reqOp, (requestErr, requestRes, requestBody) => {
    let resultJson = JSON.parse(requestBody)
    ctx.session.value = 'Ваш баланс: <b>'+resultJson[0]+' \u20BD</b>\nОплачено дней: <b>'+resultJson[1]+'</b>'
    //console.log(ctx.session.value)
    ctx.editMessageText(ctx.session.value, level_2_markup).catch(() => undefined)
  })

  ctx.editMessageText(new Date(), level_2_markup).catch(() => undefined)
})

callbackRouter.on('go_start', (ctx) => {
  ctx.session.value = 'start'
  ctx.editMessageText(ctx.session.value, level_1_markup).catch(() => undefined)
})

callbackRouter.otherwise((ctx) => ctx.reply('🌯'))



















bot.start((ctx) => {
  ctx.session.value = 'start'
  return ctx.reply(ctx.session.value, level_1_markup)
})
bot.on('callback_query', callbackRouter)
















bot.hears(/.*/, (ctx) => {
  console.log('<--------------- hears ---------------->')

  if (ctx.session.value === id_input_text) {
    let exists = false
    ctx.localDb.map( (row, i) => {
      if (row.id === ctx.message.from.id) { exists = i }
    })
    if (!exists) {
      ctx.message.from.do = {id: ctx.message.text}
      bot.context.localDb.push(ctx.message.from)
    }

    ctx.session.value = 'Успешно! ID присвоен.'
    ctx.reply(ctx.session.value, level_1_markup)
  }

  if (ctx.session.value === id_change_text) {
    ctx.localDb.map( (row, i) => {
      if (row.id === ctx.message.from.id) {
        bot.context.localDb[i].do.id = ctx.message.text
      }
    })

    ctx.session.value = 'Успешно! ID изменен.'
    ctx.reply(ctx.session.value, level_1_markup)
  }
  
})