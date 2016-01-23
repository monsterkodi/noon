
/*
00000000   00000000    0000000   00000000  000  000      00000000
000   000  000   000  000   000  000       000  000      000     
00000000   0000000    000   000  000000    000  000      0000000 
000        000   000  000   000  000       000  000      000     
000        000   000   0000000   000       000  0000000  00000000
 */

(function() {
  var colors, now, profile, s_msg, start;

  colors = require('colors');

  now = require('performance-now');

  start = void 0;

  s_msg = void 0;

  profile = function(msg) {
    var ms;
    if ((start != null) && s_msg.length) {
      ms = (now() - start).toFixed(0);
      if (ms > 1000) {
        console.log((s_msg + " in " + ((ms / 1000).toFixed(3)) + " sec").gray);
      } else {
        console.log((s_msg + " in " + ms + " ms").gray);
      }
    }
    start = now();
    return s_msg = msg;
  };

  module.exports = profile;

}).call(this);
