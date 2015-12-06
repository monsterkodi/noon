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
        sort:      { abbr: 's',  flag: true,  help: "sort keys alphabetically" }
        indent:    { abbr: 'i',  default: 4,  help: "indentation length, default:" }
        maxalign:  { abbr: 'm',  default: 32, help: "max align width, 0: no limit, default:" }
        unaligned: { abbr: 'u',  flag: true,  help: "don't align values" }
        colorless: { abbr: 'c',  flag: true,  help: "don't output with ansi colors" }
        version:   { abbr: 'V',  flag: true,  help: "show version", hidden: true }
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
    if path.extname(args.file) in sds.extnames

        o = sds.load args.file
        s = stringify o,
            align: not args.unaligned
            indent: Math.max 1, args.indent
            maxalign: Math.max 0, args.maxalign
            colors: not args.colorless
            sort: args.sort

        console.log s
    else
        load args.file
