###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

module.exports =
    extnames:   ['.json' '.noon' '.yml' '.yaml']
    extensions: [ 'json'  'noon'  'yml'  'yaml']
    save:      require './save'
    load:      require './load'
    parse:     require './parse'
    stringify: require './stringify' 
