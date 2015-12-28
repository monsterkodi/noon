_      = require 'lodash'
assert = require 'assert'
chai   = require 'chai'
noon   = require '../'
expect = chai.expect
chai.should()

describe 'module interface', ->
    
    it 'should implement parse', ->
        _.isFunction(noon.parse).should.be.true
    it 'should implement stringify', ->
        _.isFunction(noon.stringify).should.be.true
    it 'should implement load', ->
        _.isFunction(noon.load).should.be.true
    it 'should implement save', ->
        _.isFunction(noon.save).should.be.true
            
###
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
###

describe 'parse', ->
    
    it 'integer', ->
        expect noon.parse("""
        42
        66.0
        """)
        .to.eql([42,66])
        
    it 'bool', ->
        expect noon.parse("""
        true
        false
        """)
        .to.eql([true,false])
        
    it 'null', ->
        expect noon.parse("""
        null
        """)
        .to.eql [null]            
        
    it 'float', ->
        expect noon.parse("""
        0.24
        66.6
        """)
        .to.eql [0.24,66.6]
        
    it 'list', ->
        expect noon.parse("""
        a
        a1
        a 1
        """)
        .to.eql ['a', 'a1', 'a 1']
        
    it 'object', ->
        expect noon.parse("""
        a  
        b  
        c  3
        """)         
        .to.eql a:null, b:null, c:3
        
    ###
                  000      000   0000000  000000000   0000000
                  000      000  000          000     000     
    000000        000      000  0000000      000     0000000 
                  000      000       000     000          000
                  0000000  000  0000000      000     0000000 
    ###
    it 'nested lists', ->
        expect noon.parse("""
        a  
        b  
        .
            c
            .
            .
                .
            d
        .
            e
            .
                f
        """)
        .to.eql [
                'a'
                'b'
                ['c', [], [[]],'d']
                ['e', ['f']]
            ]
    ###
                   0000000   0000000          000  00000000   0000000  000000000   0000000
                  000   000  000   000        000  000       000          000     000     
    000000        000   000  0000000          000  0000000   000          000     0000000 
                  000   000  000   000  000   000  000       000          000          000
                   0000000   0000000     0000000   00000000   0000000     000     0000000 
    ###
    it 'nested objects', ->
        
        expect noon.parse("""
        a  
        b  
            c
            d
                e  0
            f   1
        g
        """)
        .to.eql
                a:null
                b:
                    c: null
                    d:
                        e: 0
                    f: 1
                g: null
                
    it 'complex object', ->
        
        expect noon.parse("""
        a
            b
              c
            d
        e f
            g  h
        1  one  two  
        j
            .
                k  l
            .
                .|  true|false
        """)
        .to.eql
            a:
                b: ['c']
                d: null
            'e f':
                g: 'h'
            '1': 'one  two'
            j: [{k: 'l'}, '.|':'true|false']
    ###
                  0000000    00000000  000   000   0000000  00000000
                  000   000  000       0000  000  000       000     
    000000        000   000  0000000   000 0 000  0000000   0000000 
                  000   000  000       000  0000       000  000     
                  0000000    00000000  000   000  0000000   00000000
    ###
    it 'dense notation', ->
        
        expect noon.parse("""
        a  . b .. c 1 .. d  2 .. e ... x y z  ... f .... null  null ... 3 .. g . h 
        b  . foo . bar
            foo
            bar
        c  . foo .. bark
            foo  bar
        """)
        .to.eql
            a:
                b:
                    c: 1
                    d: 2
                    e: 
                        x: 'y z'
                        f: 
                            'null': null
                        '3': null
                    g: null
                h: null
            b: [ 'foo', 'bar', 'foo', 'bar' ]
            c: 
                foo: 'bar'
    ###
                  00000000   0000000   0000000   0000000   00000000   00000000
                  000       000       000       000   000  000   000  000     
    000000        0000000   0000000   000       000000000  00000000   0000000 
                  000            000  000       000   000  000        000     
                  00000000  0000000    0000000  000   000  000        00000000
    ###
    it 'escape', -> 
        
        expect noon.parse("""
        a  | 1  1  
        b  | 2  2  |
        c    3  3  |
        d  ||
        e  | |
        f  |||
        g  || | || 
        h  |. . . 
        |i |        1
        | j|        2 
        | k  k |    3  
        |l |        | l    
        | m  m |    m m  |    
        | n  n |    ||||
        | o o |
        | p   p
        | q |  |
        ||  |
        |r|4
        |s|| |
        t  |5
        |u |6
        |.|  .
        | |true
        |#||#
        """)
        .to.eql
            a: ' 1  1'
            b: ' 2  2  '
            c: '3  3  '
            d: ''
            e: ' '
            f: '|'
            g: '| | |'
            h: '. . .'
            'i ': 1
            ' j': 2
            ' k  k ': 3
            'l ': ' l'
            ' m  m ': 'm m  '
            ' n  n ': '||'
            ' o o ': null
            ' p   p': null
            ' q ': ''
            '': ''
            'r': 4
            's': ' '
            't': '5'
            'u ': 6
            '.': '.'
            ' ': true
            '#': '#'
            
###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000   
###
describe 'stringify', ->
    
    it 'number', -> 
        
        expect noon.stringify(42)
        .to.eql '42'
        
        expect noon.stringify(66.6000)
        .to.eql '66.6'
        
    it 'bool', -> 
        
        expect noon.stringify(false)
        .to.eql 'false'
        
        expect noon.stringify(true)
        .to.eql 'true'
        
        expect noon.stringify(['false', 'true', ' false', 'true  '])
        .to.eql """        
        false
        true
        | false
        true  |
        """
        
    it 'null', ->
        
        expect noon.stringify([null, ' null '])
        .to.eql """
        null
        | null |
        """
        
    it 'string', -> 
        
        expect noon.stringify("hello world")
        .to.eql 'hello world'
        
        expect noon.stringify(" .  ...  ||| ")
        .to.eql '| .  ...  ||| |'
        
        expect noon.stringify("66.6000")
        .to.eql '66.6000'
        
