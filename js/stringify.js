// monsterkodi/kode 0.223.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var defaults, pad, regs, stringify

defaults = {ext:'.noon',indent:4,align:true,maxalign:32,sort:false,circular:false,null:false,colors:false}
regs = {url:new RegExp('^(https?|git|file)(://)(\\S+)$'),path:new RegExp('^([\\.\\/\\S]+)(\\/\\S+)$'),semver:new RegExp('\\d+\\.\\d+\\.\\d+')}

pad = function (s, l)
{
    while (s.length < l)
    {
        s += ' '
    }
    return s
}

stringify = function (obj, options = {})
{
    var cs, def, escape, indstr, opt, pretty, s, toStr

    def = function (o, d)
    {
        var k, r, v

        r = {}
        for (k in o)
        {
            v = o[k]
            r[k] = v
        }
        for (k in d)
        {
            v = d[k]
            if (!(r[k] != null))
            {
                r[k] = v
            }
        }
        return r
    }
    opt = def(options,defaults)
    if (opt.ext === '.json')
    {
        cs = JSON.stringify(obj,null,opt.indent)
        if (opt.colors)
        {
            return require('klor').syntax({text:cs,ext:opt.ext})
        }
        else
        {
            return cs
        }
    }
    if (typeof(opt.indent) === 'string')
    {
        opt.indent = opt.indent.length
    }
    indstr = pad('',opt.indent)
    escape = function (k, arry)
    {
        var es, sp

        if (0 <= k.indexOf('\n'))
        {
            sp = k.split('\n')
            es = sp.map(function (s)
            {
                return escape(s,arry)
            })
            es.unshift('...')
            es.push('...')
            return es.join('\n')
        }
        if (k === '' || k === '...' || _k_.in(k[0],[' ','#','|']) || _k_.in(k[k.length - 1],[' ','#','|']))
        {
            k = '|' + k + '|'
        }
        else if (arry && /\s\s/.test(k))
        {
            k = '|' + k + '|'
        }
        return k
    }
    pretty = function (o, ind, visited)
    {
        var k, keyValue, kl, l, maxKey, v

        if (opt.align)
        {
            maxKey = opt.indent
            if (Object.keys(o).length > 1)
            {
                for (k in o)
                {
                    v = o[k]
                    if (o.hasOwnProperty(k))
                    {
                        kl = parseInt(Math.ceil((k.length + 2) / opt.indent) * opt.indent)
                        maxKey = Math.max(maxKey,kl)
                        if (opt.maxalign && (maxKey > opt.maxalign))
                        {
                            maxKey = opt.maxalign
                            break
                        }
                    }
                }
            }
        }
        l = []
        keyValue = function (k, v)
        {
            var i, ks, s, vs

            s = ind
            k = escape(k,true)
            if (k.indexOf('  ') > 0 && k[0] !== '|')
            {
                k = `|${k}|`
            }
            else if (k[0] !== '|' && k[k.length - 1] === '|')
            {
                k = '|' + k
            }
            else if (k[0] === '|' && k[k.length - 1] !== '|')
            {
                k += '|'
            }
            if (opt.align)
            {
                ks = pad(k,Math.max(maxKey,k.length + 2))
                i = pad(ind + indstr,maxKey)
            }
            else
            {
                ks = pad(k,k.length + 2)
                i = ind + indstr
            }
            s += ks
            vs = toStr(v,i,false,visited)
            if (vs[0] === '\n')
            {
                while (s[s.length - 1] === ' ')
                {
                    s = s.substr(0,s.length - 1)
                }
            }
            s += vs
            while (s[s.length - 1] === ' ')
            {
                s = s.substr(0,s.length - 1)
            }
            return s
        }
        if (opt.sort)
        {
            var list = _k_.list(Object.keys(o).sort())
            for (var _126_18_ = 0; _126_18_ < list.length; _126_18_++)
            {
                k = list[_126_18_]
                l.push(keyValue(k,o[k]))
            }
        }
        else
        {
            for (k in o)
            {
                v = o[k]
                if (o.hasOwnProperty(k))
                {
                    l.push(keyValue(k,v))
                }
            }
        }
        return l.join('\n')
    }
    toStr = function (o, ind = '', arry = false, visited = [])
    {
        var s, t, v, _161_32_, _165_37_

        if (!(o != null))
        {
            if (o === null)
            {
                return opt.null || arry && "null" || ''
            }
            if (o === undefined)
            {
                return "undefined"
            }
            return '<?>'
        }
        switch (t = typeof(o))
        {
            case 'string':
                return escape(o,arry)

            case 'object':
                if (opt.circular)
                {
                    if (_k_.in(o,visited))
                    {
                        return '<v>'
                    }
                    visited.push(o)
                }
                if ((o.constructor != null ? o.constructor.name : undefined) === 'Array')
                {
                    s = ind !== '' && arry && '.' || ''
                    if (o.length && ind !== '')
                    {
                        s += '\n'
                    }
                    s += (function () { var _164__69_ = []; var list = _k_.list(o); for (var _164_69_ = 0; _164_69_ < list.length; _164_69_++)  { v = list[_164_69_];_164__69_.push(ind + toStr(v,ind + indstr,true,visited))  } return _164__69_ }).bind(this)().join('\n')
                }
                else if ((o.constructor != null ? o.constructor.name : undefined) === 'RegExp')
                {
                    return o.source
                }
                else
                {
                    s = (arry && '.\n') || ((ind !== '') && '\n' || '')
                    s += pretty(o,ind,visited)
                }
                return s

            default:
                return String(o)
        }

        return '<???>'
    }
    s = toStr(obj)
    if (opt.colors)
    {
        s = require('klor').syntax({text:s,ext:'noon'})
    }
    return s
}
module.exports = stringify