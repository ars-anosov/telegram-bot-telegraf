'use strict';



module.exports = function(ctx, markup) {
  console.log('controller pay_methods -----------------------------------------:')

  ctx.session.value = 'Банковские карты\n'+
'<a href="https://kassa.yandex.ru/payments.html">Карта Мир</a>\n'+
'<a href="https://kassa.yandex.ru/payments.html">Карты Visa, Mastercard, Maestro</a>\n'+
'<a href="https://kassa.yandex.ru/payments.html">Apple Pay</a>\n'+
'\nЭлектронные деньги\n'+
'<a href="https://kassa.yandex.ru/payments-emoney.html">Яндекс Деньги</a>\n'+
'<a href="https://kassa.yandex.ru/payments-emoney.html">WebMoney</a>\n'+
'<a href="https://kassa.yandex.ru/payments-emoney.html">QIWI</a>\n'+
'\nИнтернет-банкинг\n'+
'<a href="https://kassa.yandex.ru/payments-internet-bank.html">Сбербанк Онлайн</a>\n'+
'<a href="https://kassa.yandex.ru/payments-internet-bank.html">Альфа-Банк</a>\n'+
'<a href="https://kassa.yandex.ru/payments-internet-bank.html">Промсвязьбанк</a>\n'+
'<a href="https://kassa.yandex.ru/payments-internet-bank.html">ЕРИП</a>\n'+
'\nБаланс телефона\n'+
'<a href="https://kassa.yandex.ru/payments-phone.html">Билайн</a>\n'+
'<a href="https://kassa.yandex.ru/payments-phone.html">Мегафон</a>\n'+
'<a href="https://kassa.yandex.ru/payments-phone.html">МТС</a>\n'+
'<a href="https://kassa.yandex.ru/payments-phone.html">Теле2</a>\n'+
'<a href="https://kassa.yandex.ru/payments-phone.html">Билайн</a>\n'+
'\nКредитование\n'+
'<a href="https://kassa.yandex.ru/payments-credit.html">КупиВкредит</a>\n'+
'\nНаличные\n'+
'<a href="https://kassa.yandex.ru/payments-cash.html">Связной, Евросеть и другие</a>'

  ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)

}