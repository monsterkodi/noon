###
000   000   0000000    0000000   000   000
0000  000  000   000  000   000  0000  000
000 0 000  000   000  000   000  000 0 000
000  0000  000   000  000   000  000  0000
000   000   0000000    0000000   000   000
###

fs      = require 'fs'
chalk   = require 'chalk'
_       = require 'lodash'
log     = require './tools/log'
profile = require './tools/profile'

###
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000 
###

args = require "nomnom"
    .script "noon"
    .options
        file:
            position: 0
            help: "the file to convert"
            list: false
        version:{ abbr: 'V', flag: true, help: "show version", hidden: true }
    .parse()

if args.version 
    console.log require("#{__dirname}/../package.json").version
    process.exit()

###
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
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

parse = (s) ->
    log chalk.yellow.bold '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
    profile 'split'
    lines = s.split '\n'
    profile 'traverse'
    stack = [
        o: []
        d: 0
        k: null
    ]
    
    insert = (t, k, v) ->
        if _.isArray t.o
            if not v?
                t.o.push k
            else
                log 'root array -> object'
                o = {}
                for i in t.o
                    o[i] = null
                stack['o'] = o
                t.o = o
                o[k] = v
        else
            t.o[k] = v
            t.l = k

    indent = (t, k, v) ->
        o = {}
        if _.isArray t.o
            l = t.o.pop()
            if v?
                o[l] = {}
                o[l][k] = v
            else
                o[l] = [k]
            t.o.push o
        else
            o[k] = v
            t.o[t.l] = o
        o
    
    for line in lines
        [d,k,v] = inspect line 
        if k?
            top = _.last stack
            if d > top.d
                dbg 'indent', k, v, stack
                stack.push
                    o: indent top, k, v
                    d: d
                    k: k
                    l: k
            else if d < top.d
                dbg 'outdent', k, d
                while top.d > d
                    dbg 'pop', top
                    stack.pop()
                    top = _.last stack
                dbg 'outden ', k, v, top
                insert top, k, v
                dbg 'outde2 ', k, v, stack
            else
                insert top, k, v
            
            dbg '----', stack[0].o
            
    profile "log"
    dbg stack.length
    log chalk.green("#{lines.length} lines\n") #+ s
    profile ""
    log (require 'performance-now')()

###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000   
###

stringify = (o) ->
    profile 'stringify'    
    profile ""
    
###
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000  
###
    
load = (p) -> parse fs.readFileSync p, encoding: 'utf8'

if args.file
    load args.file

module.exports = 
    parse:     parse
    stringify: stringify
    load:      load
