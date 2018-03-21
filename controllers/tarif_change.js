'use strict';

const request = require('request')
const tarifName = {
  '16.7': 'Без ограничений',
  '9.7':  'Ограниченный'
}
// curl -d "request_type=SRGP_API_UPD_TARIF_TYPE&dog_id=01810413042017&tarif_type=9.7" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180

const fs          = require('fs')
const path        = require('path')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true




module.exports = function(ctx, localDb, tarifType, markup) {
  console.log('\ncontroller tarif_change -------------------------------------:')
  //ctx.editMessageText(new Date(), markup).catch(() => undefined)
  ctx.editMessageText('меняю тариф на <b>'+tarifName[tarifType]+'</b>.', markup).catch(() => undefined)

  let reqOp = {  
    url:      'http://89.188.160.0:32180',
    method:   'POST'
  }

  reqOp.form = {request_type: 'SRGP_API_UPD_TARIF_TYPE', dog_id: ctx.state.role.do.id, tarif_type: tarifType}
  //console.log(reqOp)
  request(reqOp, (requestErr, requestRes, requestBody) => {
    console.log(requestBody)
    if (requestBody === 'Tarif was updated') {
      localDb[ctx.from.id].do.tarif = tarifName[tarifType]

      fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
        if (err) throw err;
        console.log('local_db.json has been saved!')
        ctx.session.value = 'Успешно! Тариф изменен на <b>'+tarifName[tarifType]+'</b>.'
        ctx.editMessageText(ctx.session.value, markup)
      })

    }

  })

}