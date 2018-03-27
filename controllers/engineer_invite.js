'use strict';

const request = require('request')



module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller engineer_invite -----------------------------------:')

  ctx.editMessageText('Оформляем заявку на выезд '+ctx.state.rou2+'...', markup).catch(() => undefined)

  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/add.php
  let inviteDate = new Date(ctx.state.rou2)

  let reqOp = {
    url:      localDb.bxData.apiUrl+'/rest/task.item.add.json',
    method:   'POST',
    formData: {
      'auth': localDb.oauth2.access_token,
      'TASKDATA[TITLE]': 'Telegram. Вызов специалиста.',
      'TASKDATA[RESPONSIBLE_ID]': ctx.state.rou1,
      'TASKDATA[DEADLINE]': inviteDate.toISOString(),
      'TASKDATA[DESCRIPTION]': 'Абонент '+ ctx.state.role.do.fio +', номер договора '+ ctx.state.role.do.id +' вызвал специалиста на '+ctx.state.rou2+'.'
    }
  }
  console.log(reqOp)
  request(reqOp, (requestErr, requestRes, requestBody) => {
    //console.log(requestBody)
    let resultJson = JSON.parse(requestBody)

    if (resultJson.result) {
      console.log(resultJson)

      ctx.session.value = 'Вызов специалист '+ctx.state.rou1+', дата '+ctx.state.rou2+'.\nЗаявка #'+resultJson.result+' оформлена.\n\nЖдите звонка, специалист согласует время приезда.'
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