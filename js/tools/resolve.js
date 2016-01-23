
/*
00000000   00000000   0000000   0000000   000      000   000  00000000
000   000  000       000       000   000  000      000   000  000     
0000000    0000000   0000000   000   000  000       000 000   0000000 
000   000  000            000  000   000  000         000     000     
000   000  00000000  0000000    0000000   0000000      0      00000000
 */
var path, process;

path = require('path');

process = require('process');

module.exports = function(unresolved) {
  var p;
  p = unresolved.replace(/\~/, process.env.HOME);
  p = path.resolve(p);
  p = path.normalize(p);
  return p;
};
