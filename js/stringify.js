
/*
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000
 */

(function() {
  var defaults, stringify,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  defaults = {
    indent: 4,
    align: true,
    maxalign: 32,
    sort: false,
    circular: false,
    "null": false,
    colors: false
  };

  stringify = function(obj, options) {
    var colors, def, defaultColors, escape, indstr, noop, opt, padRight, pretty, s, toStr;
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
    if (typeof opt.indent === 'string') {
      opt.indent = opt.indent.length;
    }
    indstr = padRight('', opt.indent);
    if (opt.colors === false || opt.colors === 0) {
      noop = function(s) {
        return s;
      };
      colors = {
        key: noop,
        "null": noop,
        value: noop,
        string: noop,
        visited: noop
      };
    } else {
      colors = require('colors');
      defaultColors = {
        key: colors.bold.gray,
        "null": colors.bold.blue,
        value: colors.bold.magenta,
        string: colors.bold.white,
        visited: colors.bold.red
      };
      if (opt.colors === true) {
        colors = defaultColors;
      } else {
        colors = def(opt.colors, defaultColors);
      }
    }
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
      if (k === '' || k === '...' || ((ref = k[0]) === ' ' || ref === '#' || ref === '|') || ((ref1 = k[k.length - 1]) === ' ' || ref1 === '#' || ref1 === '|')) {
        k = '|' + k + '|';
      }
      return k;
    };
    pretty = function(o, ind, visited) {
      var j, k, keyValue, kl, l, len, maxKey, ref, v;
      if (opt.align) {
        maxKey = 0;
        for (k in o) {
          if (!hasProp.call(o, k)) continue;
          v = o[k];
          kl = parseInt(Math.ceil((k.length + 2) / opt.indent) * opt.indent);
          maxKey = Math.max(maxKey, kl);
          if (opt.maxalign && maxKey > opt.maxalign) {
            maxKey = opt.maxalign;
            break;
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
        s += colors.key(ks);
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
    toStr = function(o, ind, arry, visited) {
      var s, t, v;
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
        return colors.string(escape(o));
      } else if (t === 'object') {
        if (opt.circular) {
          if (indexOf.call(visited, o) >= 0) {
            return colors.visited('<v>');
          }
          visited.push(o);
        }
        if (o.constructor.name === 'Array') {
          s = ind !== '' && arry && '.' || '';
          if (o.length && ind !== '') {
            s += '\n';
          }
          s += ((function() {
            var j, len, results;
            results = [];
            for (j = 0, len = o.length; j < len; j++) {
              v = o[j];
              results.push(ind + toStr(v, ind + indstr, true, visited));
            }
            return results;
          })()).join('\n');
        } else {
          s = (arry && '.\n') || ((ind !== '') && '\n' || '');
          s += pretty(o, ind, visited);
        }
        return s;
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
