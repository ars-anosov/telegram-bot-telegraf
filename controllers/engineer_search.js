'use strict';

const request = require('request')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true

const Extra = require('telegraf/extra')
const tgTools         = require('../tools/tg_tools')



module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller engineer_search -----------------------------------:')

  ctx.editMessageText('Поиск свободного инженера...', markup).catch(() => undefined)

  let dOptions = {
    //era: 'long',
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    //timezone: 'UTC',
    //hour: 'numeric',
    //minute: 'numeric',
    //second: 'numeric'
  }

  let dOptions2 = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }




  // Готовлю массив доступных дней для выезда специалиста ---------------------
  let curDate = new Date()
  let freeDays = {}
  for (let i = 0; i < 7; i += 1) {
    // Начинаем поиск с текущего дня
    // от 0(воскресенье) до 6(суббота)
    if (curDate.getDay() !== 0) {
      freeDays[ curDate.toLocaleString("ru", dOptions) ] = {}
      // Для каждого специалиста число заявок = пустой массив
      localDb.bxData.engineerId.map((row) => {
        freeDays[ curDate.toLocaleString("ru", dOptions) ][ row ] = []
      })
    }
    curDate.setDate(curDate.getDate()+1)
  }
  //console.log(freeDays)



  // Запрашиваю текущие заявки по специалистам localDb.bxData.engineerId ------
  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/list.php
  curDate = new Date()
  let reqOp = {
    url:      localDb.bxData.apiUrl+'/rest/task.item.list.json',
    method:   'POST',
    formData: {
      'auth': localDb.oauth2.access_token,
      'O[DEADLINE]': 'asc',
      'F[ONLY_ROOT_TASKS]': 'Y',
      'F[>DEADLINE]': curDate.toISOString()
    }
  }
  localDb.bxData.engineerId.map((row, i) => {
    reqOp.formData['F[RESPONSIBLE_ID]['+i+']'] = row
  })

  console.log(reqOp)
  request(reqOp, (requestErr, requestRes, requestBody) => {
    //console.log(requestBody)
    let resultJson = JSON.parse(requestBody)

    if (resultJson.result) {
      //console.log(resultJson)

      resultJson.result.map( (row, i) => {
        let createdDate   = new Date(row.CREATED_DATE)
        let deadlineDate  = new Date(row.DEADLINE)

        // Если дедлайн попал в подготовленный массив freeDays, наполняю массив
        if ( freeDays[ deadlineDate.toLocaleString("ru", dOptions) ] ) {
          freeDays[ deadlineDate.toLocaleString("ru", dOptions) ][ row.RESPONSIBLE_ID ].push( row.RESPONSIBLE_NAME+' '+row.RESPONSIBLE_LAST_NAME+' '+deadlineDate.toLocaleString("ru", dOptions2)+': '+row.TITLE )
        }

      })
      console.log(freeDays)
      ctx.session.engineerFreeDays = freeDays

      // Выдаю на дни, где за специалистом меньше 4-х заявок
      ctx.session.value = 'Выбирайте дату приезда специалиста'
      markup = Extra
      .HTML()
      .markup( (m) => {
        let buttonArr = []
        // Дни
        for (let bttnDate in freeDays) {
          // Спецы
          for (let engineerId in freeDays[bttnDate]) {
            // Количество заявок
            if (freeDays[bttnDate][engineerId].length < 4) {
              buttonArr.push( m.callbackButton(bttnDate, 'engineer_invite:'+bttnDate) )
              break
            }
          }
        }
        buttonArr.push( m.callbackButton(tgTools.fixedFromCharCode(0x2716) +' Назад', 'abonent') )
        return m.inlineKeyboard(buttonArr, {columns: 1})
      })

    }

    else {
      ctx.session.value = 'bitrix24 не ответил'
    }

    ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
  })

}