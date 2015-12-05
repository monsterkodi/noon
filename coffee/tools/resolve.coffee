###
00000000   00000000   0000000   0000000   000      000   000  00000000
000   000  000       000       000   000  000      000   000  000     
0000000    0000000   0000000   000   000  000       000 000   0000000 
000   000  000            000  000   000  000         000     000     
000   000  00000000  0000000    0000000   0000000      0      00000000
###

path    = require 'path'
process = require 'process'

module.exports = (unresolved) ->
    p = unresolved.replace /\~/, process.env.HOME
    p = path.resolve p
    p = path.normalize p
    p
