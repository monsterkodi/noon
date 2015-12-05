###
000  000   000   0000000  00000000   00000000   0000000  000000000
000  0000  000  000       000   000  000       000          000   
000  000 0 000  0000000   00000000   0000000   000          000   
000  000  0000       000  000        000       000          000   
000  000   000  0000000   000        00000000   0000000     000   
###

inspect = (l) ->    
    p = 0
    
    while l[p] == ' ' # preceeding spaces
        p += 1
    depth = p

    key = ''
    while l[p]?
        if l[p] == ' ' and l[p+1] == ' '
            break
        key += l[p]
        p += 1
    
    while l[p] == ' ' # whitespace between key and value
        p += 1

    value = ''
    while l[p]?
        value += l[p]
        p += 1

    if l[p-1] == ' '
        if value
            value = value.trimRight()
        else
            key = key.trimRight()
        
    key   = null if key == ''
    value = null if value == ''
    [depth, key, value]

module.exports = inspect
