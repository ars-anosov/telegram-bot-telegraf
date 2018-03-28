'use strict';

const request = require('request')



module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller engineer_invite -----------------------------------:')
  // ctx.state.rou1 = ID инженера
  // ctx.state.rou2 = Дата выезда инженера

  ctx.editMessageText('Оформляем заявку на выезд '+ctx.state.rou2+'...', markup).catch(() => undefined)

  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/add.php
  let curDate = new Date()
  //curDate.setHours(18, 0, 0, 0)
  let inviteDate = new Date(ctx.state.rou2)
  inviteDate.setHours(10, 0, 0, 0)

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
'\nОжидает специалиста: '+inviteDate.toLocaleString("ru", dOptions)+
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
  console.log(reqOp)

  request(reqOp, (requestErr, requestRes, requestBody) => {
    //console.log(requestBody)
    let resultJson = JSON.parse(requestBody)

    if (resultJson.result) {
      console.log(resultJson)

      ctx.session.value = 'Вызов специалиста на '+inviteDate.toLocaleString("ru", dOptions)+'\nЗаявка #'+resultJson.result+' оформлена.\n\nЖдите звонка, специалист согласует время приезда.'
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