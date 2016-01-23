
/*
000   000   0000000    0000000   000   000
0000  000  000   000  000   000  0000  000
000 0 000  000   000  000   000  000 0 000
000  0000  000   000  000   000  000  0000
000   000   0000000    0000000   000   000
 */

(function() {
  var _, args, colors, err, ext, fs, log, o, parse, path, profile, ref, s, save, sds, stringify,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  sds = require('sds');

  path = require('path');

  colors = require('colors');

  _ = require('lodash');

  profile = require('./tools/profile');

  stringify = require('./stringify');

  parse = require('./parse');

  save = require('./save');

  log = console.log;


  /*
   0000000   00000000    0000000    0000000
  000   000  000   000  000        000     
  000000000  0000000    000  0000  0000000 
  000   000  000   000  000   000       000
  000   000  000   000   0000000   0000000
   */

  args = require('karg')("noon\n    file        . ? the file to convert             . * . = package.json\n    output      . ? output file or filetype         . = .noon\n    indent      . ? indentation length              . = 4\n    align       . ? align values                    . = true\n    maxalign    . ? max align width, 0: no limit    . = 32\n    sort        . ? sort keys alphabetically        . = false\n    colors      . ? output with ansi colors         . = true\n    \nsupported filetypes:\n    " + (sds.extnames.join('\n    ')) + "\n\nversion   " + (require(__dirname + "/../package.json").version));

  err = function(msg) {
    log(("\n" + msg + "\n").red);
    return process.exit();
  };

  if (args.file) {
    ext = path.extname(args.file);
    if (ext === '.noon' || indexOf.call(sds.extnames, ext) < 0) {
      o = parse(fs.readFileSync(args.file, 'utf8'));
    } else {
      o = sds.load(args.file);
    }
    if (ref = args.output, indexOf.call(sds.extnames, ref) >= 0) {
      if (args.output === '.noon') {
        s = stringify(o, {
          align: args.align,
          indent: Math.max(1, args.indent),
          maxalign: Math.max(0, args.maxalign),
          colors: args.colors,
          sort: args.sort
        });
      } else {
        s = sds.stringify(o, {
          ext: args.output,
          indent: _.pad('', args.indent)
        });
      }
      log(s);
    } else {
      if (path.extname(args.output) === '.noon') {
        save(args.output, o, {
          align: args.align,
          indent: Math.max(1, args.indent),
          maxalign: Math.max(0, args.maxalign),
          colors: false,
          sort: args.sort
        });
      } else {
        sds.save(args.output, o, {
          indent: _.pad('', args.indent)
        });
      }
    }
  }

}).call(this);
