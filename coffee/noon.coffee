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
str     = require './tools/str'
log     = require './tools/log'
profile = require './tools/profile'
parse   = require './parse'

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
    
load = (p) ->
    profile "load"
    log chalk.yellow.bold p
    r = parse fs.readFileSync p, encoding: 'utf8'
    log JSON.stringify r, null, '   '
    r

if args.file
    load args.file

module.exports = 
    parse:     parse
    stringify: stringify
    load:      load
