
/*
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000
 */

(function() {
  var colors, err, fs, load, parse, path;

  fs = require('fs');

  colors = require('colors');

  path = require('path');

  parse = require('./parse');

  err = function(msg) {
    return console.log(("\n" + msg + "\n").red);
  };

  load = function(p) {
    var extname, str;
    extname = path.extname(p);
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
          return parse(str);
      }
    }
  };

  module.exports = load;

}).call(this);
