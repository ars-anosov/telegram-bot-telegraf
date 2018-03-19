'use strict';

const request = require('request')
// curl -d "request_type=SRGP_API_DOG_BALANCE&dog_id=01810413042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://89.188.160.0:32180
// curl -d "request_type=SRGP_API_DOG_INFO&dog_id=01810413042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://89.188.160.0:32180

var iconv = require('iconv-lite')
iconv.skipDecodeWarning = true




module.exports = function(ctx, markup) {
  console.log('\ncontroller balance_check -------------------------------------:')

  let reqOp = {  
    url:      'http://89.188.160.0:32180',
    method:   'POST'
  }

  reqOp.form = {request_type: 'SRGP_API_DOG_BALANCE', dog_id: ctx.state.role.do.id}
  request(reqOp, (requestErr, requestRes, requestBody) => {
    let resultJson = JSON.parse(requestBody)
    ctx.session.value =
      'Тариф: <b>'+ctx.state.role.do.tarif+'</b>'+
      '\nБаланс: <b>'+resultJson[0]+' \u20BD</b>'+
      '\nОплачено дней: <b>'+resultJson[1]+'</b>'
    ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
  })

  ctx.editMessageText(new Date(), markup).catch(() => undefined)

}