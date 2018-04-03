'use strict'

const request     = require('request')
const nodemailer  = require('nodemailer')

// curl -d "request_type=SRGP_API_UPD_TARIF_TYPE&dog_id=01810413042017&tarif_type=9.7" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180

const fs          = require('fs')
const path        = require('path')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true





module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller tarif_pause ---------------------------------------:')

  if (ctx.session.pause.from.match( /\d\d\d\d\-\d\d\-\d\d/i ) && ctx.session.pause.to.match( /\d\d\d\d\-\d\d\-\d\d/i )) {
    ctx.reply('Приостанавливаю услуги с '+ctx.session.pause.from+' до '+ctx.session.pause.to+'.').catch(() => undefined)

    // CRM request ------------------------------------------------------------
    let reqOp = {  
      url:      'http://89.188.160.0:32180',
      method:   'POST'
    }

  //  reqOp.form = {request_type: 'SRGP_API_UPD_TARIF_TYPE', dog_id: ctx.state.role.do.id, tarif_type: tarifType}
  //  //console.log(reqOp)
  //  request(reqOp, (requestErr, requestRes, requestBody) => {
  //    console.log(requestBody)
  //    if (requestBody === 'Tarif was updated') {
  //      localDb[ctx.from.id].do.tarif = tarifName[tarifType]
  //
  //      fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
  //        if (err) throw err;
  //        console.log('local_db.json has been saved!')
  //        ctx.session.value = 'Успешно! Тариф изменен на <b>'+tarifName[tarifType]+'</b>.'
  //        ctx.editMessageText(ctx.session.value, markup)
  //      })
  //
  //    }
  //
  //  })

    ctx.session.value = '(В разработке)'
    ctx.reply(ctx.session.value, markup).catch(() => undefined)



    // send mail --------------------------------------------------------------
    // https://nodemailer.com/about/
    // https://help.mail.ru/biz/domain/faq/clients
    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: localDb.smtpData.user,
          pass: localDb.smtpData.pass
        }
      })

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Telegram Bot" <'+localDb.smtpData.user+'>',
        //to: 'info@srgp.ru',
        to: 'ars-anosov@yandex.ru',
        subject: 'Абонент '+ctx.state.role.do.id+' приостановил услуги',
        text: 'Абонент '+ctx.state.role.do.fio+', номер договора '+ctx.state.role.do.id+', телефон '+ctx.state.role.do.phone+'\n\nПриостановил услуги с '+ctx.session.pause.from+' до '+ctx.session.pause.to+'.',
        //html: '<b>Hello world?</b>'
      }

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      })
    })

  }
  else {
    ctx.session.value = 'Неверный формат датты'
    ctx.reply(ctx.session.value, markup).catch(() => undefined)    
  }

}