// arg
const nodePath        = process.argv[0]
const appPath         = process.argv[1]
const whIp            = process.argv[2]
const token           = process.argv[3]
const ykToken         = process.argv[4]
const bxApiUrl        = process.argv[5]
const bxClientId      = process.argv[6]
const bxClientSecret  = process.argv[7]
const smtpUser        = process.argv[8]
const smtpPass        = process.argv[9]

// specific params
const whPort          = 8443
const oauthPort       = 8010
const bxEngineerId    = [105, 115]    // Артем, Владислав
const bxManagerId     = 30            // Катя

console.log('Telegram WebHook path:          https://'+whIp+':'+whPort+'/'+token)
console.log('kassa.yandex.ru provider_token: '+ykToken)
console.log('Bitrix24 API url:               '+bxApiUrl)
console.log('Bitrix24 OAuth2 path:           http://'+whIp+':'+oauthPort+'/oauth')
console.log('Bitrix24 client_id:             '+bxClientId)
console.log('Bitrix24 client_secret:         '+bxClientSecret)
console.log('smtp.mail.ru user:              '+smtpUser)
console.log('smtp.mail.ru password:          '+smtpPass)
console.log('---')

// my modules
const tgTools         = require('./tools/tg_tools')
const bxTools         = require('./tools/bx_tools')
const rrTools         = require('./tools/rr_tools')
const stateControl    = require('./middleware/stateControl')

const id_change       = require('./controllers/id_change')
const balance_check   = require('./controllers/balance_check')
const yk_sendInvoice  = require('./controllers/yk_sendInvoice')
const tarif_change    = require('./controllers/tarif_change')
const tarif_pause     = require('./controllers/tarif_pause')
const engineer_search = require('./controllers/engineer_search')
const engineer_invite = require('./controllers/engineer_invite')
const friends_invite  = require('./controllers/friends_invite')

const tarif_info      = require('./controllers/tarif_info')
const new_abonent     = require('./controllers/new_abonent')
const pay_methods     = require('./controllers/pay_methods')


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
// bitrix24
localDb.bxData = {
  'clientId':       bxClientId,
  'clientSecret':   bxClientSecret,
  'apiUrl':         bxApiUrl,
  'engineerId':     bxEngineerId,
  'managerId':      bxManagerId
}
// smtp.mail.ru
localDb.smtpData = {
  'user': smtpUser,
  'pass': smtpPass
}
// Сввзка с проектом replacer-react
localDb.replacerData = {
  'addr': {},
  'sum':  {}
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

// Первичный ответ на OAuth2
var app2 = express()
app2.get('/oauth', function (req, res) {
  bxTools.oauthRes(req.query, localDb)
  res.send('OAuth2 data accepted.')
})
app2.listen(oauthPort, () => {
  console.log('express app2 started on http server, port: '+oauthPort)

  // Обновляю OAuth2 access_token
  bxTools.oauthRefrash(localDb)
  // Обновляю переменные из проекта replacer-react
  rrTools.getVars(localDb, 'http://xn--80ahqgegdcb.xn--p1ai/assets/scripts/replacer__addr.js')
  rrTools.getVars(localDb, 'http://xn--80ahqgegdcb.xn--p1ai/assets/scripts/replacer__sum.js')

  // и далее - каждые 10 минут
  setInterval(() => {
    bxTools.oauthRefrash(localDb)
    rrTools.getVars(localDb, 'http://xn--80ahqgegdcb.xn--p1ai/assets/scripts/replacer__addr.js')
    rrTools.getVars(localDb, 'http://xn--80ahqgegdcb.xn--p1ai/assets/scripts/replacer__sum.js')
  }, 600000)

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
const hears_friend_name           = 'Ok. Как зовут друга?'
const hears_friend_phone          = 'Ok. Напишите как связаться с Вашим другом'
const hears_pause_from            = 'Ok. Напишите с какой даты приостановить услуги\nФормат <b>ГГГГ-ММ-ДД</b> (например 2018-11-15)'
const hears_pause_to              = 'Ok. Напишите до какой даты приостановить услуги\nФормат <b>ГГГГ-ММ-ДД</b> (например 2018-11-15)'
const hears_newAbon_name          = 'Ok. Как Вас зовут?'
const hears_newAbon_phone         = 'Ok. Напишите как с Вами можно связаться'
const hears_newAbon_dom           = 'Ok. Напишите номер дома'
const hears_newAbon_kv            = 'Ok. Напишите номер квартиры'

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
    m.callbackButton(tgTools.fixedFromCharCode(0x1F697)+' Вызов специалиста',     'engineer_search'), // внутри route = engineer_invite
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
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4CC)+' Заявка на включение',   'new_abon_request'),
    m.callbackButton(tgTools.fixedFromCharCode(0x1F4B8)+' Способы оплаты',        'pay_methods'),
    m.urlButton     (tgTools.fixedFromCharCode(0x2754) +' Вопросы',               'https://t.me/domonline_rf'),
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
      rou1: parts[1],
      rou2: parts[2]
    }
  }

})

