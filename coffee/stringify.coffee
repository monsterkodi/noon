###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000   
###

_       = require 'lodash'
chalk   = require 'chalk'
profile = require './tools/profile'
log     = require './tools/log'

defaults =
    indent:   4      # number of spaces per indent level
    align:    true   # vertically align object values
    maxalign: 32     # maximal number of spaces when aligning
    sort:     false  # sort object keys alphabetically
    circular: false  # check for circular references (expensive!)
    colors:   false  # colorize output with ansi colors

stringify = (obj, options={}) ->

    opt = _.assign defaults, options
    # profile "noon"
    
    indstr = _.padRight ' ', opt.indent
    indval = _.padRight ' ', Math.max 2, opt.indent
    
    pretty = (o, ind, visited) ->
        
        if opt.align        
            maxKey = 0
            for own k,v of o
                maxKey = Math.max maxKey, k.length
                if opt.maxalign and maxKey > opt.maxalign
                    maxKey = opt.maxalign
                    break
        l = []
        
        keyValue = (k,v) ->
            s = ind
            if opt.align
                ks = _.padRight k, maxKey
                i  = _.padRight ind+indstr,maxKey+opt.indent
            else
                ks = k
                i  = ind+indstr
            s += opt.colors and chalk.gray(ks) or ks
            s += indval
            s += toStr v, i, false, visited

        if opt.sort
            for k in _.keys(o).sort()
                l.push keyValue k, o[k]
        else
            for own k,v of o
                l.push keyValue k, v
            
        l.join '\n'

    toStr = (o, ind='', arry=false, visited=[]) ->
        if not o? 
            if o == null
                return ""
            if o == undefined
                return ""
            return opt.colors and chalk.red("<?>") or "<?>"
        t = typeof o
        if t == 'string' then return o
        else if t == 'object'
            
            if opt.circular
                if o in visited
                    return opt.colors and chalk.red("<v>") or "<v>"
                visited.push o
                
            if o.constructor.name == 'Array'
                s = ind!='' and arry and '.' or ''
                s += '\n' if o.length and ind!=''
                s += (ind+toStr(v,ind+indstr,true,visited) for v in o).join '\n'
            else
                s = arry and '.\n' or '\n'
                s += pretty o, ind, visited
            return s
        else
            return String o # plain values
        return opt.colors and chalk.bold.yellow("<???>") or "<???>"

    s = toStr obj
    # profile ''
    s

module.exports = stringify
