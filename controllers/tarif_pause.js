'use strict'

const request     = require('request')
const nodemailer  = require('nodemailer')

// curl -d "request_type=SRGP_API_STOP&dog_id=01609508092017&date_stop_status_start=2018-04-04&date_stop_status_end=2018-04-05" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://89.188.160.0:32180


const fs          = require('fs')
const path        = require('path')

//var iconv = require('iconv-lite')
//iconv.skipDecodeWarning = true





module.exports = function(ctx, markup, localDb) {
  console.log('\ncontroller tarif_pause ---------------------------------------:')

  if (ctx.session.pause.from.match( /^\d\d\-\d\d\-\d\d\d\d$/i ) && ctx.session.pause.to.match( /^\d\d\-\d\d\-\d\d\d\d$/i )) {
    ctx.reply('Приостанавливаю услуги с '+ctx.session.pause.from+' до '+ctx.session.pause.to+'...\nВсегда можно вернуться на /start').catch(() => undefined)
    let fromList = ctx.session.pause.from.split('-')
    let toList = ctx.session.pause.to.split('-')

    // CRM request ------------------------------------------------------------
    let reqOp = {  
      url:      'http://89.188.160.0:32180',
      method:   'POST',
      timeout: 60000    // проблема возникает на уровне FreeBSD параметр "tcp_syn_retrie". Пробую - #sysctl net.inet.tcp.syncache.rexmtlimit=6 - не тот параметр.
    }

    reqOp.form = {
      request_type:           'SRGP_API_STOP',
      dog_id:                 ctx.state.role.do.id,
      date_stop_status_start: fromList[2]+'-'+fromList[1]+'-'+fromList[0],
      date_stop_status_end:   toList[2]+'-'+toList[1]+'-'+toList[0]
    }
    //console.log(reqOp)



    request(reqOp, (requestErr, requestRes, requestBody) => {
      if (requestErr) console.log(requestErr)
      console.log(requestBody)
      //if (requestBody === 'stop apply') {

        localDb[ctx.from.id].do.tarif_pause = ctx.session.pause.from+' - '+ctx.session.pause.to


        fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
          if (err) console.log(err)
          console.log('local_db.json has been saved!')
          ctx.session.value = 'Успешно! Услуги приостановлены с '+ctx.session.pause.from+' до '+ctx.session.pause.to+'.'
          ctx.reply(ctx.session.value, markup)
        })


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
            to: 'info@srgp.ru',
            subject: 'Абонент '+ctx.state.role.do.id+' приостановил услуги',
            text: 'Абонент '+ctx.state.role.do.fio+', номер договора '+ctx.state.role.do.id+', телефон '+ctx.state.role.do.phone+'\n\nПриостановил услуги с '+ctx.session.pause.from+' до '+ctx.session.pause.to+'.',
            //html: '<b>Hello world?</b>'
          }

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error)
            console.log('Message sent: %s', info.messageId);
          })
        })
  
      //}
    })



  }

  else {
    ctx.session.value = 'Неверный формат датты'
    ctx.reply(ctx.session.value, markup).catch(() => undefined)    
  }

}