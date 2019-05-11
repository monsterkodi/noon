###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000   
###


defaults =
    ext:      '.noon' # output format
    indent:   4       # number of spaces per indent level
    align:    true    # vertically align object values
    maxalign: 32      # maximal number of spaces when aligning
    sort:     false   # sort object keys alphabetically
    circular: false   # check for circular references (expensive!)
    null:     false   # output null dictionary values
    colors:   false   # colorize output with ansi colors
                      # true for default colors or custom dictionary
    
regs = 
    url:    new RegExp '^(https?|git|file)(://)(\\S+)$'
    path:   new RegExp '^([\\.\\/\\S]+)(\\/\\S+)$'
    semver: new RegExp '\\d+\\.\\d+\\.\\d+'
        
stringify = (obj, options={}) ->

    padRight = (s, l) -> 
        while s.length < l
            s += ' '
        s

    def = (o,d) ->
        r = {}
        for k,v of o
            r[k] = v
        for k,v of d
            r[k] = v if not r[k]?
        r

    opt = def options, defaults
    
    switch opt.ext
        when '.json'         then return JSON.stringify obj, null, opt.indent
        when '.yml', '.yaml' then return require('js-yaml').dump obj
    
    if typeof opt.indent == 'string' 
        opt.indent = opt.indent.length
    indstr = padRight '', opt.indent
    
    ###
     0000000   0000000   000       0000000   00000000    0000000
    000       000   000  000      000   000  000   000  000     
    000       000   000  000      000   000  0000000    0000000 
    000       000   000  000      000   000  000   000       000
     0000000   0000000   0000000   0000000   000   000  0000000 
    ###
    
    if opt.colors == false or opt.colors == 0
        noop = (s) -> s
        colors = 
            url:     noop
            key:     noop
            null:    noop
            true:    noop
            false:   noop
            path:    noop
            value:   noop
            string:  noop
            semver:  noop
            number:  noop
            visited: noop
            special: noop
    else
        colors  = require 'colors'
        defaultColors =
            url:     colors.yellow
            key:     colors.gray
            null:    colors.blue
            true:    colors.blue.bold
            false:   colors.gray.dim
            path:    colors.green
            value:   colors.white
            string:  colors.white.bold
            semver:  colors.red
            number:  colors.magenta
            visited: colors.red
            dim:     '^>=.:/-'
        if opt.colors == true
            colors = defaultColors
        else
            colors = def opt.colors, defaultColors

    ###
    00000000   0000000   0000000   0000000   00000000   00000000
    000       000       000       000   000  000   000  000     
    0000000   0000000   000       000000000  00000000   0000000 
    000            000  000       000   000  000        000     
    00000000  0000000    0000000  000   000  000        00000000
    ###

    escape = (k, arry) ->
        if 0 <= k.indexOf '\n'
            sp = k.split '\n'
            es = sp.map (s) -> escape(s, arry)
            es.unshift '...'
            es.push '...'
            return es.join '\n'
        if k == '' or k == '...' or k[0] in [' ', '#', '|'] or k[k.length-1] in [' ', '#', '|'] 
            k = '|' + k + '|'
        else if arry and /\ \ /.test k
            k = '|' + k + '|'
        k

    ###
    0000000    00000000   0000000   000   000  000000000  000  00000000  000   000
    000   000  000       000   000  000   000     000     000  000        000 000 
    0000000    0000000   000000000  000   000     000     000  000000      00000  
    000   000  000       000   000  000   000     000     000  000          000   
    0000000    00000000  000   000   0000000      000     000  000          000   
    ###
    
    beautify = (s) -> 
        if colors.dim?
            for c in colors.dim
                s = s.replace new RegExp("\\#{c}", 'g'), c.dim
        s
    
    ###
    00000000   00000000   00000000  000000000  000000000  000   000
    000   000  000   000  000          000        000      000 000 
    00000000   0000000    0000000      000        000       00000  
    000        000   000  000          000        000        000   
    000        000   000  00000000     000        000        000   
    ###
    
    pretty = (o, ind, visited) ->
        
        if opt.align        
            maxKey = opt.indent
            if Object.keys(o).length > 1
                for own k,v of o
                    kl = parseInt(Math.ceil((k.length+2)/opt.indent)*opt.indent)
                    maxKey = Math.max maxKey, kl
                    if opt.maxalign and (maxKey > opt.maxalign)
                        maxKey = opt.maxalign
                        break
        l = []
        
        keyValue = (k,v) ->
            s = ind
            k = escape k, true
            if k.indexOf('  ') > 0 and k[0] != '|'
                k = "|#{k}|"
            else if k[0] != '|' and k[k.length-1] == '|'
                k = '|' + k
            else if k[0] == '|' and k[k.length-1] != '|'
                k += '|'
            
            if opt.align
                ks = padRight k, Math.max maxKey, k.length+2
                i  = padRight ind+indstr, maxKey
            else
                ks = padRight k, k.length+2
                i  = ind+indstr
            s += colors.key opt.colors != false and s.length == 0 and ks.bold or ks
            vs = toStr v, i, false, visited
            if vs[0] == '\n'
                while s[s.length-1] == ' '
                    s = s.substr 0, s.length-1                
            s += vs
            while s[s.length-1] == ' '
                s = s.substr 0, s.length-1
            s

        if opt.sort
            for k in Object.keys(o).sort()
                l.push keyValue k, o[k]
        else
            for own k,v of o
                l.push keyValue k, v
            
        l.join '\n'

    ###
    000000000   0000000    0000000  000000000  00000000 
       000     000   000  000          000     000   000
       000     000   000  0000000      000     0000000  
       000     000   000       000     000     000   000
       000      0000000   0000000      000     000   000
    ###
    
    toStr = (o, ind='', arry=false, visited=[]) ->
        if not o? 
            if o == null
                return opt.null or arry and colors.null("null") or ''
            if o == undefined
                return colors.null "undefined"
            return colors.null '<?>'
        t = typeof o
        if t == 'string' 
            if opt.colors != false
                for rc in Object.keys regs
                    if colors[rc]? and regs[rc].test o
                        return  colors[rc] beautify escape o, arry
                
            return colors.string escape o, arry
        else if t == 'object'
            if opt.circular
                if o in visited
                    return colors.visited '<v>'
                visited.push o
                
            if o.constructor?.name == 'Array'
                s = ind!='' and arry and '.' or ''
                s += '\n' if o.length and ind!=''
                s += (ind+toStr(v,ind+indstr,true,visited) for v in o).join '\n'
            else if o.constructor?.name == 'RegExp'
                return colors.semver o.source
            else
                s = (arry and '.\n') or ((ind != '') and '\n' or '')
                s += pretty o, ind, visited
            return s
        else if t == 'number'
            return colors.number String o
        else if t == 'boolean'
            return (o and colors.true or colors.false) String o
        else
            return colors.value String o # plain values
        return colors.null '<???>'

    s = toStr obj
    s

module.exports = stringify
