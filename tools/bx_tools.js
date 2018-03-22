'use strict';

const request = require('request')

const fs          = require('fs')
const path        = require('path')


var oauthReq =  function(bxClientId) {
  console.log('\bx_tools oauthReq -------------------------------------:')

  let reqOp = {  
    url:      'https://srgp.bitrix24.ru/oauth/authorize/?client_id='+bxClientId
  }
  request(reqOp, (requestErr, requestRes, requestBody) => {
    console.log(requestRes)
  })

}

var oauthRes =  function(bxClientId, bxClientSecret, args, localDb) {
  console.log('\nbx_tools oauthRes -------------------------------------:')

  let reqOp = {  
    url:      'https://oauth.bitrix.info/oauth/token/?grant_type=authorization_code&client_id='+bxClientId+'&client_secret='+bxClientSecret+'&code='+args.code
  }

  request(reqOp, (requestErr, requestRes, requestBody) => {
    let resultJson = JSON.parse(requestBody)
    localDb.oauth2 = resultJson
    console.log(resultJson)

    // Update локальной базы
    fs.writeFile(path.join(__dirname, '../local_db.json'), JSON.stringify(localDb, "", 2), 'utf8', (err) => {
      if (err) throw err;
      console.log('local_db.json has been saved!')
    })
  })

}









module.exports.oauthReq   = oauthReq
module.exports.oauthRes   = oauthRes