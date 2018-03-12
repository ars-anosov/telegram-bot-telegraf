var nodePath      = process.argv[0]
var appPath       = process.argv[1]
var token         = process.argv[2]
var whIp          = process.argv[3]
var whPort        = process.argv[4]
var ykToken       = process.argv[5]
var whPath        = 'https://'+whIp+':'+whPort+'/'+token
console.log('webhook path: '+whPath)
console.log('kassa.yandex.ru provider_token: '+ykToken)

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

var localDb = JSON.parse( fs.readFileSync( path.join(__dirname, 'local_db.json') ) )

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
bot.context.globContextObj = {foo: 'bar'}


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
  // The recommended namespace to share information between middlewares
  ctx.state.role = false
  let objRef = {}

  if (ctx.message)                { objRef = ctx.message }
  if (ctx.update.callback_query)  { objRef = ctx.update.callback_query }

  console.log('role middleware ------------------------:')
  console.log(objRef)
  if (objRef.from) {
    ctx.state.role = localDb[objRef.from.id] ? localDb[objRef.from.id] : false
  }

  return next()
})

// session
bot.use(session())












function fixedFromCharCode (codePt) {
  if (codePt > 0xFFFF) {
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  }
  else {
    return String.fromCharCode(codePt);
  }
}


const hears_id_new = 'Ок. Напишите свой <b>ID</b>\n(числовое значение, полученное Вами при включении)'
const hears_id_change = 'Ok. Напишите новый ID.'


const level_1_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton('\u26F3 Я абонент домонлайн.рф', 'abonent'),
    m.callbackButton('\u26F9 Я хочу стать абонентом', 'not_abonent')
  ], {columns: 2}))

const level_2_1_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton(fixedFromCharCode(0x1F4BC)+' Проверить баланс',      'balance_check'),
    m.callbackButton(fixedFromCharCode(0x1F4B3)+' Пополнить баланс',      'balance_pay'),
    m.callbackButton(fixedFromCharCode(0x1F4DA)+' Сменить тариф',         'tarif_change'),
    m.callbackButton(fixedFromCharCode(0x1F334)+' Приостановить услуги',  'tarif_pause'),
    m.callbackButton(fixedFromCharCode(0x1F46B)+' Приведи друга',         'friends_invite'),
    m.callbackButton(fixedFromCharCode(0x1F697)+' Вызов специалиста',     'call_egineer'),
    m.callbackButton(fixedFromCharCode(0x26F3) +' У меня другой ID',      'id_change'),
    m.callbackButton(fixedFromCharCode(0x2716) +' Назад',                 'go_start')
  ], {columns: 2}))

const level_2_2_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton(fixedFromCharCode(0x1F4DA)+' Тарифы и услуги',       'tarif_info'),
    m.callbackButton(fixedFromCharCode(0x1F4CC)+' Заявка на включение',   'new_user_request'),
    m.callbackButton(fixedFromCharCode(0x1F4B8)+' Способы оплаты',        'pay_methods'),
    m.callbackButton(fixedFromCharCode(0x2754) +' Вопросы',               'issues'),
    m.callbackButton(fixedFromCharCode(0x2716) +' Назад',                 'go_start')
  ], {columns: 2}))

const level_last_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton(fixedFromCharCode(0x2716)+' Назад', 'go_start')
  ], {columns: 1}))










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
      rou: 'routed'
    }
  }
})

// level_1 ------------------------------------------------
callbackRouter.on('abonent', (ctx) => {
  if (ctx.state.role) {
    ctx.session.value = 'Ваш ID: <b>'+ctx.state.role.do.id+'</b>'
    ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
  }
  else {
    ctx.session.value = hears_id_new
    ctx.editMessageText(ctx.session.value, level_last_markup).catch(() => undefined)
  }
})

callbackRouter.on('not_abonent', (ctx) => {
  ctx.session.value = 'Я хочу стать абонентом (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_2_markup).catch(() => undefined)
})

// level_2_1 ----------------------------------------------
callbackRouter.on('id_change', (ctx) => {
  ctx.session.value = hears_id_change
  ctx.editMessageText(ctx.session.value, level_last_markup).catch(() => undefined)
})

callbackRouter.on('tarif_change', (ctx) => {
  ctx.session.value = 'Сменить тариф (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
})

callbackRouter.on('tarif_pause', (ctx) => {
  ctx.session.value = 'Приостановить услуги (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
})

callbackRouter.on('friends_invite', (ctx) => {
  ctx.session.value = 'Приведи друга (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
})

callbackRouter.on('call_egineer', (ctx) => {
  ctx.session.value = 'Вызов специалиста (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
})

