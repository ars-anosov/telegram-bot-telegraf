'use strict';



module.exports = function(ctx, markup) {
  console.log('controller tarif_info ------------------------------------------:')

  ctx.session.value =
'<b>Без ограничений</b>: 500 ₽ / 30 дней\n\n'+
'<b>Ограниченный</b> (скорость до 10 мб/с): 290 ₽ / 30 дней\n\n'+
'Подробней на <a href="http://xn--80ahqgegdcb.xn--p1ai/">домонлайн.рф</a>'

  ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)

}