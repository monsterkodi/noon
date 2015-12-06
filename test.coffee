noon = require '.'

console.log noon.stringify { hello: 'world' }

console.log noon.parse """
hello        world
what's up?   ☺
"""
