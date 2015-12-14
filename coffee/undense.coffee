###
000   000  000   000  0000000    00000000  000   000   0000000  00000000
000   000  0000  000  000   000  000       0000  000  000       000     
000   000  000 0 000  000   000  0000000   000 0 000  0000000   0000000 
000   000  000  0000  000   000  000       000  0000       000  000     
 0000000   000   000  0000000    00000000  000   000  0000000   00000000
###

_ = require 'lodash'

undense = (d, s) ->
    sl = s.length
    sd = d

    p = 0
    while p < sl and s[p] == '.' # depth dots
        d += 1
        p += 1
    
    while p < sl and s[p] == ' ' # spaces before key/item
        p += 1
    
    l = ''
    while p < sl and not (s[p] == '.' and p < sl+1 and (s[p+1] in ['.', ' '])) # add to line until first dotdot or dotspace
        l += s[p]
        p += 1
        
    ld = _.pad('', d)+l # pad line with spaces

    if p < sl
        t = undense sd, s.substring p
        t.unshift ld
        t
    else
        [ld]

module.exports = undense
