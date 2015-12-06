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
        output:    { abbr: 'o',  default: '.noon', help: "output file or filetype"}
        sort:      { abbr: 's',  flag: true,  help: "sort keys alphabetically" }
        indent:    { abbr: 'i',  default: 4,  help: "indentation length" }
        align:     { abbr: 'a',  default: true, toggle: true,  help: "align values" }
        maxalign:  { abbr: 'm',  default: 32, help: "max align width, 0: no limit" }
        colors:    { abbr: 'c',  default: true, toggle: true,  help: "output with ansi colors" }
        version:   { abbr: 'V',  flag: true,  help: "show version", hidden: true }
       .help chalk.blue("supported file types:\n   ") + sds.extnames.join '\n   '
    .parse()

clog = console.log
err = (msg) ->
    clog chalk.red("\n"+msg+"\n")
    process.exit()

if args.version 
    clog require("#{__dirname}/../package.json").version
    process.exit()
    
if args.file
    ext = path.extname(args.file)
    if ext in sds.extnames

        o = sds.load args.file

        if args.output in sds.extnames
            if args.output == '.noon'
                s = stringify o,
                    align: args.align
                    indent: Math.max 1, args.indent
                    maxalign: Math.max 0, args.maxalign
                    colors: args.colors
                    sort: args.sort
            else
                s = sds.stringify o, 
                    ext: args.output
            clog s
        else
            sds.save args.output, o
    else
        err "unknown file type: #{chalk.yellow.bold(ext)}. known types: #{chalk.white.bold(sds.extnames.join(', '))}"
