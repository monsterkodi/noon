
/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */

(function() {
  module.exports = {
    extnames: ['.json', '.cson', '.noon', '.plist', '.yml', '.yaml'],
    extensions: ['json', 'cson', 'noon', 'plist', 'yml', 'yaml'],
    save: require('./save'),
    load: require('./load'),
    parse: require('./parse'),
    stringify: require('./stringify')
  };

}).call(this);
