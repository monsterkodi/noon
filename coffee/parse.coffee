###
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
###

chalk   = require 'chalk'
_       = require 'lodash'
str     = require './tools/str'
log     = require './tools/log'
profile = require './tools/profile'
inspect = require './inspect'
undense = require './undense'

parse = (s) ->
    
    lines = s.split '\n'
    # profile 'traverse'
    stack = [
        o: []
        d: 0
    ]
    
    makeObject = (t) ->
        o = {}
        for i in t.o
            o[i] = null
        t.l = _.last t.o
        t.o = o
        if stack.length > 1
            b = stack[stack.length-2]
            if _.isArray b.o
                b.o.pop()
                b.o.push o
            else
                b.o[b.l] = o
        o
    
    insert = (t, k, v) ->
        if _.isArray t.o
            if not v?
                if _.last(t.o) == '.'
                    t.o.pop()
                    t.o.push []
                t.o.push k
            else
                makeObject(t)[k] = v
        else
            t.o[k] = v
            t.l = k

    indent = (t, k, v) ->
        o = []
        o = {} if v?
        if _.isArray t.o
            if _.last(t.o) == '.'
                t.o.pop()
                t.o.push o
            else
                l = _.last t.o
                makeObject(t)
                t.o[l] = o                
        else
            t.o[t.l] = o
        if v?
            o[k] = v
        else
            o.push k
        o
    
    addLine = (d,k,v) ->
        if k?
            t = _.last stack
            [undensed, t.undensed] = [t.undensed, false]            
            if d > t.d and not undensed
                stack.push
                    o: indent t, k, v
                    d: d
            else if d < t.d
                if _.isArray(t.o) and _.last(t.o) == '.'
                    t.o.pop()
                    t.o.push []
                while t.d > d
                    stack.pop()
                    t = _.last stack
                insert t, k, v
            else
                if undensed
                    t.d = d
                insert t, k, v
                        
    i = 0
    for line in lines
        [d,k,v] = inspect line 

        if v? and v.startsWith '. ' # dense value
            addLine d, k

            ud = _.last(stack).d

            for e in undense d, v
                [dd,dk,dv] = inspect e 
                addLine dd, dk, dv

            while _.last(stack).d > ud+1
                stack.pop()
            _.last(stack).undensed = true
            
        else
            addLine d, k, v
        i += 1
                        
    # profile ""
    stack[0].o

module.exports = parse
