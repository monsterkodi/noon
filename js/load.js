
/*
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000
 */
var fs, load, parse;

fs = require('fs');

parse = require('./parse');

load = function(p) {
  var str;
  str = fs.readFileSync(p, 'utf8');
  if (str.length <= 0) {
    return null;
  }
  return parse(str);
};

module.exports = load;
