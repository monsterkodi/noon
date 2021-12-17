// monsterkodi/kode 0.139.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var parse


parse = function (s)
{
    var EMPTY, NEWLINE, FLOAT, INT, last, isArray, undense, leadingSpaces, lines, stack, makeObject, key, values, value, insert, indent, addLine, inspect, p, e, i, line, d, k, v, ud, dd, dk, dv, oi, lineFail, vl, l, r

    if (!s)
    {
        return ''
    }
    if (s === '')
    {
        return ''
    }
    EMPTY = /^\s*$/
    NEWLINE = /\r?\n/
    FLOAT = /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
    INT = /^(\-|\+)?([0-9]+|Infinity)$/
    last = function (a)
    {
        return (a != null ? a[a.length - 1] : undefined)
    }
    isArray = function (a)
    {
        return (a != null) && typeof(a) === 'object' && a.constructor.name === 'Array'
    }
    undense = function (d, s)
    {
        var sl, sd, p, l, key, esc, pp, ld, i, t

        sl = s.length
        sd = d
        p = 0
        while (p < sl && s[p] === '.')
        {
            d += 1
            p += 1
        }
        while (p < sl && s[p] === ' ')
        {
            p += 1
        }
        l = ''
        key = true
        esc = false
        while (p < sl)
        {
            if (l !== '' && s[p] === ' ' && s[p + 1] === '.')
            {
                pp = p + 2
                while (pp < sl && s[pp] === '.')
                {
                    pp += 1
                }
                if (s[pp] === ' ')
                {
                    p += 1
                    break
                }
            }
            esc |= s[p] === '|'
            l += s[p]
            if (!esc && key && s[p] === ' ')
            {
                if (p < sl + 1 && s[p + 1] !== ' ')
                {
                    l += ' '
                }
                key = false
            }
            p += 1
            esc ^= s[p] === '|'
        }
        ld = ''
        for (i = 0; i < d; i++)
        {
            ld += ' '
        }
        ld += l
        if (p < sl)
        {
            t = undense(sd,s.substring(p))
            t.unshift(ld)
            return t
        }
        else
        {
            return [ld]
        }
    }
    leadingSpaces = 0
    lines = s.split(NEWLINE).filter(function (l)
    {
        return !EMPTY.test(l)
    })
    if (lines.length === 0)
    {
        return ''
    }
    else if (lines.length === 1)
    {
        lines = [lines[0].trim()]
    }
    else
    {
        while (lines[0][leadingSpaces] === ' ')
        {
            leadingSpaces += 1
        }
    }
    stack = [{o:[],d:leadingSpaces}]
    makeObject = function (t)
    {
        var o, i, b

        o = {}
        var list = _k_.list(t.o)
        for (var _105_14_ = 0; _105_14_ < list.length; _105_14_++)
        {
            i = list[_105_14_]
            o[i] = null
        }
        t.l = last(t.o)
        t.o = o
        if (stack.length > 1)
        {
            b = stack[stack.length - 2]
            if (isArray(b.o))
            {
                b.o.pop()
                b.o.push(o)
            }
            else
            {
                b.o[b.l] = o
            }
        }
        return o
    }
    key = function (k)
    {
        if ((k != null ? k[0] : undefined) === '|')
        {
            if (k[k.length - 1] === '|')
            {
                return k.substr(1,k.length - 2)
            }
            return k.substr(1).trimRight()
        }
        return k
    }
    values = {'null':null,'true':true,'false':false}
    value = function (v)
    {
        if (values[v] !== undefined)
        {
            return values[v]
        }
        if ((v != null ? v[0] : undefined) === '|')
        {
            return key(v)
        }
        else if ((v != null ? v[v.length - 1] : undefined) === '|')
        {
            return v.substr(0,v.length - 1)
        }
        if (FLOAT.test(v))
        {
            return parseFloat(v)
        }
        if (INT.test(v))
        {
            return parseInt(v)
        }
        return v
    }
    insert = function (t, k, v)
    {
        if (isArray(t.o))
        {
            if (!(v != null))
            {
                if ((last(t.o) === '.' && '.' === k))
                {
                    t.o.pop()
                    t.o.push([])
                }
                return t.o.push(value(k))
            }
            else
            {
                return makeObject(t)[key(k)] = value(v)
            }
        }
        else
        {
            t.o[key(k)] = value(v)
            return t.l = key(k)
        }
    }
    indent = function (t, k, v)
    {
        var o, l

        o = []
        if ((v != null))
        {
            o = {}
        }
        if (isArray(t.o))
        {
            if (last(t.o) === '.')
            {
                t.o.pop()
                t.o.push(o)
            }
            else
            {
                l = last(t.o)
                makeObject(t)
                t.o[l] = o
            }
        }
        else
        {
            t.o[t.l] = o
        }
        if ((v != null))
        {
            o[key(k)] = value(v)
        }
        else
        {
            o.push(value(k))
        }
        return o
    }
    addLine = function (d, k, v)
    {
        var t, undensed

        if ((k != null))
        {
            t = last(stack)
            undensed = t.undensed
            t.undensed = false
            if (d > t.d && !undensed)
            {
                return stack.push({o:indent(t,k,v),d:d})
            }
            else if (d < t.d)
            {
                if (isArray(t.o) && last(t.o) === '.')
                {
                    t.o.pop()
                    t.o.push([])
                }
                while ((t != null ? t.d : undefined) > d)
                {
                    stack.pop()
                    t = last(stack)
                }
                return insert(t,k,v)
            }
            else
            {
                if (undensed)
                {
                    t.d = d
                }
                return insert(t,k,v)
            }
        }
    }
    inspect = function (l)
    {
        var p, d, k, escl, escr, v

        p = 0
        while (l[p] === ' ')
        {
            p += 1
        }
        if (!(l[p] != null))
        {
            return [0,null,null,false]
        }
        d = p
        k = ''
        if (l[p] === '#')
        {
            return [0,null,null,false]
        }
        escl = false
        escr = false
        if (l[p] === '|')
        {
            escl = true
            k += '|'
            p += 1
        }
        while ((l[p] != null))
        {
            if (l[p] === ' ' && l[p + 1] === ' ' && !escl)
            {
                break
            }
            k += l[p]
            p += 1
            if (escl && l[p - 1] === '|')
            {
                break
            }
        }
        if (!escl)
        {
            k = k.trimRight()
        }
        while (l[p] === ' ')
        {
            p += 1
        }
        v = ''
        if (l[p] === '|')
        {
            escr = true
            v += '|'
            p += 1
        }
        while ((l[p] != null))
        {
            v += l[p]
            p += 1
            if (escr && l[p - 1] === '|' && l.trimRight().length === p)
            {
                break
            }
        }
        if (l[p - 1] === ' ' && !escr)
        {
            if ((v != null))
            {
                v = v.trimRight()
            }
        }
        if (k === '')
        {
            k = null
        }
        if (v === '')
        {
            v = null
        }
        return [d,k,v,escl]
    }
    if (lines.length === 1)
    {
        if (0 < lines[0].indexOf(':: '))
        {
            lines = lines[0].split(':: ').map(function (l)
            {
                var p

                p = 0
                while (l[p] === ' ')
                {
                    p += 1
                }
                while ((l[p] != null) && (l[p] !== ' '))
                {
                    p += 1
                }
                if (l[p] === ' ')
                {
                    return l.slice(0,p) + ' ' + l.slice(p)
                }
                else
                {
                    return l
                }
            })
        }
        p = lines[0].indexOf(' . ')
        e = lines[0].indexOf('|')
        if (p > 0 && (p === lines[0].indexOf(' ')) && (e < 0 || p < e))
        {
            lines = [lines[0].slice(0,p) + ' ' + lines[0].slice(p)]
        }
    }
    i = 0
    while (i < lines.length)
    {
        line = lines[i]
        var _321_18_ = inspect(line) ; d = _321_18_[0]        ; k = _321_18_[1]        ; v = _321_18_[2]        ; e = _321_18_[3]

        if ((k != null))
        {
            if ((v != null) && (!e) && (v.substr(0,2) === '. '))
            {
                addLine(d,k)
                ud = last(stack).d
                var list = _k_.list(undense(d,v))
                for (var _329_22_ = 0; _329_22_ < list.length; _329_22_++)
                {
                    e = list[_329_22_]
                    var _330_31_ = inspect(e) ; dd = _330_31_[0]                    ; dk = _330_31_[1]                    ; dv = _330_31_[2]

                    addLine(dd,dk,dv)
                }
                while (last(stack).d > ud + 1)
                {
                    stack.pop()
                }
                last(stack).undensed = true
            }
            else
            {
                oi = i
                lineFail = function ()
                {
                    if (i >= lines.length)
                    {
                        console.error(`unmatched multiline string in line ${oi + 1}`)
                        return 1
                    }
                }
                if (k === '...' && !(v != null))
                {
                    i += 1
                    vl = []
                    if (lineFail())
                    {
                        return
                    }
                    while (lines[i].trimLeft().substr(0,3) !== '...')
                    {
                        l = lines[i].trim()
                        if (l[0] === '|')
                        {
                            l = l.substr(1)
                        }
                        if (l[l.length - 1] === '|')
                        {
                            l = l.substr(0,l.length - 1)
                        }
                        vl.push(l)
                        i += 1
                        if (lineFail())
                        {
                            return
                        }
                    }
                    k = vl.join('\n')
                    r = lines[i].trimLeft().substr(3).trim()
                    if (r.length)
                    {
                        v = r
                    }
                }
                if (v === '...')
                {
                    i += 1
                    if (lineFail())
                    {
                        return
                    }
                    vl = []
                    while (lines[i].trim() !== '...')
                    {
                        l = lines[i].trim()
                        if (l[0] === '|')
                        {
                            l = l.substr(1)
                        }
                        if (l[l.length - 1] === '|')
                        {
                            l = l.substr(0,l.length - 1)
                        }
                        vl.push(l)
                        i += 1
                        if (lineFail())
                        {
                            return
                        }
                    }
                    v = vl.join('\n')
                }
                addLine(d,k,v)
            }
        }
        i += 1
    }
    return stack[0].o
}
module.exports = parse