// level_1 ------------------------------------------------
callbackRouter.on('abonent', (ctx) => {
  if (ctx.state.role) {
    ctx.session.value =
      'Здравствуй, <b>'+ctx.state.role.do.fio+'</b>'+
      '\nID: <b>'+ctx.state.role.do.id+'</b>'
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
  ctx.session.value = 'Выбираем тариф'
  ctx.editMessageText(ctx.session.value, level_2_1_tarif_markup).catch(() => undefined)
})

callbackRouter.on('tarif_change_nolimits', (ctx) => {
  tarif_change(ctx, localDb, '16.7', level_2_1_markup)
})

callbackRouter.on('tarif_change_limited', (ctx) => {
  tarif_change(ctx, localDb, '9.7', level_2_1_markup)
})

callbackRouter.on('tarif_pause', (ctx) => {
  ctx.session.value = hears_pause_from
  ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
})

callbackRouter.on('friends_invite', (ctx) => {
  ctx.session.value = hears_friend_name
  ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
})

callbackRouter.on('engineer_search', (ctx) => {
  engineer_search(ctx, level_2_1_markup, localDb)
})

callbackRouter.on('engineer_invite', (ctx) => {
  engineer_invite(ctx, level_2_1_markup, localDb)
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
  tarif_info(ctx, level_2_2_markup, localDb)
})

callbackRouter.on('new_abon_request', (ctx) => {
  ctx.session.value = hears_newAbon_name
  ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
})

callbackRouter.on('new_abon_addr', (ctx) => {
  ctx.session.newAbon.addrNp = ctx.state.rou1

  ctx.session.value = 'Выбираем улицу'
  let tmp_markup = Extra
  .HTML()
  .markup( (m) => {
    let buttonArr = []
    localDb.replacerData.addr[ctx.session.newAbon.addrNp].map((row, i) => {
      if (i > 0) {
        buttonArr.push( m.callbackButton(row, 'new_abon_addr2:'+row) )
      }
    })
    buttonArr.push( m.callbackButton(tgTools.fixedFromCharCode(0x2716) +' Назад', 'not_abonent') )
    return m.inlineKeyboard(buttonArr, {columns: 1})
  })

  ctx.reply(ctx.session.value, tmp_markup).catch(() => undefined)
})

callbackRouter.on('new_abon_addr2', (ctx) => {
  ctx.session.newAbon.addrStreet = ctx.state.rou1

  ctx.session.value = hears_newAbon_dom
  ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
})

callbackRouter.on('issues', (ctx) => {
  //ctx.answerCbQuery('Answer to the Ultimate Question of Life, the Universe, and Everything', false, 'https://t.me/ArsTeleBot')
  ctx.session.value = 'Консультант - @ars_anosov'
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
      'Здравствуй, <b>'+ctx.state.role.do.fio+'</b>'+
      '\nID: <b>'+ctx.state.role.do.id+'</b>'
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
        id_change(ctx, localDb, level_2_1_markup, level_1_markup)
        break

      // Смена ID
      case hears_id_change:
        id_change(ctx, localDb, level_2_1_markup, level_1_markup)
        break

      // Сумма пополнения баланса для invoice
      case hears_invoice_balance_sum:
        ctx.session.invoice = {}
        ctx.session.invoice.abon = ctx.message.text
        yk_sendInvoice(ctx, ykToken)
        break

      // Приведи друга (Имя) ----------------------------------
      case hears_friend_name:
        ctx.session.friend = {}
        ctx.session.friend.fio = ctx.message.text
        ctx.session.value = hears_friend_phone 
        ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
        break
      // Приведи друга (контактные данные)
      case hears_friend_phone:
        ctx.session.friend.phone = ctx.message.text
        friends_invite(ctx, level_2_1_markup, localDb)
        break

      // Приостановаить услуги (from) --------------------------
      case hears_pause_from:
        ctx.session.pause = {}
        ctx.session.pause.from = ctx.message.text
        ctx.session.value = hears_pause_to 
        ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
        break
      // Приостановаить услуги (to)
      case hears_pause_to:
        ctx.session.pause.to = ctx.message.text
        tarif_pause(ctx, level_2_1_markup, localDb)
        break

      // Заявка на включение (Имя) -----------------------------
      case hears_newAbon_name:
        ctx.session.newAbon = {}
        ctx.session.newAbon.fio = ctx.message.text
        ctx.session.value = hears_newAbon_phone 
        ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
        break
      // Заявка на включение (контактные данные)
      case hears_newAbon_phone:
        ctx.session.newAbon.phone = ctx.message.text

        ctx.session.value = 'Выбираем населенный пункт'
        let tmp_markup = Extra
        .HTML()
        .markup( (m) => {
          let buttonArr = []
          for (let key in localDb.replacerData.addr) {
            buttonArr.push( m.callbackButton(key, 'new_abon_addr:'+key) )
          }
          buttonArr.push( m.callbackButton(tgTools.fixedFromCharCode(0x2716) +' Назад', 'not_abonent') )
          return m.inlineKeyboard(buttonArr, {columns: 1})
        })

        ctx.reply(ctx.session.value, tmp_markup).catch(() => undefined)
        break
      // Заявка на включение (дом)
      case hears_newAbon_dom:
        ctx.session.newAbon.addrDom = ctx.message.text
        ctx.session.value = hears_newAbon_kv 
        ctx.reply(ctx.session.value, level_last_markup).catch(() => undefined)
        break
      // Заявка на включение (квартира)
      case hears_newAbon_kv:
        ctx.session.newAbon.addrKv = ctx.message.text
        new_abonent(ctx, level_2_2_markup, localDb)
        break

      default:
        ctx.session.value = 'Привет \u270B'
        ctx.reply(ctx.session.value, level_1_markup)
        break
  
    }
  }
  
})