###
 0000000   0000000   000   000  00000000
000       000   000  000   000  000
0000000   000000000   000 000   0000000
     000  000   000     000     000
0000000   000   000      0      00000000
###

save = (p, data, strOpt, cb) ->

    fs         = require 'fs'
    path       = require 'path'
    defaults   = require 'lodash.defaults'
    stringify  = require './stringify'

    if 'function' == typeof strOpt
        cb = strOpt
        strOpt = {}
    else
        strOpt ?= {}

    str = stringify data, defaults ext:path.extname(p), strOpt

    if 'function' == typeof cb

        fs.writeFile p, str, cb

    else

        fs.writeFileSync p, str

module.exports = save
