(function() {
  /*
  00000000   00000000   0000000   0000000   000      000   000  00000000
  000   000  000       000       000   000  000      000   000  000     
  0000000    0000000   0000000   000   000  000       000 000   0000000 
  000   000  000            000  000   000  000         000     000     
  000   000  00000000  0000000    0000000   0000000      0      00000000
  */
  var path;

  path = require('path');

  module.exports = function(unresolved) {
    var p;
    p = unresolved.replace(/\~/, process.env.HOME);
    p = path.resolve(p);
    p = path.normalize(p);
    return p;
  };

}).call(this);
