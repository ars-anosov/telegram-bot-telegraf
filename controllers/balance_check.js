'use strict';

const request = require('request')
// curl -d "request_type=SRGP_API_DOG_BALANCE&dog_id=01234513042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://xn--80ahqgegdcb.xn--p1ai/newtest.php
// curl -d "request_type=SRGP_API_DOG_BALANCE&dog_id=01234513042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://89.188.160.0:32180



module.exports = function(ctx, markup) {
  console.log('\ncontroller balance_check -------------------------------------:')

  let reqOp = {  
    url:      'http://89.188.160.0:32180',
    method:   'POST',
    encoding: 'utf8'
  }
  reqOp.form = {request_type: 'SRGP_API_DOG_BALANCE', dog_id: ctx.state.role.do.id}
  
  request(reqOp, (requestErr, requestRes, requestBody) => {
    let resultJson = JSON.parse(requestBody)
    ctx.session.value = 'Ваш баланс: <b>'+resultJson[0]+' \u20BD</b>\nОплачено дней: <b>'+resultJson[1]+'</b>'
    //console.log(ctx.session.value)
    ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
  })

  ctx.editMessageText(new Date(), markup).catch(() => undefined)

}