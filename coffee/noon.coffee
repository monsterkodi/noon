###
000   000   0000000    0000000   000   000
0000  000  000   000  000   000  0000  000
000 0 000  000   000  000   000  000 0 000
000  0000  000   000  000   000  000  0000
000   000   0000000    0000000   000   000
###

fs      = require 'fs'
chalk   = require 'chalk'
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
        value = value.trimRight()
        
    [depth, key, value]

parse = (s) ->
    profile 'split'
    lines = s.split '\n'
    profile 'traverse'
    stack = []
    for line in lines
        [d,key,value] = inspect line 
        dbg d, key, value
    profile "log"
    log chalk.green("#{lines.length} lines\n") + s
    profile ""

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
