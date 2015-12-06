###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000   
###

_       = require 'lodash'
log     = require './tools/log'
chalk   = require 'chalk'
profile = require './tools/profile'

stringify = (obj, options={indent:4,align:true,maxalign:32,sort:false,circular:false}) ->

    profile "noon"
    
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
                s += _.padRight k, maxKey
                i  = _.padRight ind+indstr,maxKey+options.indent
            else
                s += k
                i  = ind+indstr
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
            return "<?>"
        t = typeof o
        if t == 'string'
            return o
        else if t == 'object'
            
            if options.circular
                if o in visited
                    return "<v>"
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
        return "<???>"

    s = toStr obj
    
    profile ''
    s

module.exports = stringify
