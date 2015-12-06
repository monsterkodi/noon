###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000   
###

profile = require './tools/profile'

stringify = (obj, indent='    ') ->
    profile 'json'
    s = JSON.stringify obj    
    profile "noon"

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
                s += (ind+k+indent+toStr(o[k],ind+indent,visited) for k in Object.getOwnPropertyNames(o) ).join '\n'
            return s+"\n"
        else
            return String o # plain values
        return "<???>"

    s = toStr obj
    
    profile ''
    s

module.exports = stringify
