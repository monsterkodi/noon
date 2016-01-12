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
colors    = require 'colors'
_         = require 'lodash'
profile   = require './tools/profile'
stringify = require './stringify'
parse     = require './parse'
save      = require './save'
log       = console.log

###
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000 
###

args = require('karg') """
noon
    file        . ? the file to convert             . * . = package.json
    output      . ? output file or filetype         . = .noon
    indent      . ? indentation length              . = 4
    align       . ? align values                    . = true
    maxalign    . ? max align width, 0: no limit    . = 32
    sort        . ? sort keys alphabetically        . = false
    colors      . ? output with ansi colors         . = true
    
supported filetypes:
    #{sds.extnames.join '\n    '}

version   #{require("#{__dirname}/../package.json").version}
"""

err = (msg) ->
    log ("\n"+msg+"\n").red
    process.exit()

if args.file

    ext = path.extname args.file
    if ext == '.noon' or ext not in sds.extnames
        o = parse fs.readFileSync args.file, 'utf8'
    else
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
                indent: _.pad '', args.indent
        log s
    else
        if path.extname(args.output) == '.noon'
            save args.output, o,
                align: args.align
                indent: Math.max 1, args.indent
                maxalign: Math.max 0, args.maxalign
                colors: false
                sort: args.sort
        else
            sds.save args.output, o, indent: _.pad '', args.indent
