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
isFunc = require 'lodash.isfunction'

err  = (msg) -> console.log ("\n"+msg+"\n").red

parseStr = (str, p, ext) ->
    
    if str.length <= 0
        return null
        
    extname = ext ? path.extname p
    switch extname
        when '.json' then JSON.parse str
        when '.yml', '.yaml' then require('js-yaml').load str
        else
            require('./parse') str

load = (p, ext, cb) ->
    
    cb = ext if isFunc ext
    
    if isFunc cb
        
        fs.readFile p, 'utf8', (e, str) ->
            if e?
                err "error reading file: #{p.yellow.bold}", e
                cb null
            else
                cb parseStr str, p, ext
        
    else
        str = fs.readFileSync p, 'utf8'
    
        parseStr str, p, ext
    
module.exports = load
