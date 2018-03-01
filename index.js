var nodePath      = process.argv[0]
var appPath       = process.argv[1]
var token         = process.argv[2]
var whIp          = process.argv[3]
var whPort        = process.argv[4]
var whPath        = 'https://'+whIp+':'+whPort+'/'+token
console.log('webhook path: '+whPath)

const fs          = require('fs')
const path        = require('path')
const https       = require('https')
const express     = require('express')

const Telegraf    = require('telegraf')
const bot         = new Telegraf(token)

const sslCredentials = {
  key:  fs.readFileSync( path.join(__dirname, 'cert/client.key') ),
  cert: fs.readFileSync( path.join(__dirname, 'cert/client.pem') ),
  ca:   fs.readFileSync( path.join(__dirname, 'cert/ca.pem') )
}



// Set telegram webhook (upload cert)
bot.telegram.setWebhook('https://'+whIp+':'+whPort+'/'+token, {source: sslCredentials.cert})
/*
// TLS options
const tlsOptions = {
  key: sslCredentials.key,   
  cert: sslCredentials.cert,
  ca: [
    // This is necessary only if the client uses the self-signed certificate.
    sslCredentials.ca
  ]
}

// Start https webhook (https server)
bot.startWebhook('/'+token, tlsOptions, whPort)
*/



//----------------------------------------------------------------------------|
//                                  express                                   |
//----------------------------------------------------------------------------|
var app = express()
var httpsServer = https.createServer(sslCredentials, app)

app.get('/', (req, res) => res.send('Answer to the Ultimate Question of Life, the Universe, and Everything\n'))
app.use(bot.webhookCallback('/'+token))

httpsServer.listen(whPort, () => {
  console.log('express app started on https server, port: '+whPort)
})



//----------------------------------------------------------------------------|
//                                    bot                                     |
//----------------------------------------------------------------------------|
const Router = require('telegraf/router')
const session = require('telegraf/session')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { enter, leave } = Stage

// Register logger middleware
bot.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    console.log('response time %sms', ms)
  })
})

bot.on('message', (ctx) =>  {
  console.log(ctx.message)
  return ctx.reply('Принято!')
})