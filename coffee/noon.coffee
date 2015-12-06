###
000   000   0000000    0000000   000   000
0000  000  000   000  000   000  0000  000
000 0 000  000   000  000   000  000 0 000
000  0000  000   000  000   000  000  0000
000   000   0000000    0000000   000   000
###

fs        = require 'fs'
sds       = require 'sds'
path      = require 'path'
chalk     = require 'chalk'
_         = require 'lodash'
str       = require './tools/str'
log       = require './tools/log'
profile   = require './tools/profile'
stringify = require './stringify'
parse     = require './parse'

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
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000  
###
    
load = (p) ->
    log chalk.yellow.bold p
    profile "load"
    r = parse fs.readFileSync p, encoding: 'utf8'
    profile "log"
    log JSON.stringify r, null, '   '
    r

if args.file
    if path.extname(args.file) == '.json'
        console.log stringify sds.load args.file
    else
        load args.file
