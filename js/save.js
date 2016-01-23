
/*
 0000000   0000000   000   000  00000000
000       000   000  000   000  000     
0000000   000000000   000 000   0000000 
     000  000   000     000     000     
0000000   000   000      0      00000000
 */
var fs, path, save, toStr;

fs = require('fs');

path = require('path');

toStr = require('./stringify');

save = function(p, data, opts) {
  if (opts == null) {
    opts = {};
  }
  return fs.writeFileSync(p, toStr(data, opts));
};

module.exports = save;
