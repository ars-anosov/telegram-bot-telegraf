'use strict';



var fixedFromCharCode = function(codePt) {
  if (codePt > 0xFFFF) {
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  }
  else {
    return String.fromCharCode(codePt);
  }
}









module.exports.fixedFromCharCode   = fixedFromCharCode