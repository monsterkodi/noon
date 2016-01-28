
/*
 0000000   0000000   000   000  00000000
000       000   000  000   000  000     
0000000   000000000   000 000   0000000 
     000  000   000     000     000     
0000000   000   000      0      00000000
 */

(function() {
  var _, fs, path, save, toStr;

  fs = require('fs');

  path = require('path');

  _ = require('lodash');

  toStr = require('./stringify');

  save = function(p, data, opt) {
    if (opt == null) {
      opt = {};
    }
    return fs.writeFileSync(p, toStr(data, _.defaults({
      ext: path.extname(p)
    }, opt)));
  };

  module.exports = save;

}).call(this);
