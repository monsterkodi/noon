###
 0000000  000000000  00000000 
000          000     000   000
0000000      000     0000000  
     000     000     000   000
0000000      000     000   000
###

_ = require 'lodash'
strIndent = "    "

str = (o,indent="",visited=[]) ->
    if not o? 
        if o == null
            return "<null>"
        if o == undefined
            return "<undefined>"
        return "<0>"
    t = typeof o
    if t == 'string'
        return o
    else if t == 'object'
        if o in visited
            if o.id? and typeof o.id == 'string' and o.localName? then return "<" + o.localName + "#" + o.id + ">"
            return "<visited>"
        protoname = o.constructor.name
        if not protoname? or protoname == ""
            if o.id? and typeof o.id == 'string' and o.localName?
                protoname = o.localName + "#"+o.id
            else
                protoname = "object"

        if protoname == 'Array'
            s = '[\n'
            visited.push o
            s += (indent+strIndent + str(v,indent+strIndent,visited) for v in o).join("\n")
            s += '\n'+indent+strIndent+']'
        else
            if o._str?
                return o._str()
            else
                s = "<" + protoname + ">\n"
                visited.push o
                s += ( indent+strIndent+k + ": " + str(o[k],indent+strIndent,visited) for k in Object.getOwnPropertyNames(o) when not _.isFunction o[k] ).join("\n")
        return s+"\n"
    else if t == 'function'
        return "->"
    else
        return String(o) # plain values
    return "<???>"

module.exports = str
