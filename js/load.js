
/*
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000
 */

(function() {
  var colors, err, fs, load, path;

  fs = require('fs');

  colors = require('colors');

  path = require('path');

  err = function(msg) {
    return console.log(("\n" + msg + "\n").red);
  };

  load = function(p, ext) {
    var extname, str;
    extname = ext != null ? ext : path.extname(p);
    if (extname === '.plist') {
      return require('simple-plist').readFileSync(p);
    } else {
      str = fs.readFileSync(p, 'utf8');
      if (str.length <= 0) {
        err("empty file: " + p.yellow.bold);
        return null;
      }
      switch (extname) {
        case '.json':
          return JSON.parse(str);
        case '.cson':
          return require('cson').parse(str);
        case '.yml':
        case '.yaml':
          return require('js-yaml').load(str);
        default:
          return require('./parse')(str);
      }
    }
  };

  module.exports = load;

}).call(this);
