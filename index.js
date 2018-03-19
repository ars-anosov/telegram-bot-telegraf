// arg
var nodePath      = process.argv[0]
var appPath       = process.argv[1]
var token         = process.argv[2]
var whIp          = process.argv[3]
var whPort        = process.argv[4]
var ykToken       = process.argv[5]
var whPath        = 'https://'+whIp+':'+whPort+'/'+token
console.log('webhook path: '+whPath)
console.log('kassa.yandex.ru provider_token: '+ykToken)

// my modules
const tgTools         = require('./tools/tg_tools')
const stateControl    = require('./middleware/stateControl')

const balance_check   = require('./controllers/balance_check')
const yk_sendInvoice  = require('./controllers/yk_sendInvoice')
const tarif_info      = require('./controllers/tarif_info')
const pay_methods      = require('./controllers/pay_methods')

const hears_id_change_do  = require('./controllers/hears_id_change')


// fs
const fs          = require('fs')
const path        = require('path')

// https
const https       = require('https')
const express     = require('express')
const sslCredentials = {
  key:  fs.readFileSync( path.join(__dirname, 'cert/client.key') ),
  cert: fs.readFileSync( path.join(__dirname, 'cert/client.pem') ),
  ca:   fs.readFileSync( path.join(__dirname, 'cert/ca.pem') )
}

// telegraf
const Telegraf    = require('telegraf')
const bot         = new Telegraf(token)

// localDb
var localDb = JSON.parse( fs.readFileSync( path.join(__dirname, 'local_db.json') ) )









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

// addons ---------------------------------------------------------------------
const session   = require('telegraf/session')
const Router    = require('telegraf/router')
const Extra     = require('telegraf/extra')

// context extend -------------------------------------------------------------
bot.context.globContextObj = {foo: 'bar'}

// middleware -----------------------------------------------------------------

// --- session
bot.use(session())

// --- state   >   The recommended namespace to share information between middlewares
bot.use(stateControl(localDb))









// heras match texts ----------------------------------------------------------
const hears_id_new                = 'Ок. Напишите свой <b>ID</b>\n(числовое значение, полученное Вами при включении)'
const hears_id_change             = 'Ok. Напишите новый <b>ID</b>'
const hears_invoice_balance_sum   = 'Ok. Напишите сумму пополнения баланса <b>\u20BD</b>'



// markups --------------------------------------------------------------------
const level_1_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton('\u26F3 Я абонент домонлайн.рф', 'abonent'),
    m.callbackButton('\u26F9 Я хочу стать абонентом', 'not_abonent')
  ], {columns: 2}))

const level_2_1_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4BC)+' Проверить баланс',      'balance_check'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4B3)+' Пополнить баланс',      'yk_startInvoice'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4DA)+' Сменить тариф',         'tarif_change'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F334)+' Приостановить услуги',  'tarif_pause'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F46B)+' Приведи друга',         'friends_invite'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F697)+' Вызов специалиста',     'call_egineer'),
    m.callbackButton(tgTools.fixedFromCharCode(0x26F3) +' У меня другой ID',      'id_change'),
    m.callbackButton(tgTools.fixedFromCharCode(0x2716) +' Назад',                 'go_start')
  ], {columns: 2}))

const level_2_1_tarif_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton('Без ограничений', 'tarif_change_nolimits'),
    m.callbackButton('Ограниченный',    'tarif_change_limited'),
    m.callbackButton(tgTools.fixedFromCharCode(0x2716) +' Назад',                 'abonent')
  ], {columns: 2}))

const level_2_2_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4DA)+' Тарифы и услуги',       'tarif_info'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4CC)+' Заявка на включение',   'new_user_request'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4B8)+' Способы оплаты',        'pay_methods'),
    m.callbackButton(tgTools.fixedFromCharCode(0x2754) +' Вопросы',               'issues'),
    m.callbackButton(tgTools.fixedFromCharCode(0x2716) +' Назад',                 'go_start')
  ], {columns: 2}))

const level_last_markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton(tgTools.fixedFromCharCode(0x2716)+' Назад', 'go_start')
  ], {columns: 1}))









// callbackRouter -------------------------------------------------------------
const callbackRouter = new Router(({ callbackQuery }) => {
  if (!callbackQuery.data) {
    return
  }

  console.log('\nRouter callbackQuery -----------------------------------------:')
  console.log('--- data:')
  console.log(callbackQuery.data)
  console.log('--- message.text:')
  console.log(callbackQuery.message.text)

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
    ctx.session.value =
      '<b>'+ctx.state.role.do.fio+'</b>'+
      '\nВаш ID: <b>'+ctx.state.role.do.id+'</b>'
    ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
  }
  else {
    ctx.session.value = hears_id_new
    ctx.editMessageText(ctx.session.value, level_last_markup).catch(() => undefined)
  }
})

