'use strict';

const request = require('request')
// curl -d "request_type=SRGP_API_DOG_INFO&dog_id=01810413042017" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180
// curl -d "request_type=SRGP_API_UPD_TEL_ID&dog_id=01810413042017&telegram_id=65111616" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180

const fs          = require('fs')
const path        = require('path')



module.exports = function(ctx, localDb, markupOk, markupErr) {
  console.log('\ncontroller id_change -----------------------------------------:')
  //console.log(ctx)

  ctx.reply('Проверяю ID '+ctx.message.text)

  let reqOp = {  
    url:      'http://89.188.160.0:32180',
    method:   'POST'
  }
  
  reqOp.form = {request_type: 'SRGP_API_DOG_INFO', dog_id: ctx.message.text}
  request(reqOp, (requestErr, requestRes, requestBody) => {
    console.log('SRGP_API_DOG_INFO')
    let resultJson = []

    try {
      resultJson = JSON.parse(requestBody)
    }
    catch(e) {
      ctx.reply('Не прошло! SRGP_API_DOG_INFO - нет данных от CRM.')
      console.log(requestBody)
      console.log(e)
    }

    console.log(resultJson)
    if (resultJson.length > 1) {
      if (resultJson[0] && resultJson[1] && resultJson[2] && resultJson[3] && resultJson[4]) {
        localDb[ctx.from.id] = ctx.from
        localDb[ctx.from.id].chat = ctx.message.chat

        localDb[ctx.from.id].do = {
          id:           ctx.message.text,
          //fio:        iconv.decode(resultJson[0], 'cp1251'),
          fio:          resultJson[0],
          phone:        resultJson[1],
          email:        resultJson[2],
          balance:      resultJson[3],
          tarif:        resultJson[4],
          tarif_pause:  ''
        }

        // 0 = включен
        // 3 = выключен
        // 1 = расторгнут
        // 4 = на стопе
        // 5 = профилактика
        if (resultJson[5] > 0) {
          localDb[ctx.from.id].do.tarif_pause = resultJson[6]+' - '+resultJson[7]
        }

        // Update локальной базы
        fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
          if (err) throw err;
          console.log('local_db.json has been saved!')
          ctx.session.value =
            'Здравствуй, <b>'+resultJson[0]+'</b>'+
            '\nID: <b>'+ctx.message.text+'</b>'
          ctx.reply(ctx.session.value, markupOk)
        })

        // Связка telegram_id --- номер договора
        reqOp.form = {request_type: 'SRGP_API_UPD_TEL_ID', dog_id: ctx.message.text, telegram_id: ctx.from.id}
        request(reqOp, (requestErr, requestRes, requestBody) => {
          console.log('SRGP_API_UPD_TEL_ID')
          console.log(requestBody)
          if (requestBody !== 'Telegram ID was updated') {
            ctx.reply('Проблема! SRGP_API_UPD_TEL_ID - платежная система не привязалась к CRM.', markupOk)
          }
        })
      }
      else {
        ctx.reply('Не прошло! SRGP_API_DOG_INFO - нет данных от CRM.')
        ctx.session.value = 'Привет \u270B'
        ctx.reply(ctx.session.value, markupErr)        
      }

    }
    else {
      ctx.reply('Не прошло! Нет такого ID.')
      ctx.session.value = 'Привет \u270B'
      ctx.reply(ctx.session.value, markupErr)
    }
  })

}
