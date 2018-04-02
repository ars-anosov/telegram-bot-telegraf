'use strict';



module.exports = function(ctx, markup, localDb) {
  console.log('controller tarif_info ------------------------------------------:')

  ctx.session.value =
'<b>Без ограничений</b>: <b>'+localDb.replacerData.sum.noLimit+' ₽</b> / 30 дней\n\n'+
'<b>Ограниченный</b> (скорость до 10 мб/с): <b>'+localDb.replacerData.sum.limit+' ₽</b> / 30 дней\n\n'+
'Подробней на <a href="http://xn--80ahqgegdcb.xn--p1ai/">домонлайн.рф</a>'

  ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)

}