callbackRouter.on('balance_check', (ctx) => {

  let reqOp = {...reqOptions}
  reqOp.form = {request_type: 'SRGP_API_DOG_BALANCE', dog_id: ctx.state.role.do.id}
  
  request(reqOp, (requestErr, requestRes, requestBody) => {
    let resultJson = JSON.parse(requestBody)
    ctx.session.value = 'Ваш баланс: <b>'+resultJson[0]+' \u20BD</b>\nОплачено дней: <b>'+resultJson[1]+'</b>'
    //console.log(ctx.session.value)
    ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
  })

  ctx.editMessageText(new Date(), level_2_1_markup).catch(() => undefined)
})

callbackRouter.on('balance_pay', (ctx) => {

  const invoice = {
    provider_token: ykToken,
    start_parameter: 'start_parameter_test',
    title: 'Абонент ID '+ctx.state.role.do.id,
    description: 'пополнение баланса',
    currency: 'RUB',
    is_flexible: false,   // true если есть shipping method
    prices: [
      { label: 'RUB', amount: 6000 }
    ],
    payload: 'Абонент ID '+ctx.state.role.do.id+' - пополнение баланса',
    provider_data: {
      receipt: {
        email: 'ars-anosov@yandex.ru',
        items: [
          {
            description: 'Абонент ID '+ctx.state.role.do.id,
            quantity: '1.00',
            amount: {
              value: '60.00',
              currency: 'RUB'
            },
            vat_code: 1
          }
        ]
      }
    }
  }

  //ctx.telegram.sendInvoice(ctx.message.chat.id, invoice)
  ctx.replyWithInvoice(invoice)
  .then((state) => {
    console.log('sendInvoice - Ok')
    console.log(state)
  })
  .catch((error) => {
    console.log('sendInvoice - Err')
    console.log(error)
  })

})

// level_2_2 ----------------------------------------------
callbackRouter.on('tarif_info', (ctx) => {
  ctx.session.value =
'<b>БЕЗ ОГРАНИЧЕНИЙ</b>: 500 ₽ / 30 дней\n'+
'<b>ОГРАНИЧЕННЫЙ</b> (скорость до 10 мб/с): 290 ₽ / 30 дней\n'+
'Подробней: <a href="http://xn--80ahqgegdcb.xn--p1ai/">на сайте</a>'

  ctx.editMessageText(ctx.session.value, level_2_2_markup).catch(() => undefined)
})

callbackRouter.on('new_user_request', (ctx) => {
  ctx.session.value = 'Заявка на включение (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_2_markup).catch(() => undefined)
})

callbackRouter.on('issues', (ctx) => {
  ctx.session.value = 'Вопросы (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_2_markup).catch(() => undefined)
})

callbackRouter.on('pay_methods', (ctx) => {
  ctx.session.value = 'Способы оплаты (в разработке)'
  ctx.editMessageText(ctx.session.value, level_2_2_markup).catch(() => undefined)
})

// all ----------------------------------------------------
callbackRouter.on('go_start', (ctx) => {
  ctx.session.value = 'Привет. Выбираем нужное, кликаем кнопки.'
  ctx.editMessageText(ctx.session.value, level_1_markup).catch(() => undefined)
})

callbackRouter.otherwise((ctx) => ctx.reply('🌯'))



















bot.start((ctx) => {
  ctx.session.value = 'Привет. Выбираем нужное, кликаем кнопки.'
  return ctx.reply(ctx.session.value, level_1_markup)
})
bot.on('callback_query', callbackRouter)

bot.on('pre_checkout_query', (ctx) => {
  console.log('on - pre_checkout_query')
  ctx.answerPreCheckoutQuery(true)
})
bot.on('successful_payment', () => console.log('on - successful_payment'))














bot.hears(/.*/, (ctx) => {
  console.log('<--------------- hears ---------------->')
  console.log(ctx.session)

  if (ctx.message) {
    switch(ctx.session.value) {


      // Новый ID
      case hears_id_new:
      
        if (localDb[ctx.message.from.id]) {
          ctx.session.value = 'Не прошло! В этом чате уже был присвоен ID'
          ctx.reply(ctx.session.value, level_1_markup)
        }
        else {
          localDb[ctx.message.from.id] = ctx.message.from
          localDb[ctx.message.from.id].do = {id: ctx.message.text}
  
          fs.writeFile(path.join(__dirname, 'local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
            if (err) throw err;
            console.log('local_db.json has been saved!');
          })
  
          ctx.session.value = 'Успешно! ID присвоен.'
          ctx.reply(ctx.session.value, level_1_markup)
        }

        break


      // Смена ID
      case hears_id_change:

        if (localDb[ctx.message.from.id]) {
          localDb[ctx.message.from.id].do = {id: ctx.message.text}
  
          fs.writeFile(path.join(__dirname, 'local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
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
        
        break


      default:
        ctx.session.value = 'Привет. Выбираем нужное, кликаем кнопки.'
        ctx.reply(ctx.session.value, level_1_markup)
        break
  
    }
  }
  
})