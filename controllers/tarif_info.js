'use strict';



module.exports = function(ctx, markup) {
  console.log('controller tarif_info ------------------------------------------:')

  ctx.session.value =
'<b>БЕЗ ОГРАНИЧЕНИЙ</b>: 500 ₽ / 30 дней\n'+
'<b>ОГРАНИЧЕННЫЙ</b> (скорость до 10 мб/с): 290 ₽ / 30 дней\n'+
'Подробней: <a href="http://xn--80ahqgegdcb.xn--p1ai/">на сайте</a>'

  ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)

}