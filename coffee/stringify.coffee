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

stringify = (obj, options=defaults) ->

    # profile "noon"
    
    indstr = _.padRight ' ', options.indent
    indval = _.padRight ' ', Math.max 2, options.indent
    
    pretty = (o, ind, visited) ->
        
        if options.align        
            maxKey = 0
            for own k,v of o
                maxKey = Math.max maxKey, k.length
                if options.maxalign and maxKey > options.maxalign
                    maxKey = options.maxalign
                    break
        l = []
        
        keyValue = (k,v) ->
            s = ind
            if options.align
                ks = _.padRight k, maxKey
                i  = _.padRight ind+indstr,maxKey+options.indent
            else
                ks = k
                i  = ind+indstr
            s += options.colors and chalk.gray(ks) or ks
            s += indval
            s += toStr v, i, visited

        if options.sort
            for k in _.keys(o).sort()
                l.push keyValue k, o[k]
        else
            for own k,v of o
                l.push keyValue k, v
            
        l.join '\n'

    toStr = (o, ind='', visited=[]) ->
        if not o? 
            if o == null
                return ""
            if o == undefined
                return ""
            return options.colors and chalk.red("<?>") or "<?>"
        t = typeof o
        if t == 'string'
            return o
        else if t == 'object'
            
            if options.circular
                if o in visited
                    return options.colors and chalk.red("<v>") or "<v>"
                visited.push o
            if o.constructor.name == 'Array'
                s = '\n'
                s += (ind+toStr(v,ind+indstr,visited) for v in o).join '\n'
            else
                s = '\n'
                s += pretty o, ind, visited
            return s
        else
            return String o # plain values
        return options.colors and chalk.bold.yellow("<???>") or "<???>"

    s = toStr obj
    # profile ''
    s

module.exports = stringify
