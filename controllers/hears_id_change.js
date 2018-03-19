'use strict';

const request = require('request')
// curl -d "request_type=SRGP_API_DOG_INFO&dog_id=01810413042017" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://89.188.160.0:32180
// curl -d "request_type=SRGP_API_UPD_TEL_ID&dog_id=01810413042017&telegram_id=65111616" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -X POST http://89.188.160.0:32180

const fs          = require('fs')
const path        = require('path')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true



module.exports = function(ctx, localDb, markup) {
  console.log('\ncontroller hears_id_change -----------------------------------:')

  let reqOp = {  
    url:      'http://89.188.160.0:32180',
    method:   'POST'
  }
  
  reqOp.form = {request_type: 'SRGP_API_DOG_INFO', dog_id: ctx.message.text}
  request(reqOp, (requestErr, requestRes, requestBody) => {
    let resultJson = JSON.parse(requestBody)
    console.log(resultJson)
    if (resultJson.length > 1) {
      localDb[ctx.from.id] = ctx.from
      localDb[ctx.from.id].do = {
        id:       ctx.message.text,
        //fio:      iconv.decode(resultJson[0], 'cp1251'),
        fio:      resultJson[0],
        phone:    resultJson[1],
        email:    resultJson[2],
        balance:  resultJson[3],
        tarif:    resultJson[4],
      }

      fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
        if (err) throw err;
        console.log('local_db.json has been saved!')
        ctx.session.value = 'Успешно! ID изменен на <b>'+ctx.message.text+'</b>.'
        ctx.reply(ctx.session.value, markup)
      })

      // Связка telegram_id --- номер договора
      reqOp.form = {request_type: 'SRGP_API_UPD_TEL_ID', dog_id: ctx.message.text, telegram_id: ctx.from.id}
      request(reqOp, (requestErr, requestRes, requestBody) => {
        console.log('SRGP_API_UPD_TEL_ID')
        console.log(requestBody)
      })

    }
    else {
      ctx.reply('Не прошло! Нет такого ID.')
      ctx.session.value = 'Привет \u270B'
      ctx.reply(ctx.session.value, markup)
    }
  })

  ctx.reply('Проверяю ID '+ctx.message.text)

}




// request_type=SRGP_API_UPD_TARIF_TYPE&dog_id=0390017102017&tarif_type=16.7
// 16.7 - без ограничений
// 9.7 ограниченный