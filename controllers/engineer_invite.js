'use strict';

const request = require('request')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true



module.exports = function(ctx, markup, auth) {
  console.log('\ncontroller engineer_invite -----------------------------------:')
  ctx.editMessageText('Оформляем заявку на '+ctx.state.rou2+'...', markup).catch(() => undefined)

  // https://dev.1c-bitrix.ru/rest_help/tasks/task/item/list.php
  let curDate = new Date()
  let inviteDate = new Date(ctx.state.rou2)

  let reqOp = {
    url:      'https://srgp.bitrix24.ru/rest/task.item.add.json',
    method:   'POST',
    formData: {
      'auth': auth,
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
      //console.log(resultJson)
      ctx.session.value = 'Специалист '+ctx.state.rou1+', дата '+ctx.state.rou2+'\nЗаявка оформлена.'
    }

    else {
      ctx.session.value = 'bitrix24 не ответил'
    }

    ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
  })

}