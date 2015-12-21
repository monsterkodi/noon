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
    
    lit = false
    if l[p] == '|'
        lit = true
        key += '|'
        p += 1
    
    while l[p]?
        if l[p] == ' ' and l[p+1] == ' ' and not lit
            break
            
        key += l[p]
        p += 1
        if lit and l[p-1] == '|'
            break

    if lit
        lit = false    
    else
        key = key.trimRight()
    
    while l[p] == ' ' # whitespace between key and value
        p += 1

    value = ''
    
    if l[p] == '|'
        lit = true
        value += '|'
        p += 1
    
    while l[p]?        
        value += l[p]
        p += 1
        if lit and l[p-1] == '|' and l.trimRight().length == p
            break

    if l[p-1] == ' ' and not lit
        value = value.trimRight() if value?
        
    key   = null if key == ''
    value = null if value == ''
    [depth, key, value]

module.exports = inspect
