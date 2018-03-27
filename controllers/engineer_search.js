'use strict';

const request = require('request')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true

const Extra = require('telegraf/extra')
const tgTools         = require('../tools/tg_tools')



module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller engineer_search -----------------------------------:')

  ctx.editMessageText('Поиск свободного инженера...', markup).catch(() => undefined)

  let curDate = new Date()

  // Готовлю массив доступных дней для выезда специалиста
  let freeDays = {}
  for (let i = 0; i < 7; i += 1) {
    // Начинаем поиск со следующего дня
    curDate.setDate(curDate.getDate()+1)
    // от 0(воскресенье) до 6(суббота)
    if (curDate.getDay() !== 6 && curDate.getDay() !== 0) {
      freeDays[curDate.getFullYear()+'-'+(curDate.getMonth()+1)+'-'+curDate.getDate()] = true
    }
  }
  //console.log(freeDays)

  let weekDayName = {
    0: 'Вс.',
    1: 'Пн.',
    2: 'Вт.',
    3: 'Ср.',
    4: 'Чт.',
    5: 'Пт.',
    6: 'Сб.'
  }
  let monthName = {
    1: 'января',
    2: 'февраля',
    3: 'марта',
    4: 'апреля',
    5: 'мая',
    6: 'июня',
    7: 'июля',
    8: 'августа',
    9: 'сентября',
    10: 'октября',
    11: 'ноября',
    12: 'декабря'
  }

  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/list.php
  curDate = new Date()
  let reqOp = {
    url:      localDb.bxData.apiUrl+'/rest/task.item.list.json',
    method:   'POST',
    formData: {
      'auth': localDb.oauth2.access_token,
      'O[DEADLINE]': 'asc',
      'F[RESPONSIBLE_ID]': localDb.bxData.engineerId,
      'F[ONLY_ROOT_TASKS]': 'Y',
      'F[>DEADLINE]': curDate.getFullYear()+'-'+(curDate.getMonth()+1)+'-'+curDate.getDate(),
      'P[]': ''
    }
  }
  console.log(reqOp)
  request(reqOp, (requestErr, requestRes, requestBody) => {
    //console.log(requestBody)
    let resultJson = JSON.parse(requestBody)

    if (resultJson.result) {
      //console.log(resultJson)
      ctx.session.value = ''
      resultJson.result.map( (row, i) => {
        console.log(row.TITLE+' - '+row.CREATED_DATE.substring(0, 10)+' - '+row.DEADLINE.substring(0, 10))
        let deadlineDate = new Date(row.DEADLINE)
        let deadlineStr = deadlineDate.getFullYear()+'-'+(deadlineDate.getMonth()+1)+'-'+deadlineDate.getDate()

        // Если дедлайн попал в подготовленный массив freeDays, вычеркиваю этот день (false)
        if (freeDays[deadlineStr]) {
          freeDays[deadlineStr] = false
        }

      })

      //ctx.session.value = JSON.stringify(freeDays, "", 2)
      ctx.session.value = 'Выбирайте дату приезда специалиста'
      markup = Extra
      .HTML()
      .markup( (m) => {
        let buttonArr = []
        for (let key in freeDays) {
          if (freeDays[key]) {
            let niceDate = new Date(key)
            //console.log(key +' : '+ niceDate)
            buttonArr.push( m.callbackButton(weekDayName[niceDate.getDay()]+' '+niceDate.getDate()+' '+monthName[(niceDate.getMonth()+1)]+' '+niceDate.getFullYear(), 'engineer_invite:'+'119'+':'+key) )
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