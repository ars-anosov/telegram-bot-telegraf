'use strict';

const nodemailer  = require('nodemailer')


// https://kassa.yandex.ru/manuals/telegram
// https://core.telegram.org/bots/api#sendinvoice

module.exports = function(ctx, ykToken, localDb) {
  console.log('\ncontroller yk_sendInvoice ------------------------------------:')
  console.log(ctx.session)

  ctx.session.value = 'Привет \u270B'
  ctx.reply('Фрмируется платеж, ждите... Вернуться назад - пишем /start')

  if (ctx.session.invoice) {

    const invoice = {
      provider_token: ykToken,
      start_parameter: 'test',
      title: 'Абон. плата',
      description: 'Абонент '+ctx.state.role.do.id,
      currency: 'RUB',
      //photo_url: 'http://xn--80ahqgegdcb.xn--p1ai/assets/images/logo.png',
      is_flexible: false,   // true if shipping method
      prices: [
        { label: 'Абон. плата', amount: parseInt(ctx.session.invoice.abon+'00') }
      ],
      payload: 'Абон.плата, абонент '+ctx.state.role.do.id,
      provider_data: {
        receipt: {
          email: 'ars-anosov@yandex.ru',    // must be
          items: [
            {
              description: 'Абон.плата, абонент '+ctx.state.role.do.id,   // must be
              quantity: '1.00',
              amount: {
                value: ctx.session.invoice.abon+'.00',
                currency: 'RUB'
              },
              vat_code: 1
            }
          ]
        }
      }
    }

    console.log('--- invoice:')
    console.log(invoice)

    //ctx.telegram.sendInvoice(ctx.message.chat.id, invoice)

    ctx.replyWithInvoice(invoice)
    .then((state) => {
      console.log('sendInvoice - Ok')
      console.log(state)

      nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: 'smtp.mail.ru',
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: localDb.smtpData.user,
            pass: localDb.smtpData.pass
          }
        })

        let curDate = new Date()
        let curDateStr = curDate.toLocaleString("ru", {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })

        // setup email data with unicode symbols
        let mailOptions = {
          from: '"Telegram Bot" <'+localDb.smtpData.user+'>',
          to: 'info@srgp.ru',
          subject: 'Абонент '+ctx.state.role.do.id+' абон.плата '+ctx.session.invoice.abon+' руб.',
          text: 'Абонент '+ctx.state.role.do.fio+', номер договора '+ctx.state.role.do.id+', телефон '+ctx.state.role.do.phone+'\n\n'+curDateStr+' средствами Telegram-бота сформировал платежку по Абон.плате на '+ctx.session.invoice.abon+' руб.',
          //html: '<b>Hello world?</b>'
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log(error)
          console.log('Message sent: %s', info.messageId);
        })
      })

    })
    .catch((error) => {
      console.log('sendInvoice - Err')
      console.log(error)
    })
  }
  else {
    ctx.reply('Что-то пошло не так. Пишем /start')
  }

}