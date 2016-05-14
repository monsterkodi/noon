
/*
000   000   0000000    0000000   000   000
0000  000  000   000  000   000  0000  000
000 0 000  000   000  000   000  000 0 000
000  0000  000   000  000   000  000  0000
000   000   0000000    0000000   000   000
 */

(function() {
  var _, args, colors, d, e, err, error, ext, fs, load, log, noon, o, parse, path, ref, save, stringify,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  path = require('path');

  colors = require('colors');

  _ = require('lodash');

  stringify = require('./stringify');

  parse = require('./parse');

  load = require('./load');

  save = require('./save');

  noon = require('./main');

  log = console.log;


  /*
   0000000   00000000    0000000    0000000
  000   000  000   000  000        000     
  000000000  0000000    000  0000  0000000 
  000   000  000   000  000   000       000
  000   000  000   000   0000000   0000000
   */

  args = require('karg')("noon\n    file        . ? the file to convert             . * . = package.json\n    output      . ? output file or filetype         . = .noon\n    indent      . ? indentation length              . = 4\n    align       . ? align values                    . = true\n    maxalign    . ? max align width, 0: no limit    . = 32\n    sort        . ? sort keys alphabetically        . = false\n    colors      . ? output with ansi colors         . = true\n    type        . ? input filetype\n    \nsupported filetypes:\n    " + (noon.extnames.join('\n    ')) + "\n\nversion   " + (require(__dirname + "/../package.json").version));

  err = function(msg) {
    log(("\n" + msg + "\n").red);
    return process.exit();
  };

  if (args.file) {
    ext = path.extname(args.file);
    try {
      d = load(args.file, args.type);
    } catch (error) {
      e = error;
      err(e);
    }
    if (ref = args.output, indexOf.call(noon.extnames, ref) >= 0) {
      if (args.output === '.noon') {
        o = {
          align: args.align,
          indent: Math.max(1, args.indent),
          maxalign: Math.max(0, args.maxalign),
          colors: args.colors,
          sort: args.sort
        };
      } else {
        o = {
          ext: args.output,
          indent: _.pad('', args.indent)
        };
      }
      log(stringify(d, o));
    } else {
      if (path.extname(args.output) === '.noon') {
        o = {
          align: args.align,
          indent: Math.max(1, args.indent),
          maxalign: Math.max(0, args.maxalign),
          colors: false,
          sort: args.sort
        };
      } else {
        o = {
          indent: _.pad('', args.indent)
        };
      }
      save(args.output, d, o);
    }
  }

}).call(this);
