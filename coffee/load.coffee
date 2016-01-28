###
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000  
###

fs     = require 'fs'
colors = require 'colors'
path   = require 'path'

err  = (msg) -> console.log ("\n"+msg+"\n").red

load = (p) ->
    
    extname = path.extname p
    if extname == '.plist'
        require('simple-plist').readFileSync p
    else
        str = fs.readFileSync p, 'utf8'
        if str.length <= 0
            err "empty file: #{p.yellow.bold}"
            return null
            
        switch extname
            when '.json' then JSON.parse str
            when '.cson' then require('cson').parse str
            when '.yml', '.yaml' then require('js-yaml').load str
            else
                require('./parse') str

module.exports = load
