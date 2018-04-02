'use strict';

const request = require('request')



module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller engineer_invite -----------------------------------:')
  // ctx.state.rou1 - прилетает от engineer_search - дата
  // ctx.session.engineerFreeDays - наполняется в engineer_search - загрузка спецов по датам

  ctx.editMessageText('Оформляем заявку на выезд '+ctx.state.rou1+'...', markup).catch(() => undefined)

  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/add.php
  let curDate = new Date()
  //curDate.setHours(18, 0, 0, 0)

  let dOptions = {
    //era: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    //weekday: 'long',
    //timezone: 'UTC',
    //hour: 'numeric',
    //minute: 'numeric',
    //second: 'numeric'
  }

  let reqOp = {
    url:      localDb.bxData.apiUrl+'/rest/task.item.add.json',
    method:   'POST',
    formData: {
      'auth': localDb.oauth2.access_token,
      'TASKDATA[TITLE]':          'ИНТ_Вызов специалиста '+ctx.state.role.do.id.substring(0,3)+'-'+ctx.state.role.do.id.substring(3,6),
      'TASKDATA[DESCRIPTION]':    'Абонент '+ctx.state.role.do.fio+', номер договора '+ctx.state.role.do.id+', телефон '+ctx.state.role.do.phone+
'\n\nВызов специалиста через Telegram'+
'\nОжидает специалиста: '+ctx.state.rou1+
'\nДом: '+ctx.state.role.do.id.substring(0,3)+'\nКвартира: '+ctx.state.role.do.id.substring(3,6),
      'TASKDATA[DEADLINE]':       curDate.toISOString(),
      'TASKDATA[AUDITORS][0]':    localDb.bxData.managerId,
      'TASKDATA[AUDITORS][1]':    12,  // Оксана
      'TASKDATA[AUDITORS][2]':    2,   // Игорь
      'TASKDATA[AUDITORS][3]':    1,   // Максим
      'TASKDATA[RESPONSIBLE_ID]': localDb.bxData.managerId,
      'TASKDATA[CREATED_BY]':     localDb.bxData.managerId
    }
  }
  reqOp.formData['TASKDATA[DESCRIPTION]'] += '\n\nВ этот день на специалистах так же висят задачи:'
  for (let engineerId in ctx.session.engineerFreeDays[ctx.state.rou1]) {
    ctx.session.engineerFreeDays[ctx.state.rou1][engineerId].map((row) => {
      reqOp.formData['TASKDATA[DESCRIPTION]'] += '\n'+row
    })
  }
  console.log(reqOp)

  request(reqOp, (requestErr, requestRes, requestBody) => {
    //console.log(requestBody)
    let resultJson = JSON.parse(requestBody)

    if (resultJson.result) {
      console.log(resultJson)

      ctx.session.value = 'Вызов специалиста на '+ctx.state.rou1+'\nЗаявка #'+resultJson.result+' оформлена.\n\nЖдите звонка, специалист согласует время приезда.'
      ctx.reply(ctx.session.value).catch(() => undefined)

      ctx.session.value = 'Специалист вызван.'
      ctx.reply(ctx.session.value, markup).catch(() => undefined)
    }

    else {
      ctx.session.value = 'bitrix24 не ответил'
      ctx.reply(ctx.session.value, markup).catch(() => undefined)
    }

  })

}