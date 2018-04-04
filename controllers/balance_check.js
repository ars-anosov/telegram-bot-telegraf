'use strict';

const request = require('request')
// curl -d "request_type=SRGP_API_DOG_BALANCE&dog_id=01810413042017" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180
// curl -d "request_type=SRGP_API_DOG_INFO&dog_id=01810413042017" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true




module.exports = function(ctx, markup) {
  console.log('\ncontroller balance_check -------------------------------------:')
  //ctx.editMessageText(new Date(), markup).catch(() => undefined)
  ctx.editMessageText('запрашиваю данные...', markup).catch(() => undefined)

  let reqOp = {  
    url:      'http://89.188.160.0:32180',
    method:   'POST'
  }

  reqOp.form = {request_type: 'SRGP_API_DOG_BALANCE', dog_id: ctx.state.role.do.id}
  request(reqOp, (requestErr, requestRes, requestBody) => {
    let resultJson = JSON.parse(requestBody)
    if (resultJson.length > 1) {
      ctx.session.value =
        'Тариф: <b>'+ctx.state.role.do.tarif+'</b>'+
        '\nБаланс: <b>'+resultJson[0]+' \u20BD</b>'+
        '\nОплачено дней: <b>'+resultJson[1]+'</b>'
      if (ctx.state.role.do.tarif_pause) {
        ctx.session.value += '\nПриостановка: <b>'+ctx.state.role.do.tarif_pause+'</b>'
      }
      console.log(ctx.session.value)
      ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
    }
    else {
      ctx.session.value = 'Не прошло! SRGP_API_DOG_BALANCE - нет данных от CRM.'
      ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
    }
  })

}