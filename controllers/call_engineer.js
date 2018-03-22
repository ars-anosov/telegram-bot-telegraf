'use strict';

const request = require('request')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true



module.exports = function(ctx, markup, auth) {
  console.log('\ncontroller balance_check -------------------------------------:')
  ctx.editMessageText('Поиск свободного инженера...', markup).catch(() => undefined)

  //https://dev.1c-bitrix.ru/rest_help/tasks/task/item/list.php
  let reqOp = {
    url:      'https://srgp.bitrix24.ru/rest/task.item.list.json?auth='+auth+'&O[DEADLINE]=asc&F[RESPONSIBLE_ID]=105&F[ONLY_ROOT_TASKS]=Y&F[>DEADLINE]=2018-03-22&P[]=',
    method:   'POST',
  }
  console.log(reqOp)
  request(reqOp, (requestErr, requestRes, requestBody) => {
    console.log(requestBody)
    let resultJson = JSON.parse(requestBody)
    if (resultJson.result) {
      console.log(resultJson)
      ctx.session.value = ''
      resultJson.result.map( (row, i) => {
        ctx.session.value += '\n<b>'+row.TITLE+'</b>\n'+row.CREATED_DATE.substring(0, 10)+' - '+row.DEADLINE.substring(0, 10)
      })
      //ctx.session.value = JSON.stringify(resultJson.result['119'], "", 2)
    }
    else {
      ctx.session.value = 'Пустой ответ'
    }
    console.log(ctx.session.value)
    ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
  })

}