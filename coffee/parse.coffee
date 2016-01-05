###
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
###

parse = (s) ->
    
    last = (a) -> a?[a.length-1]
    isArray = (a) -> a? and typeof(a) == 'object' and a.constructor.name == 'Array'
    
    ###
    000   000  000   000  0000000    00000000  000   000   0000000  00000000
    000   000  0000  000  000   000  000       0000  000  000       000     
    000   000  000 0 000  000   000  0000000   000 0 000  0000000   0000000 
    000   000  000  0000  000   000  000       000  0000       000  000     
     0000000   000   000  0000000    00000000  000   000  0000000   00000000
    ###

    undense = (d, s) -> # undenses string s at depth d. returns list of padded lines
        sl = s.length
        sd = d

        p = 0
        while p < sl and s[p] == '.' # depth dots
            d += 1
            p += 1
        
        while p < sl and s[p] == ' ' # spaces before key/item
            p += 1
        
        l = ''
        key = true
        while p < sl and not (s[p] == '.' and p < sl+1 and (s[p+1] in ['.', ' '])) # add to line until first dotdot or dotspace
            l += s[p]
            if key and s[p] == ' '
                if p < sl+1 and s[p+1] != ' '
                    l += ' '
                key = false
            p += 1
            
        ld = '' # pad line with spaces
        for i in [0...d]
            ld += ' '
        ld += l 

        if p < sl
            t = undense sd, s.substring p
            t.unshift ld
            t
        else
            [ld]
    
    ###
     0000000  00000000   000      000  000000000
    000       000   000  000      000     000   
    0000000   00000000   000      000     000   
         000  000        000      000     000   
    0000000   000        0000000  000     000   
    ###

    lines = s.split '\n'
    stack = [
        o: []
        d: 0
    ]
    
    ###
    00     00   0000000   000   000  00000000         0000000   0000000          000
    000   000  000   000  000  000   000             000   000  000   000        000
    000000000  000000000  0000000    0000000         000   000  0000000          000
    000 0 000  000   000  000  000   000             000   000  000   000  000   000
    000   000  000   000  000   000  00000000         0000000   0000000     0000000 
    ###
    makeObject = (t) ->
        o = {}
        for i in t.o
            o[i] = null
        t.l = last t.o
        t.o = o
        if stack.length > 1
            b = stack[stack.length-2]
            if isArray b.o
                b.o.pop()
                b.o.push o
            else
                b.o[b.l] = o
        o

    ###
    000   000  00000000  000   000
    000  000   000        000 000 
    0000000    0000000     00000  
    000  000   000          000   
    000   000  00000000     000   
    ###
    key = (k) ->
        if k?[0] == '|' 
            if k[k.length-1] == '|'
                return k.substr(1, k.length-2)
            return k.substr(1).trimRight()
        k
        
    ###
    000   000   0000000   000      000   000  00000000   0000000
    000   000  000   000  000      000   000  000       000     
     000 000   000000000  000      000   000  0000000   0000000 
       000     000   000  000      000   000  000            000
        0      000   000  0000000   0000000   00000000  0000000 
    ###
    values = 
        'null': null
        'true': true
        'false': false

    value = (v) ->
        if values[v] != undefined  then return values[v]
        if v?[0] == '|' then return key v            
        else if v?[v.length-1] == '|'
            return v.substr(0, v.length-1)
        if /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(v) then return parseFloat v
        if /^(\-|\+)?([0-9]+|Infinity)$/.test(v)   then return parseInt   v
        v
        
    ###
    000  000   000   0000000  00000000  00000000   000000000
    000  0000  000  000       000       000   000     000   
    000  000 0 000  0000000   0000000   0000000       000   
    000  000  0000       000  000       000   000     000   
    000  000   000  0000000   00000000  000   000     000   
    ###
    insert = (t, k, v) ->
        if isArray t.o
            if not v?
                if last(t.o) == '.'
                    t.o.pop()
                    t.o.push []
                t.o.push value k
            else
                makeObject(t)[key k] = value v
        else
            t.o[key k] = value v
            t.l = key k

    ###
    000  000   000  0000000    00000000  000   000  000000000
    000  0000  000  000   000  000       0000  000     000   
    000  000 0 000  000   000  0000000   000 0 000     000   
    000  000  0000  000   000  000       000  0000     000   
    000  000   000  0000000    00000000  000   000     000   
    ###
    indent = (t, k, v) ->
        o = []
        o = {} if v?
        
        if isArray t.o
            if last(t.o) == '.'
                t.o.pop()
                t.o.push o
            else
                l = last t.o
                makeObject(t)
                t.o[l] = o                
        else
            t.o[t.l] = o
            
        if v?
            o[key k] = value v
        else
            o.push value k
        o
    
    ###
     0000000   0000000    0000000    000      000  000   000  00000000
    000   000  000   000  000   000  000      000  0000  000  000     
    000000000  000   000  000   000  000      000  000 0 000  0000000 
    000   000  000   000  000   000  000      000  000  0000  000     
    000   000  0000000    0000000    0000000  000  000   000  00000000
    ###
    addLine = (d,k,v) ->
        if k?
            t = last stack
            [undensed, t.undensed] = [t.undensed, false]            
            if d > t.d and not undensed
                stack.push
                    o: indent t, k, v
                    d: d
            else if d < t.d
                if isArray(t.o) and last(t.o) == '.'
                    t.o.pop()
                    t.o.push []
                while t.d > d
                    stack.pop()
                    t = last stack
                insert t, k, v
            else
                if undensed
                    t.d = d
                insert t, k, v
        
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
        d = p

        k = ''
        
        escl = false
        escr = false
        if l[p] == '|'
            escl = true
            k += '|'
            p += 1
        
        while l[p]?
            if l[p] == ' ' and l[p+1] == ' ' and not escl
                break
                
            k += l[p]
            p += 1
            if escl and l[p-1] == '|'
                break

        if not escl
            k = k.trimRight()
        
        while l[p] == ' ' # whitespace between key and value
            p += 1

        v = ''
        
        if l[p] == '|'
            escr = true
            v += '|'
            p += 1
        
        while l[p]?        
            v += l[p]
            p += 1
            if escr and l[p-1] == '|' and l.trimRight().length == p
                break

        if l[p-1] == ' ' and not escr
            v = v.trimRight() if v?
            
        k = null if k == ''
        v = null if v == ''
        [d, k, v, escl]
                   
    ###
    00000000   0000000    0000000  000   000        000      000  000   000  00000000
    000       000   000  000       000   000        000      000  0000  000  000     
    0000000   000000000  000       000000000        000      000  000 0 000  0000000 
    000       000   000  000       000   000        000      000  000  0000  000     
    00000000  000   000   0000000  000   000        0000000  000  000   000  00000000
    ###
    
    i = 0
    for line in lines

        [d, k, v, e] = inspect line

        if v? and (not e) and (v.startsWith '. ') # dense value
            addLine d, k

            ud = last(stack).d

            for e in undense d, v
                [dd,dk,dv] = inspect e 
                addLine dd, dk, dv

            while last(stack).d > ud+1
                stack.pop()
            last(stack).undensed = true
            
        else
            addLine d, k, v
        i += 1
                        
    stack[0].o

module.exports = parse
