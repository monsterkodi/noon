// koffee 0.56.0

/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000
00000000   000000000  0000000    0000000   0000000
000        000   000  000   000       000  000
000        000   000  000   000  0000000   00000000
 */
var parse;

parse = function(s) {
    var EMPTY, FLOAT, INT, NEWLINE, addLine, d, dd, dk, dv, e, i, indent, insert, inspect, isArray, j, k, key, l, last, leadingSpaces, len, line, lines, makeObject, p, r, ref, ref1, ref2, stack, ud, undense, v, value, values, vl;
    EMPTY = /^\s*$/;
    NEWLINE = /\r?\n/;
    FLOAT = /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/;
    INT = /^(\-|\+)?([0-9]+|Infinity)$/;
    last = function(a) {
        return a != null ? a[a.length - 1] : void 0;
    };
    isArray = function(a) {
        return (a != null) && typeof a === 'object' && a.constructor.name === 'Array';
    };
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
    leadingSpaces = 0;
    lines = s.split(NEWLINE).filter(function(l) {
        return !EMPTY.test(l);
    });
    if (lines.length === 1) {
        lines = [lines[0].trim()];
    } else {
        while (lines[0][leadingSpaces] === ' ') {
            leadingSpaces += 1;
        }
    }
    stack = [
        {
            o: [],
            d: leadingSpaces
        }
    ];
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
    key = function(k) {
        if ((k != null ? k[0] : void 0) === '|') {
            if (k[k.length - 1] === '|') {
                return k.substr(1, k.length - 2);
            }
            return k.substr(1).trimRight();
        }
        return k;
    };
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
        if (FLOAT.test(v)) {
            return parseFloat(v);
        }
        if (INT.test(v)) {
            return parseInt(v);
        }
        return v;
    };
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
    inspect = function(l) {
        var d, escl, escr, k, p, v;
        p = 0;
        while (l[p] === ' ') {
            p += 1;
        }
        if (l[p] == null) {
            return [0, null, null, false];
        }
        d = p;
        k = '';
        if (l[p] === '#') {
            return [0, null, null, false];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUSxTQUFDLENBQUQ7QUFFSixRQUFBO0lBQUEsS0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVO0lBQ1YsS0FBQSxHQUFVO0lBQ1YsR0FBQSxHQUFVO0lBRVYsSUFBQSxHQUFPLFNBQUMsQ0FBRDsyQkFBTyxDQUFHLENBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFUO0lBQVY7SUFDUCxPQUFBLEdBQVUsU0FBQyxDQUFEO2VBQU8sV0FBQSxJQUFPLE9BQU8sQ0FBUCxLQUFhLFFBQXBCLElBQWlDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBZCxLQUFzQjtJQUE5RDtJQVFWLE9BQUEsR0FBVSxTQUFDLENBQUQsRUFBSSxDQUFKO0FBQ04sWUFBQTtRQUFBLEVBQUEsR0FBSyxDQUFDLENBQUM7UUFDUCxFQUFBLEdBQUs7UUFFTCxDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxFQUFKLElBQVcsQ0FBRSxDQUFBLENBQUEsQ0FBRixLQUFRLEdBQXpCO1lBQ0ksQ0FBQSxJQUFLO1lBQ0wsQ0FBQSxJQUFLO1FBRlQ7QUFJQSxlQUFNLENBQUEsR0FBSSxFQUFKLElBQVcsQ0FBRSxDQUFBLENBQUEsQ0FBRixLQUFRLEdBQXpCO1lBQ0ksQ0FBQSxJQUFLO1FBRFQ7UUFHQSxDQUFBLEdBQUk7UUFDSixHQUFBLEdBQU07UUFDTixHQUFBLEdBQU07QUFFTixlQUFNLENBQUEsR0FBSSxFQUFWO1lBQ0ksSUFBRyxDQUFBLEtBQUssRUFBTCxJQUFZLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUFwQixJQUE0QixDQUFFLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBRixLQUFVLEdBQXpDO2dCQUNJLEVBQUEsR0FBSyxDQUFBLEdBQUU7QUFDUCx1QkFBTSxFQUFBLEdBQUssRUFBTCxJQUFZLENBQUUsQ0FB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LENBQUMsSUFBVCxDQUFBLENBQUEsS0FBbUIsS0FBekI7d0JBQ0ksQ0FBQSxHQUFJLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFULENBQUE7d0JBQ0osSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBWDs0QkFBb0IsQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBVCxFQUF4Qjs7d0JBQ0EsSUFBRyxDQUFFLENBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFULENBQUYsS0FBaUIsR0FBcEI7NEJBQTZCLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsRUFBWSxDQUFDLENBQUMsTUFBRixHQUFTLENBQXJCLEVBQWpDOzt3QkFDQSxFQUFFLENBQUMsSUFBSCxDQUFRLENBQVI7d0JBQ0EsQ0FBQSxJQUFLO29CQUxUO29CQU1BLENBQUEsR0FBSSxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVIsRUFUUjs7Z0JBV0EsT0FBQSxDQUFRLENBQVIsRUFBVyxDQUFYLEVBQWMsQ0FBZCxFQXRDSjthQURKOztRQXdDQSxDQUFBLElBQUs7SUE5Q1Q7V0FnREEsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDO0FBN1ZMOztBQStWUixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG4jIyNcblxucGFyc2UgPSAocykgLT5cblxuICAgIEVNUFRZICAgPSAvXlxccyokL1xuICAgIE5FV0xJTkUgPSAvXFxyP1xcbi9cbiAgICBGTE9BVCAgID0gL14oXFwtfFxcKyk/KFswLTldKyhcXC5bMC05XSspP3xJbmZpbml0eSkkL1xuICAgIElOVCAgICAgPSAvXihcXC18XFwrKT8oWzAtOV0rfEluZmluaXR5KSQvXG5cbiAgICBsYXN0ID0gKGEpIC0+IGE/W2EubGVuZ3RoLTFdXG4gICAgaXNBcnJheSA9IChhKSAtPiBhPyBhbmQgdHlwZW9mKGEpID09ICdvYmplY3QnIGFuZCBhLmNvbnN0cnVjdG9yLm5hbWUgPT0gJ0FycmF5J1xuXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcblxuICAgIHVuZGVuc2UgPSAoZCwgcykgLT4gIyB1bmRlbnNlcyBzdHJpbmcgcyBhdCBkZXB0aCBkLiBSZXR1cm5zIGxpc3Qgb2YgcGFkZGVkIGxpbmVzXG4gICAgICAgIHNsID0gcy5sZW5ndGhcbiAgICAgICAgc2QgPSBkXG5cbiAgICAgICAgcCA9IDBcbiAgICAgICAgd2hpbGUgcCA8IHNsIGFuZCBzW3BdID09ICcuJyAjIGRlcHRoIGRvdHNcbiAgICAgICAgICAgIGQgKz0gMVxuICAgICAgICAgICAgcCArPSAxXG5cbiAgICAgICAgd2hpbGUgcCA8IHNsIGFuZCBzW3BdID09ICcgJyAjIHNwYWNlcyBiZWZvcmUga2V5L2l0ZW1cbiAgICAgICAgICAgIHAgKz0gMVxuXG4gICAgICAgIGwgPSAnJ1xuICAgICAgICBrZXkgPSB0cnVlXG4gICAgICAgIGVzYyA9IGZhbHNlXG5cbiAgICAgICAgd2hpbGUgcCA8IHNsXG4gICAgICAgICAgICBpZiBsICE9ICcnIGFuZCBzW3BdID09ICcgJyBhbmQgc1twKzFdID09ICcuJ1xuICAgICAgICAgICAgICAgIHBwID0gcCsyXG4gICAgICAgICAgICAgICAgd2hpbGUgcHAgPCBzbCBhbmQgc1twcF0gPT0gJy4nXG4gICAgICAgICAgICAgICAgICAgIHBwICs9IDFcbiAgICAgICAgICAgICAgICBpZiBzW3BwXSA9PSAnICdcbiAgICAgICAgICAgICAgICAgICAgcCArPSAxXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlc2MgfD0gc1twXSA9PSAgJ3wnXG4gICAgICAgICAgICBsICs9IHNbcF1cbiAgICAgICAgICAgIGlmIG5vdCBlc2MgYW5kIGtleSBhbmQgc1twXSA9PSAnICdcbiAgICAgICAgICAgICAgICBpZiBwIDwgc2wrMSBhbmQgc1twKzFdICE9ICcgJ1xuICAgICAgICAgICAgICAgICAgICBsICs9ICcgJ1xuICAgICAgICAgICAgICAgIGtleSA9IGZhbHNlXG4gICAgICAgICAgICBwICs9IDFcbiAgICAgICAgICAgIGVzYyBePSBzW3BdID09ICAnfCdcblxuICAgICAgICBsZCA9ICcnICMgcGFkIGxpbmUgd2l0aCBzcGFjZXNcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5kXVxuICAgICAgICAgICAgbGQgKz0gJyAnXG4gICAgICAgIGxkICs9IGxcblxuICAgICAgICBpZiBwIDwgc2xcbiAgICAgICAgICAgIHQgPSB1bmRlbnNlIHNkLCBzLnN1YnN0cmluZyBwXG4gICAgICAgICAgICB0LnVuc2hpZnQgbGRcbiAgICAgICAgICAgIHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgW2xkXVxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgICAwMDBcblxuICAgIGxlYWRpbmdTcGFjZXMgPSAwXG5cbiAgICBsaW5lcyA9IHMuc3BsaXQoTkVXTElORSkuZmlsdGVyIChsKSAtPiBub3QgRU1QVFkudGVzdCBsXG5cbiAgICBpZiBsaW5lcy5sZW5ndGggPT0gMVxuICAgICAgICBsaW5lcyA9IFtsaW5lc1swXS50cmltKCldXG4gICAgZWxzZVxuICAgICAgICB3aGlsZSBsaW5lc1swXVtsZWFkaW5nU3BhY2VzXSA9PSAnICdcbiAgICAgICAgICAgIGxlYWRpbmdTcGFjZXMgKz0gMVxuXG4gICAgc3RhY2sgPSBbXG4gICAgICAgIG86IFtdXG4gICAgICAgIGQ6IGxlYWRpbmdTcGFjZXNcbiAgICBdXG5cbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAwMDAwXG5cbiAgICBtYWtlT2JqZWN0ID0gKHQpIC0+XG4gICAgICAgIG8gPSB7fVxuICAgICAgICBmb3IgaSBpbiB0Lm9cbiAgICAgICAgICAgIG9baV0gPSBudWxsXG4gICAgICAgIHQubCA9IGxhc3QgdC5vXG4gICAgICAgIHQubyA9IG9cbiAgICAgICAgaWYgc3RhY2subGVuZ3RoID4gMVxuICAgICAgICAgICAgYiA9IHN0YWNrW3N0YWNrLmxlbmd0aC0yXVxuICAgICAgICAgICAgaWYgaXNBcnJheSBiLm9cbiAgICAgICAgICAgICAgICBiLm8ucG9wKClcbiAgICAgICAgICAgICAgICBiLm8ucHVzaCBvXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYi5vW2IubF0gPSBvXG4gICAgICAgIG9cblxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDBcblxuICAgIGtleSA9IChrKSAtPlxuICAgICAgICBpZiBrP1swXSA9PSAnfCdcbiAgICAgICAgICAgIGlmIGtbay5sZW5ndGgtMV0gPT0gJ3wnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGsuc3Vic3RyKDEsIGsubGVuZ3RoLTIpXG4gICAgICAgICAgICByZXR1cm4gay5zdWJzdHIoMSkudHJpbVJpZ2h0KClcbiAgICAgICAga1xuXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDBcbiAgICAjICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICB2YWx1ZXMgPVxuICAgICAgICAnbnVsbCc6IG51bGxcbiAgICAgICAgJ3RydWUnOiB0cnVlXG4gICAgICAgICdmYWxzZSc6IGZhbHNlXG5cbiAgICB2YWx1ZSA9ICh2KSAtPlxuICAgICAgICBpZiB2YWx1ZXNbdl0gIT0gdW5kZWZpbmVkICB0aGVuIHJldHVybiB2YWx1ZXNbdl1cbiAgICAgICAgaWYgdj9bMF0gPT0gJ3wnIHRoZW4gcmV0dXJuIGtleSB2XG4gICAgICAgIGVsc2UgaWYgdj9bdi5sZW5ndGgtMV0gPT0gJ3wnXG4gICAgICAgICAgICByZXR1cm4gdi5zdWJzdHIoMCwgdi5sZW5ndGgtMSlcbiAgICAgICAgaWYgRkxPQVQudGVzdCh2KSB0aGVuIHJldHVybiBwYXJzZUZsb2F0IHZcbiAgICAgICAgaWYgSU5ULnRlc3QodikgICB0aGVuIHJldHVybiBwYXJzZUludCAgIHZcbiAgICAgICAgdlxuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuICAgIGluc2VydCA9ICh0LCBrLCB2KSAtPlxuICAgICAgICBpZiBpc0FycmF5IHQub1xuICAgICAgICAgICAgaWYgbm90IHY/XG4gICAgICAgICAgICAgICAgaWYgbGFzdCh0Lm8pID09ICcuJ1xuICAgICAgICAgICAgICAgICAgICB0Lm8ucG9wKClcbiAgICAgICAgICAgICAgICAgICAgdC5vLnB1c2ggW11cbiAgICAgICAgICAgICAgICB0Lm8ucHVzaCB2YWx1ZSBrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWFrZU9iamVjdCh0KVtrZXkga10gPSB2YWx1ZSB2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHQub1trZXkga10gPSB2YWx1ZSB2XG4gICAgICAgICAgICB0LmwgPSBrZXkga1xuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG4gICAgaW5kZW50ID0gKHQsIGssIHYpIC0+XG4gICAgICAgIG8gPSBbXVxuICAgICAgICBvID0ge30gaWYgdj9cblxuICAgICAgICBpZiBpc0FycmF5IHQub1xuICAgICAgICAgICAgaWYgbGFzdCh0Lm8pID09ICcuJ1xuICAgICAgICAgICAgICAgIHQuby5wb3AoKVxuICAgICAgICAgICAgICAgIHQuby5wdXNoIG9cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsID0gbGFzdCB0Lm9cbiAgICAgICAgICAgICAgICBtYWtlT2JqZWN0KHQpXG4gICAgICAgICAgICAgICAgdC5vW2xdID0gb1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0Lm9bdC5sXSA9IG9cblxuICAgICAgICBpZiB2P1xuICAgICAgICAgICAgb1trZXkga10gPSB2YWx1ZSB2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG8ucHVzaCB2YWx1ZSBrXG4gICAgICAgIG9cblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG5cbiAgICBhZGRMaW5lID0gKGQsayx2KSAtPlxuICAgICAgICBpZiBrP1xuICAgICAgICAgICAgdCA9IGxhc3Qgc3RhY2tcbiAgICAgICAgICAgIFt1bmRlbnNlZCwgdC51bmRlbnNlZF0gPSBbdC51bmRlbnNlZCwgZmFsc2VdXG4gICAgICAgICAgICBpZiBkID4gdC5kIGFuZCBub3QgdW5kZW5zZWRcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoXG4gICAgICAgICAgICAgICAgICAgIG86IGluZGVudCB0LCBrLCB2XG4gICAgICAgICAgICAgICAgICAgIGQ6IGRcbiAgICAgICAgICAgIGVsc2UgaWYgZCA8IHQuZFxuICAgICAgICAgICAgICAgIGlmIGlzQXJyYXkodC5vKSBhbmQgbGFzdCh0Lm8pID09ICcuJ1xuICAgICAgICAgICAgICAgICAgICB0Lm8ucG9wKClcbiAgICAgICAgICAgICAgICAgICAgdC5vLnB1c2ggW11cbiAgICAgICAgICAgICAgICB3aGlsZSB0LmQgPiBkXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBsYXN0IHN0YWNrXG4gICAgICAgICAgICAgICAgaW5zZXJ0IHQsIGssIHZcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiB1bmRlbnNlZFxuICAgICAgICAgICAgICAgICAgICB0LmQgPSBkXG4gICAgICAgICAgICAgICAgaW5zZXJ0IHQsIGssIHZcblxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuICAgIGluc3BlY3QgPSAobCkgLT5cblxuICAgICAgICBwID0gMFxuXG4gICAgICAgIHdoaWxlIGxbcF0gPT0gJyAnICMgcHJlY2VlZGluZyBzcGFjZXNcbiAgICAgICAgICAgIHAgKz0gMVxuXG4gICAgICAgIGlmIG5vdCBsW3BdPyB0aGVuIHJldHVybiBbMCwgbnVsbCwgbnVsbCwgZmFsc2VdICMgb25seSBzcGFjZXMgaW4gbGluZVxuXG4gICAgICAgIGQgPSBwXG4gICAgICAgIGsgPSAnJ1xuXG4gICAgICAgIGlmIGxbcF0gPT0gJyMnIHRoZW4gcmV0dXJuIFswLCBudWxsLCBudWxsLCBmYWxzZV0gIyBjb21tZW50IGxpbmVcblxuICAgICAgICBlc2NsID0gZmFsc2VcbiAgICAgICAgZXNjciA9IGZhbHNlXG4gICAgICAgIGlmIGxbcF0gPT0gJ3wnXG4gICAgICAgICAgICBlc2NsID0gdHJ1ZVxuICAgICAgICAgICAgayArPSAnfCdcbiAgICAgICAgICAgIHAgKz0gMVxuXG4gICAgICAgIHdoaWxlIGxbcF0/XG4gICAgICAgICAgICBpZiBsW3BdID09ICcgJyBhbmQgbFtwKzFdID09ICcgJyBhbmQgbm90IGVzY2xcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBrICs9IGxbcF1cbiAgICAgICAgICAgIHAgKz0gMVxuICAgICAgICAgICAgaWYgZXNjbCBhbmQgbFtwLTFdID09ICd8J1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgaWYgbm90IGVzY2xcbiAgICAgICAgICAgIGsgPSBrLnRyaW1SaWdodCgpXG5cbiAgICAgICAgd2hpbGUgbFtwXSA9PSAnICcgIyB3aGl0ZXNwYWNlIGJldHdlZW4ga2V5IGFuZCB2YWx1ZVxuICAgICAgICAgICAgcCArPSAxXG5cbiAgICAgICAgdiA9ICcnXG5cbiAgICAgICAgaWYgbFtwXSA9PSAnfCdcbiAgICAgICAgICAgIGVzY3IgPSB0cnVlXG4gICAgICAgICAgICB2ICs9ICd8J1xuICAgICAgICAgICAgcCArPSAxXG5cbiAgICAgICAgd2hpbGUgbFtwXT9cbiAgICAgICAgICAgIHYgKz0gbFtwXVxuICAgICAgICAgICAgcCArPSAxXG4gICAgICAgICAgICBpZiBlc2NyIGFuZCBsW3AtMV0gPT0gJ3wnIGFuZCBsLnRyaW1SaWdodCgpLmxlbmd0aCA9PSBwXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBpZiBsW3AtMV0gPT0gJyAnIGFuZCBub3QgZXNjclxuICAgICAgICAgICAgdiA9IHYudHJpbVJpZ2h0KCkgaWYgdj9cblxuICAgICAgICBrID0gbnVsbCBpZiBrID09ICcnXG4gICAgICAgIHYgPSBudWxsIGlmIHYgPT0gJydcbiAgICAgICAgW2QsIGssIHYsIGVzY2xdXG5cbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgICAgICAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGlmIGxpbmVzLmxlbmd0aCA9PSAxXG4gICAgICAgIGlmIDAgPCBsaW5lc1swXS5pbmRleE9mICc6OiAnXG4gICAgICAgICAgICBsaW5lcyA9IGxpbmVzWzBdLnNwbGl0KCc6OiAnKS5tYXAgKGwpIC0+XG4gICAgICAgICAgICAgICAgcCA9IDBcbiAgICAgICAgICAgICAgICB3aGlsZSBsW3BdID09ICcgJ1xuICAgICAgICAgICAgICAgICAgICBwICs9IDFcbiAgICAgICAgICAgICAgICB3aGlsZSBsW3BdPyBhbmQgKGxbcF0gIT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICBwICs9IDFcbiAgICAgICAgICAgICAgICBpZiBsW3BdID09ICcgJ1xuICAgICAgICAgICAgICAgICAgICBsLnNsaWNlKDAsIHApICsgJyAnICsgbC5zbGljZShwKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbFxuICAgICAgICBwID0gbGluZXNbMF0uaW5kZXhPZiAnIC4gJ1xuICAgICAgICBlID0gbGluZXNbMF0uaW5kZXhPZiAnfCdcbiAgICAgICAgaWYgcCA+IDAgYW5kIChwID09IGxpbmVzWzBdLmluZGV4T2YgJyAnKSBhbmQgKGUgPCAwIG9yIHAgPCBlKVxuICAgICAgICAgICAgbGluZXMgPSBbbGluZXNbMF0uc2xpY2UoMCxwKSArICcgJyArIGxpbmVzWzBdLnNsaWNlKHApXVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcblxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IGxpbmVzLmxlbmd0aFxuXG4gICAgICAgIGxpbmUgPSBsaW5lc1tpXVxuXG4gICAgICAgIFtkLCBrLCB2LCBlXSA9IGluc3BlY3QgbGluZVxuXG4gICAgICAgIGlmIGs/XG4gICAgICAgICAgICBpZiB2PyBhbmQgKG5vdCBlKSBhbmQgKHYuc3Vic3RyKDAsMikgPT0gJy4gJykgIyBkZW5zZSB2YWx1ZVxuICAgICAgICAgICAgICAgIGFkZExpbmUgZCwga1xuXG4gICAgICAgICAgICAgICAgdWQgPSBsYXN0KHN0YWNrKS5kXG5cbiAgICAgICAgICAgICAgICBmb3IgZSBpbiB1bmRlbnNlIGQsIHZcbiAgICAgICAgICAgICAgICAgICAgW2RkLGRrLGR2XSA9IGluc3BlY3QgZVxuICAgICAgICAgICAgICAgICAgICBhZGRMaW5lIGRkLCBkaywgZHZcblxuICAgICAgICAgICAgICAgIHdoaWxlIGxhc3Qoc3RhY2spLmQgPiB1ZCsxXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgICAgICAgICAgbGFzdChzdGFjaykudW5kZW5zZWQgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgayA9PSAnLi4uJyBhbmQgbm90IHY/XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMVxuICAgICAgICAgICAgICAgICAgICB2bCA9IFtdXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIGxpbmVzW2ldLnRyaW1MZWZ0KCkuc3Vic3RyKDAsMykgIT0gJy4uLidcbiAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBsaW5lc1tpXS50cmltKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxbMF0gPT0gJ3wnIHRoZW4gbCA9IGwuc3Vic3RyIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxbbC5sZW5ndGgtMV0gPT0gJ3wnIHRoZW4gbCA9IGwuc3Vic3RyIDAsIGwubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIHZsLnB1c2ggbFxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxXG4gICAgICAgICAgICAgICAgICAgIGsgPSB2bC5qb2luICdcXG4nXG4gICAgICAgICAgICAgICAgICAgIHIgPSBsaW5lc1tpXS50cmltTGVmdCgpLnN1YnN0cigzKS50cmltKClcbiAgICAgICAgICAgICAgICAgICAgaWYgci5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSByXG5cbiAgICAgICAgICAgICAgICBpZiB2ID09ICcuLi4nXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMVxuICAgICAgICAgICAgICAgICAgICB2bCA9IFtdXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIGxpbmVzW2ldLnRyaW0oKSAhPSAnLi4uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbCA9IGxpbmVzW2ldLnRyaW0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbFswXSA9PSAnfCcgdGhlbiBsID0gbC5zdWJzdHIgMVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbFtsLmxlbmd0aC0xXSA9PSAnfCcgdGhlbiBsID0gbC5zdWJzdHIgMCwgbC5sZW5ndGgtMVxuICAgICAgICAgICAgICAgICAgICAgICAgdmwucHVzaCBsXG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDFcbiAgICAgICAgICAgICAgICAgICAgdiA9IHZsLmpvaW4gJ1xcbidcblxuICAgICAgICAgICAgICAgIGFkZExpbmUgZCwgaywgdlxuICAgICAgICBpICs9IDFcblxuICAgIHN0YWNrWzBdLm9cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVxuIl19
//# sourceURL=../coffee/parse.coffee