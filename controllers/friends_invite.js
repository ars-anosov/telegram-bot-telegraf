'use strict';

const request = require('request')



module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller friends_invite ------------------------------------:')

  ctx.reply('Оформляем заявку на Акцию "Приведи друга"...').catch(() => undefined)

  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/add.php
  let curDate = new Date()

  let reqOp = {
    url:      localDb.bxData.apiUrl+'/rest/task.item.add.json',
    method:   'POST',
    formData: {
      'auth': localDb.oauth2.access_token,
      'TASKDATA[TITLE]':          'ИНТ_Абонент приводит друга',
      'TASKDATA[DESCRIPTION]':    'Абонент '+ctx.state.role.do.fio+', номер договора '+ctx.state.role.do.id+', телефон '+ctx.state.role.do.phone+
'\n\nИспользует акцию Приведи друга через Telegram'+
'\nФИО друга: '+ctx.session.friend.fio+
'\nКонтактные данные друга: '+ctx.session.friend.phone,
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
      
      ctx.session.value = 'Акция "Приведи друга" для '+ctx.session.friend.fio+' принята.\nЗаявка #'+resultJson.result+' оформлена.'
      ctx.reply(ctx.session.value).catch(() => undefined)
      
      ctx.session.value = ctx.session.friend.fio+' будет подключен к сети в ближайшее время.'
      ctx.reply(ctx.session.value, markup).catch(() => undefined)
    }

    else {
      ctx.session.value = 'bitrix24 не ответил'
      ctx.reply(ctx.session.value, markup).catch(() => undefined)
    }
    
  })

}