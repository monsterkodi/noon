###
 0000000   0000000   000   000  00000000
000       000   000  000   000  000     
0000000   000000000   000 000   0000000 
     000  000   000     000     000     
0000000   000   000      0      00000000
###

fs         = require 'fs'
path       = require 'path'
defaults   = require 'lodash.defaults'
isFunction = require 'lodash.isfunction'
stringify  = require './stringify'

save = (p, data, strOpt, cb) ->
    
    if isFunction strOpt
        cb = strOpt 
        strOpt = {}
    else
        strOpt ?= {}
    
    str = stringify data, defaults ext:path.extname(p), strOpt
        
    if isFunction cb
        
        fs.writeFile p, str, cb
        
    else
    
        fs.writeFileSync p, str

module.exports = save
