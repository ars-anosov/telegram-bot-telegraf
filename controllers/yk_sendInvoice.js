'use strict';


// https://kassa.yandex.ru/manuals/telegram
// https://core.telegram.org/bots/api#sendinvoice

module.exports = function(ctx, ykToken) {
  console.log('\ncontroller yk_sendInvoice ------------------------------------:')
  console.log(ctx.session)

  ctx.session.value = 'Привет \u270B'
  ctx.reply('Формируем платеж... Всегда можно вернуться на /start')

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
      payload: {
        item: 'Абон. плата'
      }
      //provider_data: {
      //  receipt: {
      //    email: 'ars-anosov@yandex.ru',
      //    items: [
      //      {
      //        description: 'ID '+ctx.state.role.do.id,
      //        quantity: '1.00',
      //        amount: {
      //          value: '110.00',
      //          currency: 'RUB'
      //        },
      //        vat_code: 1
      //      }
      //    ]
      //  }
      //}
    }

    console.log('--- invoice:')
    console.log(invoice)

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
  }
  else {
    ctx.reply('Что-то пошло не так. Пишем /start')
  }

}