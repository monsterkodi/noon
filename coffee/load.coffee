###
000       0000000    0000000   0000000  
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000  
###

fs    = require 'fs'
parse = require './parse'

load = (p) ->
    
    str = fs.readFileSync p, 'utf8'
    if str.length <= 0
        return null 
    parse str

module.exports = load
