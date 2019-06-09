###
000   000   0000000    0000000   000   000
0000  000  000   000  000   000  0000  000
000 0 000  000   000  000   000  000 0 000
000  0000  000   000  000   000  000  0000
000   000   0000000    0000000   000   000
###

fs        = require 'fs'
path      = require 'path'
pad       = require 'lodash.pad'
stringify = require './stringify'
parse     = require './parse'
load      = require './load'
save      = require './save'
noon      = require './main'

#  0000000   00000000    0000000    0000000
# 000   000  000   000  000        000     
# 000000000  0000000    000  0000  0000000 
# 000   000  000   000  000   000       000
# 000   000  000   000   0000000   0000000 

args = require('karg') """
noon
    file        . ? the file to convert             . * . = package.json
    output      . ? output file or filetype         . = noon
    indent      . ? indentation length              . = 4
    align       . ? align values                    . = true
    maxalign    . ? max align width, 0: no limit    . = 32
    sort        . ? sort keys alphabetically        . = false
    colors      . ? output with ansi colors         . = true
    type        . ? input filetype
    
supported filetypes:
    #{noon.extnames.join '\n    '}

version   #{require("#{__dirname}/../package.json").version}
"""

err = (msg) ->
    log ("\n"+msg+"\n").red
    process.exit()

if args.file

    ext = path.extname args.file

    try
        d = load args.file, args.type
    catch e
        err e.stack

    if args.output in noon.extensions
        args.output = '.'+args.output
        
    if args.output in noon.extnames
        if args.output == '.noon'
            o= 
                align:      args.align
                indent:     Math.max 1, args.indent
                maxalign:   Math.max 0, args.maxalign
                colors:     args.colors
                sort:       args.sort
        else
            o = 
                ext:        args.output
                colors:     args.colors
                indent:     pad '', args.indent
        log stringify d, o
    else
        if path.extname(args.output) == '.noon'
            o = 
                align:      args.align
                indent:     Math.max 1, args.indent
                maxalign:   Math.max 0, args.maxalign
                colors:     false
                sort:       args.sort
        else
            o = 
                indent:     pad '', args.indent
        save args.output, d, o 
