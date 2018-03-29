'use strict';

const request = require('request')



module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller new_abonent ------------------------------------:')

  ctx.reply('Оформляем заявку на включение...').catch(() => undefined)

  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/add.php
  let curDate = new Date()

  let reqOp = {
    url:      localDb.bxData.apiUrl+'/rest/task.item.add.json',
    method:   'POST',
    formData: {
      'auth': localDb.oauth2.access_token,
      'TASKDATA[TITLE]':          'CRM: ИНТ '+ctx.session.newAbon.addrDom+'-'+ctx.session.newAbon.addrKv,
      'TASKDATA[DESCRIPTION]':    'Заявка на включение через Telegram'+
'\nФИО: '+ctx.session.newAbon.fio+
'\nКонтактные данные: '+ctx.session.newAbon.phone+
'\nНаселенный пункт: '+ctx.session.newAbon.addrNp+
'\nУлица: '+ctx.session.newAbon.addrStreet+
'\nДом: '+ctx.session.newAbon.addrDom+
'\nКвартира: '+ctx.session.newAbon.addrKv,
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

      ctx.session.value = 'Заявка на включение #'+resultJson.result+' оформлена.'
      ctx.reply(ctx.session.value).catch(() => undefined)

      ctx.session.value = ctx.session.newAbon.fio+', менеджер свяжется с вами в ближайшее время.'
      ctx.reply(ctx.session.value, markup).catch(() => undefined)
    }

    else {
      ctx.session.value = 'bitrix24 не ответил'
      ctx.reply(ctx.session.value, markup).catch(() => undefined)
    }

  })

}