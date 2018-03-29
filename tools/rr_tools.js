'use strict';

const request = require('request')
const path    = require('path')



// https://github.com/ars-anosov/replacer-react/blob/master/node-back/controllers/script_addr_get.js
// https://github.com/ars-anosov/replacer-react/blob/master/node-back/controllers/script_sum_get.js
var getVars = function(localDb, rrUrl) {

  let reqOptions = {
    url:      rrUrl,
    method:   'GET'
  }

  request(reqOptions, function(requestErr, requestRes, requestBody) {
    if (requestRes.statusCode === 200) {

      if (rrUrl === 'http://xn--80ahqgegdcb.xn--p1ai/assets/scripts/replacer__addr.js') {
        requestBody = requestBody.replace(/^var replacer__addr = /, '').replace(/\}\;/, '}')
        localDb.replacerData.addr = JSON.parse(requestBody)
      }

      if (rrUrl === 'http://xn--80ahqgegdcb.xn--p1ai/assets/scripts/replacer__sum.js') {
        requestBody = requestBody.replace(/^var sum = /, '').replace(/\}\;/, '}')
        localDb.replacerData.sum = JSON.parse(requestBody)
      }

    }
    else {
      console.log(reqOptions.url+' - Can not GET!')
    }
  })

}









module.exports.getVars       = getVars