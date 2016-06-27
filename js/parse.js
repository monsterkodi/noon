
/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
 */

(function() {
  var parse;

  parse = function(s) {
    var addLine, d, dd, dk, dv, e, i, indent, insert, inspect, isArray, j, k, key, l, last, leadingSpaces, len, line, lines, makeObject, p, r, ref, ref1, ref2, stack, ud, undense, v, value, values, vl;
    last = function(a) {
      return a != null ? a[a.length - 1] : void 0;
    };
    isArray = function(a) {
      return (a != null) && typeof a === 'object' && a.constructor.name === 'Array';
    };

    /*
    000   000  000   000  0000000    00000000  000   000   0000000  00000000
    000   000  0000  000  000   000  000       0000  000  000       000     
    000   000  000 0 000  000   000  0000000   000 0 000  0000000   0000000 
    000   000  000  0000  000   000  000       000  0000       000  000     
     0000000   000   000  0000000    00000000  000   000  0000000   00000000
     */
    undense = function(d, s) {
      var esc, i, j, key, l, ld, p, pp, ref, sd, sl, t;
      sl = s.length;
      sd = d;
      p = 0;
      while (p < sl && s[p] === '.') {
        d += 1;
        p += 1;
      }
      while (p < sl && s[p] === ' ') {
        p += 1;
      }
      l = '';
      key = true;
      esc = false;
      while (p < sl) {
        if (l !== '' && s[p] === ' ' && s[p + 1] === '.') {
          pp = p + 2;
          while (pp < sl && s[pp] === '.') {
            pp += 1;
          }
          if (s[pp] === ' ') {
            p += 1;
            break;
          }
        }
        esc |= s[p] === '|';
        l += s[p];
        if (!esc && key && s[p] === ' ') {
          if (p < sl + 1 && s[p + 1] !== ' ') {
            l += ' ';
          }
          key = false;
        }
        p += 1;
        esc ^= s[p] === '|';
      }
      ld = '';
      for (i = j = 0, ref = d; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        ld += ' ';
      }
      ld += l;
      if (p < sl) {
        t = undense(sd, s.substring(p));
        t.unshift(ld);
        return t;
      } else {
        return [ld];
      }
    };

    /*
     0000000  00000000   000      000  000000000
    000       000   000  000      000     000   
    0000000   00000000   000      000     000   
         000  000        000      000     000   
    0000000   000        0000000  000     000
     */
    leadingSpaces = 0;
    while (s[leadingSpaces] === ' ') {
      leadingSpaces += 1;
    }
    lines = s.split(/\r?\n/);
    if (lines.length === 1) {
      lines = [lines[0].trim()];
      leadingSpaces = 0;
    }
    stack = [
      {
        o: [],
        d: leadingSpaces
      }
    ];

    /*
    00     00   0000000   000   000  00000000         0000000   0000000          000
    000   000  000   000  000  000   000             000   000  000   000        000
    000000000  000000000  0000000    0000000         000   000  0000000          000
    000 0 000  000   000  000  000   000             000   000  000   000  000   000
    000   000  000   000  000   000  00000000         0000000   0000000     0000000
     */
    makeObject = function(t) {
      var b, i, j, len, o, ref;
      o = {};
      ref = t.o;
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        o[i] = null;
      }
      t.l = last(t.o);
      t.o = o;
      if (stack.length > 1) {
        b = stack[stack.length - 2];
        if (isArray(b.o)) {
          b.o.pop();
          b.o.push(o);
        } else {
          b.o[b.l] = o;
        }
      }
      return o;
    };

    /*
    000   000  00000000  000   000
    000  000   000        000 000 
    0000000    0000000     00000  
    000  000   000          000   
    000   000  00000000     000
     */
    key = function(k) {
      if ((k != null ? k[0] : void 0) === '|') {
        if (k[k.length - 1] === '|') {
          return k.substr(1, k.length - 2);
        }
        return k.substr(1).trimRight();
      }
      return k;
    };

    /*
    000   000   0000000   000      000   000  00000000   0000000
    000   000  000   000  000      000   000  000       000     
     000 000   000000000  000      000   000  0000000   0000000 
       000     000   000  000      000   000  000            000
        0      000   000  0000000   0000000   00000000  0000000
     */
    values = {
      'null': null,
      'true': true,
      'false': false
    };
    value = function(v) {
      if (values[v] !== void 0) {
        return values[v];
      }
      if ((v != null ? v[0] : void 0) === '|') {
        return key(v);
      } else if ((v != null ? v[v.length - 1] : void 0) === '|') {
        return v.substr(0, v.length - 1);
      }
      if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(v)) {
        return parseFloat(v);
      }
      if (/^(\-|\+)?([0-9]+|Infinity)$/.test(v)) {
        return parseInt(v);
      }
      return v;
    };

    /*
    000  000   000   0000000  00000000  00000000   000000000
    000  0000  000  000       000       000   000     000   
    000  000 0 000  0000000   0000000   0000000       000   
    000  000  0000       000  000       000   000     000   
    000  000   000  0000000   00000000  000   000     000
     */
    insert = function(t, k, v) {
      if (isArray(t.o)) {
        if (v == null) {
          if (last(t.o) === '.') {
            t.o.pop();
            t.o.push([]);
          }
          return t.o.push(value(k));
        } else {
          return makeObject(t)[key(k)] = value(v);
        }
      } else {
        t.o[key(k)] = value(v);
        return t.l = key(k);
      }
    };

    /*
    000  000   000  0000000    00000000  000   000  000000000
    000  0000  000  000   000  000       0000  000     000   
    000  000 0 000  000   000  0000000   000 0 000     000   
    000  000  0000  000   000  000       000  0000     000   
    000  000   000  0000000    00000000  000   000     000
     */
    indent = function(t, k, v) {
      var l, o;
      o = [];
      if (v != null) {
        o = {};
      }
      if (isArray(t.o)) {
        if (last(t.o) === '.') {
          t.o.pop();
          t.o.push(o);
        } else {
          l = last(t.o);
          makeObject(t);
          t.o[l] = o;
        }
      } else {
        t.o[t.l] = o;
      }
      if (v != null) {
        o[key(k)] = value(v);
      } else {
        o.push(value(k));
      }
      return o;
    };

    /*
     0000000   0000000    0000000    000      000  000   000  00000000
    000   000  000   000  000   000  000      000  0000  000  000     
    000000000  000   000  000   000  000      000  000 0 000  0000000 
    000   000  000   000  000   000  000      000  000  0000  000     
    000   000  0000000    0000000    0000000  000  000   000  00000000
     */
    addLine = function(d, k, v) {
      var ref, t, undensed;
      if (k != null) {
        t = last(stack);
        ref = [t.undensed, false], undensed = ref[0], t.undensed = ref[1];
        if (d > t.d && !undensed) {
          return stack.push({
            o: indent(t, k, v),
            d: d
          });
        } else if (d < t.d) {
          if (isArray(t.o) && last(t.o) === '.') {
            t.o.pop();
            t.o.push([]);
          }
          while (t.d > d) {
            stack.pop();
            t = last(stack);
          }
          return insert(t, k, v);
        } else {
          if (undensed) {
            t.d = d;
          }
          return insert(t, k, v);
        }
      }
    };

    /*
    000  000   000   0000000  00000000   00000000   0000000  000000000
    000  0000  000  000       000   000  000       000          000   
    000  000 0 000  0000000   00000000   0000000   000          000   
    000  000  0000       000  000        000       000          000   
    000  000   000  0000000   000        00000000   0000000     000
     */
    inspect = function(l) {
      var d, escl, escr, k, p, v;
      p = 0;
      while (l[p] === ' ') {
        p += 1;
      }
      d = p;
      k = '';
      if (l[p] === '#') {
        return [d, null, null, false];
      }
      escl = false;
      escr = false;
      if (l[p] === '|') {
        escl = true;
        k += '|';
        p += 1;
      }
      while (l[p] != null) {
        if (l[p] === ' ' && l[p + 1] === ' ' && !escl) {
          break;
        }
        k += l[p];
        p += 1;
        if (escl && l[p - 1] === '|') {
          break;
        }
      }
      if (!escl) {
        k = k.trimRight();
      }
      while (l[p] === ' ') {
        p += 1;
      }
      v = '';
      if (l[p] === '|') {
        escr = true;
        v += '|';
        p += 1;
      }
      while (l[p] != null) {
        v += l[p];
        p += 1;
        if (escr && l[p - 1] === '|' && l.trimRight().length === p) {
          break;
        }
      }
      if (l[p - 1] === ' ' && !escr) {
        if (v != null) {
          v = v.trimRight();
        }
      }
      if (k === '') {
        k = null;
      }
      if (v === '') {
        v = null;
      }
      return [d, k, v, escl];
    };

    /*
     0000000   000   000  00000000        000      000  000   000  00000000
    000   000  0000  000  000             000      000  0000  000  000     
    000   000  000 0 000  0000000         000      000  000 0 000  0000000 
    000   000  000  0000  000             000      000  000  0000  000     
     0000000   000   000  00000000        0000000  000  000   000  00000000
     */
    if (lines.length === 1) {
      if (0 < lines[0].indexOf(':: ')) {
        lines = lines[0].split(':: ').map(function(l) {
          var p;
          p = 0;
          while (l[p] === ' ') {
            p += 1;
          }
          while ((l[p] != null) && (l[p] !== ' ')) {
            p += 1;
          }
          if (l[p] === ' ') {
            return l.slice(0, p) + ' ' + l.slice(p);
          } else {
            return l;
          }
        });
      }
      p = lines[0].indexOf(' . ');
      e = lines[0].indexOf('|');
      if (p > 0 && (p === lines[0].indexOf(' ')) && (e < 0 || p < e)) {
        lines = [lines[0].slice(0, p) + ' ' + lines[0].slice(p)];
      }
    }

    /*
    00000000   0000000    0000000  000   000        000      000  000   000  00000000
    000       000   000  000       000   000        000      000  0000  000  000     
    0000000   000000000  000       000000000        000      000  000 0 000  0000000 
    000       000   000  000       000   000        000      000  000  0000  000     
    00000000  000   000   0000000  000   000        0000000  000  000   000  00000000
     */
    i = 0;
    while (i < lines.length) {
      line = lines[i];
      ref = inspect(line), d = ref[0], k = ref[1], v = ref[2], e = ref[3];
      if (k != null) {
        if ((v != null) && (!e) && (v.substr(0, 2) === '. ')) {
          addLine(d, k);
          ud = last(stack).d;
          ref1 = undense(d, v);
          for (j = 0, len = ref1.length; j < len; j++) {
            e = ref1[j];
            ref2 = inspect(e), dd = ref2[0], dk = ref2[1], dv = ref2[2];
            addLine(dd, dk, dv);
          }
          while (last(stack).d > ud + 1) {
            stack.pop();
          }
          last(stack).undensed = true;
        } else {
          if (k === '...' && (v == null)) {
            i += 1;
            vl = [];
            while (lines[i].trimLeft().substr(0, 3) !== '...') {
              l = lines[i].trim();
              if (l[0] === '|') {
                l = l.substr(1);
              }
              if (l[l.length - 1] === '|') {
                l = l.substr(0, l.length - 1);
              }
              vl.push(l);
              i += 1;
            }
            k = vl.join('\n');
            r = lines[i].trimLeft().substr(3).trim();
            if (r.length) {
              v = r;
            }
          }
          if (v === '...') {
            i += 1;
            vl = [];
            while (lines[i].trim() !== '...') {
              l = lines[i].trim();
              if (l[0] === '|') {
                l = l.substr(1);
              }
              if (l[l.length - 1] === '|') {
                l = l.substr(0, l.length - 1);
              }
              vl.push(l);
              i += 1;
            }
            v = vl.join('\n');
          }
          addLine(d, k, v);
        }
      }
      i += 1;
    }
    return stack[0].o;
  };

  module.exports = parse;

}).call(this);
