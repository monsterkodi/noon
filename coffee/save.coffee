###
 0000000   0000000   000   000  00000000
000       000   000  000   000  000     
0000000   000000000   000 000   0000000 
     000  000   000     000     000     
0000000   000   000      0      00000000
###

fs    = require 'fs'
path  = require 'path'
_     = require 'lodash'
toStr = require './stringify'

save = (p, data, opt={}) ->
    
    fs.writeFileSync p, toStr data, _.defaults ext: path.extname(p), opt

module.exports = save
