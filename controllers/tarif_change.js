'use strict';

const request = require('request')
const tarifName = {
  '16.7': 'Без ограничений',
  '9.7':  'Ограниченный'
}
// curl -d "request_type=SRGP_API_UPD_TARIF_TYPE&dog_id=01810413042017&tarif_type=9.7" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180

const nodemailer  = require('nodemailer')
const fs          = require('fs')
const path        = require('path')




module.exports = function(ctx, localDb, tarifType, markup) {
  console.log('\ncontroller tarif_change -------------------------------------:')
  //ctx.editMessageText(new Date(), markup).catch(() => undefined)
  ctx.editMessageText('меняю тариф на <b>'+tarifName[tarifType]+'</b>.', markup).catch(() => undefined)

  let reqOp = {  
    url:      'http://89.188.160.0:32180',
    method:   'POST'
  }

  reqOp.form = {request_type: 'SRGP_API_UPD_TARIF_TYPE', dog_id: ctx.state.role.do.id, tarif_type: tarifType}
  //console.log(reqOp)
  request(reqOp, (requestErr, requestRes, requestBody) => {
    console.log(requestBody)

    if (requestBody === 'Tarif was updated') {
      localDb[ctx.from.id].do.tarif = tarifName[tarifType]

      fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
        if (err) throw err;
        console.log('local_db.json has been saved!')
        ctx.session.value = 'Успешно! Тариф изменен на <b>'+tarifName[tarifType]+'</b>.'
        ctx.editMessageText(ctx.session.value, markup)
      })

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

        let curDate = new Date()
        let curDateStr = curDate.toLocaleString("ru", {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })

        // setup email data with unicode symbols
        let mailOptions = {
          from: '"Telegram Bot" <'+localDb.smtpData.user+'>',
          to: 'info@srgp.ru',
          subject: 'Абонент '+ctx.state.role.do.id+' сменил тариф',
          text: 'Абонент '+ctx.state.role.do.fio+', номер договора '+ctx.state.role.do.id+', телефон '+ctx.state.role.do.phone+'\n\nСменил тарифный план на "'+tarifName[tarifType]+'" '+curDateStr+'.',
          //html: '<b>Hello world?</b>'
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log(error)
          console.log('Message sent: %s', info.messageId);
        })
      })

    }
    else {
      ctx.session.value = 'Не прошло! SRGP_API_UPD_TARIF_TYPE - тарив не обновился в CRM.'
      ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)
    }

  })

}