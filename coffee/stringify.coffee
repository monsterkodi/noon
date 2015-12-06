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

stringify = (obj, options={indent:4,align:true,maxalign:8,sort:false,circular:false}) ->

    profile "noon"
    
    indstr = _.padRight ' ', options.indent
    indval = _.padRight ' ', Math.max 2, options.indent
    
    pretty = (o, ind, visited) ->
        
        if options.align        
            maxKey = 0
            for own k, v of o
                maxKey = Math.max maxKey, k.length
                if maxKey > options.maxalign
                    maxKey = options.maxalign
                    break
            l = []
            for own k, v of o    
                s = ind
                s += _.padRight k, maxKey
                s += indval
                s += toStr o[k], _.padRight(ind+indstr,maxKey+options.indent), visited
                l.push s
            l.join '\n'
        else
            (ind+k+indstr+toStr(o[k],ind+indstr,visited) for own k,v of o).join '\n'

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
            s = '\n'
            if options.circular
                if o in visited
                    return "<v>"
                visited.push o
            if o.constructor.name == 'Array'
                s += (ind+toStr(v,ind+indstr,visited) for v in o).join '\n'
            else
                s += pretty o, ind, visited
            return s+"\n"
        else
            return String o # plain values
        return "<???>"

    s = toStr obj
    
    profile ''
    s

module.exports = stringify
