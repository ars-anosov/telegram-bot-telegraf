'use strict';

const fs          = require('fs')
const path        = require('path')



module.exports = function(ctx, localDb, markup) {
  console.log('\ncontroller hears_id_new --------------------------------------:')

  if (localDb[ctx.from.id]) {
    ctx.session.value = 'Не прошло! В этом чате уже был присвоен ID'
    ctx.reply(ctx.session.value, markup)
  }
  else {
    localDb[ctx.from.id] = ctx.from
    localDb[ctx.from.id].do = {id: ctx.message.text}
  
    fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
      if (err) throw err;
      console.log('local_db.json has been saved!');
    })

    ctx.session.value = 'Успешно! ID <b>'+ctx.message.text+'</b> присвоен.'
    ctx.reply(ctx.session.value, markup)
  }

}