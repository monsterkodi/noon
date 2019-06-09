###
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000  
###

parseStr = (str, p, ext) ->
    
    if str.length <= 0
        return null
        
    extname = ext ? require('path').extname p
    switch extname
        when '.json' then JSON.parse str
        when '.yml', '.yaml' then require('js-yaml').load str
        else
            require('./parse') str

load = (p, ext, cb) ->

    fs = require 'fs'
    
    cb = ext if 'function' == typeof ext
    
    if 'function' == typeof cb
        
        fs.readFile p, 'utf8', (e, str) ->
            if e?
                error "error reading file: #{p}", e
                cb null
            else
                cb parseStr str, p, ext
    else
        str = fs.readFileSync p, 'utf8'
    
        parseStr str, p, ext
    
module.exports = load
