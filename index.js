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

// curl -d "request_type=SRGP_API_DOG_BALANCE&dog_id=01234513042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://xn--80ahqgegdcb.xn--p1ai/newtest.php
// curl -d "request_type=SRGP_API_DOG_BALANCE&dog_id=01234513042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://89.188.160.0:32180
const request = require('request');
var reqOptions = {  
  url:      'http://89.188.160.0:32180',
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
bot.context.localDb = JSON.parse( fs.readFileSync( path.join(__dirname, 'local_db.json') ) )


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
  console.log(ctx.localDb)
  if (objRef.from) {
    ctx.state.role = ctx.localDb[objRef.from.id] ? ctx.localDb[objRef.from.id] : false
  }

  return next()
})

// session
bot.use(session({ ttl: 10 }))














const hears_id_new = 'Ок. Напишите свой <b>ID</b>\n(числовое значение, полученное Вами при включении)'
const hears_id_change = 'Ok. Напишите новый ID.'


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
    ctx.session.value = hears_id_new
    ctx.editMessageText(ctx.session.value, level_last_markup).catch(() => undefined)
  }
})

callbackRouter.on('not_abonent', (ctx) => {
  ctx.session.value = 'В разработке...'
  ctx.editMessageText(ctx.session.value, level_1_markup).catch(() => undefined)
})

callbackRouter.on('id_change', (ctx) => {
  ctx.session.value = hears_id_change
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

  if (ctx.message) {

    // Новый ID
    if (ctx.session.value === hears_id_new) {
      if (ctx.localDb[ctx.message.from.id]) {
        ctx.session.value = 'Не прошло! В этом чате уже был присвоен ID'
        ctx.reply(ctx.session.value, level_1_markup)
      }
      else {
        ctx.localDb[ctx.message.from.id] = ctx.message.from
        ctx.localDb[ctx.message.from.id].do = {id: ctx.message.text}

        fs.writeFile(path.join(__dirname, 'local_db.json'), JSON.stringify(ctx.localDb, "", 2), 'utf8', (err) => {
          if (err) throw err;
          console.log('local_db.json has been saved!');
        })

        ctx.session.value = 'Успешно! ID присвоен.'
        ctx.reply(ctx.session.value, level_1_markup)
      }
    }

    // Смена ID
    if (ctx.session.value === hears_id_change) {
      if (ctx.localDb[ctx.message.from.id]) {
        ctx.localDb[ctx.message.from.id].do = {id: ctx.message.text}

        fs.writeFile(path.join(__dirname, 'local_db.json'), JSON.stringify(ctx.localDb, "", 2), 'utf8', (err) => {
          if (err) throw err;
          console.log('local_db.json has been saved!');
        })

        ctx.session.value = 'Успешно! ID изменен.'
        ctx.reply(ctx.session.value, level_1_markup)
      }
      else {
        ctx.session.value = 'Не прошло! В этом чате еще не было ID'
        ctx.reply(ctx.session.value, level_1_markup)
      }
    }

  }
  
})