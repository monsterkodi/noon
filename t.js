(function() {
  var log, noon;

  noon = require('./');

  log = console.log;

  log(noon.parse("a  . b .. c 1 .. d  2\nc  . foo .. bark"));

}).call(this);