callbackRouter.on('not_abonent', (ctx) => {
  ctx.session.value = 'Я хочу стать абонентом'
  ctx.editMessageText(ctx.session.value, level_2_2_markup).catch(() => undefined)
})

// level_2_1 ----------------------------------------------
callbackRouter.on('id_change', (ctx) => {
  ctx.session.value = hears_id_change
  ctx.editMessageText(ctx.session.value, level_last_markup).catch(() => undefined)
})

callbackRouter.on('tarif_change', (ctx) => {
// request_type=SRGP_API_UPD_TARIF_TYPE&dog_id=0390017102017&tarif_type=16.7
// 16.7 - без ограничений
// 9.7 ограниченный
  ctx.session.value = 'Выбираем тариф'
  ctx.editMessageText(ctx.session.value, level_2_1_tarif_markup).catch(() => undefined)
})

callbackRouter.on('tarif_change_nolimits', (ctx) => {
  ctx.session.value = 'Меняем на "без ограничений"'
  ctx.editMessageText(ctx.session.value, level_2_1_markup).catch(() => undefined)
})

callbackRouter.on('tarif_change_limited', (ctx) => {
  ctx.session.value = 'Меняем на "ограниченный"'
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
  balance_check(ctx, level_2_1_markup)
})

callbackRouter.on('yk_startInvoice', (ctx) => {
  ctx.session.value = hears_invoice_balance_sum  // go hears
  ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
})

// level_2_2 ----------------------------------------------
callbackRouter.on('tarif_info', (ctx) => {
  tarif_info(ctx, level_2_2_markup)
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
  pay_methods(ctx, level_2_2_markup)
})

// all ----------------------------------------------------
callbackRouter.on('go_start', (ctx) => {
  ctx.session.value = 'Привет \u270B'
  ctx.editMessageText(ctx.session.value, level_1_markup).catch(() => undefined)
})

callbackRouter.otherwise((ctx) => ctx.reply('🌯'))









// go start
bot.start((ctx) => {
  if (ctx.state.role) {
    ctx.session.value =
      '<b>'+ctx.state.role.do.fio+'</b>'+
      '\nВаш ID: <b>'+ctx.state.role.do.id+'</b>'
    ctx.reply(ctx.session.value, level_2_1_markup)
  }
  else {
    ctx.session.value = 'Привет \u270B'
    ctx.reply(ctx.session.value, level_1_markup)
  }
})

// go callbackRouter
bot.on('callback_query', callbackRouter)

// shipping_query finish
bot.on('shipping_query', ({ answerShippingQuery }) => answerShippingQuery(true, []))

// pre_checkout_query finish
bot.on('pre_checkout_query', (ctx) => {
  console.log('on - pre_checkout_query')
  ctx.answerPreCheckoutQuery(true)
  .then((state) => {
    console.log('answerPreCheckoutQuery - Ok')
    console.log(state)
  })
  .catch((error) => {
    console.log('answerPreCheckoutQuery - Err')
    console.log(error)
  })
})

// successful_payment finish
bot.on('successful_payment', () => console.log('on - successful_payment'))














bot.hears(/.*/, (ctx) => {
  console.log('>>> hears -------------------------------------------------------------:')
  console.log('--- updateType:')
  console.log(ctx.updateType)

  if (ctx.updateType === 'message') {
    console.log('--- message:')
    console.log(ctx.message)
    console.log('--- session:')
    console.log(ctx.session)

    switch(ctx.session.value) {

      // Новый ID
      case hears_id_new:
        hears_id_change_do(ctx, localDb, level_1_markup)
        break

      // Смена ID
      case hears_id_change:
        hears_id_change_do(ctx, localDb, level_1_markup)
        break

      // Сумма пополнения баланса для invoice
      case hears_invoice_balance_sum:
        ctx.session.invoice = {}
        ctx.session.invoice.abon = ctx.message.text

        // go next hears
        //ctx.session.value = hears_invoice_balance_sum2 
        //ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)

        // final result
        yk_sendInvoice(ctx, ykToken)
        break

      default:
        ctx.session.value = 'Привет \u270B'
        ctx.reply(ctx.session.value, level_1_markup)
        break
  
    }
  }
  
})