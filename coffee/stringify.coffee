###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000   
###

_       = require 'lodash'
profile = require './tools/profile'

stringify = (obj, indent='    ') ->

    profile "noon"
    
    pretty = (o, ind, visited) ->
        # (ind+k+indent+toStr(o[k],ind+indent,visited) for k in Object.getOwnPropertyNames(o) ).join '\n'
        maxKey = 0
        for k in Object.getOwnPropertyNames o
            maxKey = Math.max maxKey, k.length
        maxKey += indent.length
        l = []
        for k in Object.getOwnPropertyNames o
            l.push ind + _.padRight(k, maxKey) + toStr(o[k],_.padRight(ind+indent,maxKey),visited)
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
            if o in visited
                return "<v>"
            s = '\n'
            visited.push o
            if o.constructor.name == 'Array'
                s += (ind+toStr(v,ind+indent,visited) for v in o).join '\n'
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
