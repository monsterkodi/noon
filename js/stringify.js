
/*
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000
 */

(function() {
  var defaults, regs, stringify,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  defaults = {
    ext: '.noon',
    indent: 4,
    align: true,
    maxalign: 32,
    sort: false,
    circular: false,
    "null": false,
    colors: false
  };

  regs = {
    url: new RegExp('^(https?|git|file)(://)(\\S+)$'),
    path: new RegExp('^([\\.\\/\\S]+)(\\/\\S+)$'),
    semver: new RegExp('\\d+\\.\\d+\\.\\d+')
  };

  stringify = function(obj, options) {
    var beautify, colors, def, defaultColors, escape, indstr, noop, opt, padRight, pretty, s, toStr;
    if (options == null) {
      options = {};
    }
    padRight = function(s, l) {
      while (s.length < l) {
        s += ' ';
      }
      return s;
    };
    def = function(o, d) {
      var k, r, v;
      r = {};
      for (k in o) {
        v = o[k];
        r[k] = v;
      }
      for (k in d) {
        v = d[k];
        if (r[k] == null) {
          r[k] = v;
        }
      }
      return r;
    };
    opt = def(options, defaults);
    switch (opt.ext) {
      case '.json':
        return JSON.stringify(obj, null, opt.indent);
      case '.cson':
        return require('cson').stringify(obj, null, opt.indent);
      case '.plist':
        return require('simple-plist').stringify(obj);
      case '.yml':
      case '.yaml':
        return require('js-yaml').dump(obj);
    }
    if (typeof opt.indent === 'string') {
      opt.indent = opt.indent.length;
    }
    indstr = padRight('', opt.indent);

    /*
     0000000   0000000   000       0000000   00000000    0000000
    000       000   000  000      000   000  000   000  000     
    000       000   000  000      000   000  0000000    0000000 
    000       000   000  000      000   000  000   000       000
     0000000   0000000   0000000   0000000   000   000  0000000
     */
    if (opt.colors === false || opt.colors === 0) {
      noop = function(s) {
        return s;
      };
      colors = {
        url: noop,
        key: noop,
        "null": noop,
        "true": noop,
        "false": noop,
        path: noop,
        value: noop,
        string: noop,
        semver: noop,
        number: noop,
        visited: noop,
        special: noop
      };
    } else {
      colors = require('colors');
      defaultColors = {
        url: colors.yellow,
        key: colors.gray,
        "null": colors.blue,
        "true": colors.blue.bold,
        "false": colors.gray.dim,
        path: colors.green,
        value: colors.white,
        string: colors.white.bold,
        semver: colors.red,
        number: colors.magenta,
        visited: colors.red,
        dim: '^>=.:/-'
      };
      if (opt.colors === true) {
        colors = defaultColors;
      } else {
        colors = def(opt.colors, defaultColors);
      }
    }

    /*
    00000000   0000000   0000000   0000000   00000000   00000000
    000       000       000       000   000  000   000  000     
    0000000   0000000   000       000000000  00000000   0000000 
    000            000  000       000   000  000        000     
    00000000  0000000    0000000  000   000  000        00000000
     */
    escape = function(k) {
      var es, ref, ref1, sp;
      if (0 <= k.indexOf('\n')) {
        sp = k.split('\n');
        es = sp.map(function(s) {
          return escape(s);
        });
        es.unshift('...');
        es.push('...');
        return es.join('\n');
      }
      if (k === '' || k === '...' || ((ref = k[0]) === ' ' || ref === '#' || ref === '|') || ((ref1 = k[k.length - 1]) === ' ' || ref1 === '#' || ref1 === '|') || /\ \ /.test(k)) {
        k = '|' + k + '|';
      }
      return k;
    };

    /*
    0000000    00000000   0000000   000   000  000000000  000  00000000  000   000
    000   000  000       000   000  000   000     000     000  000        000 000 
    0000000    0000000   000000000  000   000     000     000  000000      00000  
    000   000  000       000   000  000   000     000     000  000          000   
    0000000    00000000  000   000   0000000      000     000  000          000
     */
    beautify = function(s) {
      var c, j, len, ref;
      if (colors.dim != null) {
        ref = colors.dim;
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          s = s.replace(new RegExp("\\" + c, 'g'), c.dim);
        }
      }
      return s;
    };

    /*
    00000000   00000000   00000000  000000000  000000000  000   000
    000   000  000   000  000          000        000      000 000 
    00000000   0000000    0000000      000        000       00000  
    000        000   000  000          000        000        000   
    000        000   000  00000000     000        000        000
     */
    pretty = function(o, ind, visited) {
      var j, k, keyValue, kl, l, len, maxKey, ref, v;
      if (opt.align) {
        maxKey = opt.indent;
        if (Object.keys(o).length > 1) {
          for (k in o) {
            if (!hasProp.call(o, k)) continue;
            v = o[k];
            kl = parseInt(Math.ceil((k.length + 2) / opt.indent) * opt.indent);
            maxKey = Math.max(maxKey, kl);
            if (opt.maxalign && (maxKey > opt.maxalign)) {
              maxKey = opt.maxalign;
              break;
            }
          }
        }
      }
      l = [];
      keyValue = function(k, v) {
        var i, ks, s, vs;
        s = ind;
        k = escape(k);
        if (k.indexOf('  ') > 0 && k[0] !== '|') {
          k = "|" + k + "|";
        } else if (k[0] !== '|' && k[k.length - 1] === '|') {
          k = '|' + k;
        } else if (k[0] === '|' && k[k.length - 1] !== '|') {
          k += '|';
        }
        if (opt.align) {
          ks = padRight(k, Math.max(maxKey, k.length + 2));
          i = padRight(ind + indstr, maxKey);
        } else {
          ks = padRight(k, k.length + 2);
          i = ind + indstr;
        }
        s += colors.key(opt.colors !== false && s.length === 0 && ks.bold || ks);
        vs = toStr(v, i, false, visited);
        if (vs[0] === '\n') {
          while (s[s.length - 1] === ' ') {
            s = s.substr(0, s.length - 1);
          }
        }
        s += vs;
        while (s[s.length - 1] === ' ') {
          s = s.substr(0, s.length - 1);
        }
        return s;
      };
      if (opt.sort) {
        ref = Object.keys(o).sort();
        for (j = 0, len = ref.length; j < len; j++) {
          k = ref[j];
          l.push(keyValue(k, o[k]));
        }
      } else {
        for (k in o) {
          if (!hasProp.call(o, k)) continue;
          v = o[k];
          l.push(keyValue(k, v));
        }
      }
      return l.join('\n');
    };

    /*
    000000000   0000000    0000000  000000000  00000000 
       000     000   000  000          000     000   000
       000     000   000  0000000      000     0000000  
       000     000   000       000     000     000   000
       000      0000000   0000000      000     000   000
     */
    toStr = function(o, ind, arry, visited) {
      var j, len, rc, ref, ref1, s, t, v;
      if (ind == null) {
        ind = '';
      }
      if (arry == null) {
        arry = false;
      }
      if (visited == null) {
        visited = [];
      }
      if (o == null) {
        if (o === null) {
          return opt["null"] || arry && colors["null"]("null") || '';
        }
        if (o === void 0) {
          return colors["null"]("undefined");
        }
        return colors["null"]('<?>');
      }
      t = typeof o;
      if (t === 'string') {
        if (opt.colors !== false) {
          ref = Object.keys(regs);
          for (j = 0, len = ref.length; j < len; j++) {
            rc = ref[j];
            if ((colors[rc] != null) && regs[rc].test(o)) {
              return colors[rc](beautify(escape(o)));
            }
          }
        }
        return colors.string(escape(o));
      } else if (t === 'object') {
        if (opt.circular) {
          if (indexOf.call(visited, o) >= 0) {
            return colors.visited('<v>');
          }
          visited.push(o);
        }
        if (((ref1 = o.constructor) != null ? ref1.name : void 0) === 'Array') {
          s = ind !== '' && arry && '.' || '';
          if (o.length && ind !== '') {
            s += '\n';
          }
          s += ((function() {
            var len1, m, results;
            results = [];
            for (m = 0, len1 = o.length; m < len1; m++) {
              v = o[m];
              results.push(ind + toStr(v, ind + indstr, true, visited));
            }
            return results;
          })()).join('\n');
        } else {
          s = (arry && '.\n') || ((ind !== '') && '\n' || '');
          s += pretty(o, ind, visited);
        }
        return s;
      } else if (t === 'number') {
        return colors.number(String(o));
      } else if (t === 'boolean') {
        return (o && colors["true"] || colors["false"])(String(o));
      } else {
        return colors.value(String(o));
      }
      return colors["null"]('<???>');
    };
    s = toStr(obj);
    return s;
  };

  module.exports = stringify;

}).call(this);
