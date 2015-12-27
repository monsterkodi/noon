_      = require 'lodash'
assert = require 'assert'
chai   = require 'chai'
noon   = require '../'
chai.should()
expect = chai.expect

describe 'module interface', ->
    it 'should implement parse', ->
        _.isFunction(noon.parse).should.be.true
    it 'should implement stringify', ->
        _.isFunction(noon.stringify).should.be.true
    it 'should implement load', ->
        _.isFunction(noon.load).should.be.true
    it 'should implement save', ->
        _.isFunction(noon.save).should.be.true
            

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
        .to.eql {a:null,b:null,c:3}
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
                m  n
        """)
        .to.eql
            a:
                b: ['c']
                d: null
            'e f':
                g: 'h'
            '1': 'one  two'
            j: [{k: 'l'}, m: 'n']
    it 'dense notation', ->
        expect noon.parse("""
        a  . b .. c 1 .. d  2 .. e ... x y z  ... f .... null  null ... 3 .. g . h 
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

                        
        
