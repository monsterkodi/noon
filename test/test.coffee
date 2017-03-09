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
    
    it 'number', ->
        expect noon.parse """
        42
        66.0
        0.42
        66.60
        Infinity
        +20
        -20
        +0
        -1.23
        """
        .to.eql [42,66,0.42,66.6,Infinity,20,-20,0,-1.23]
        
    it 'bool', ->
        expect noon.parse """
        true
        false
        """
        .to.eql [true,false]
        
    it 'null', ->
        expect noon.parse """
        null
        """
        .to.eql [null]            
        
    it 'string', ->
        
        expect noon.parse "hello world"
        .to.eql ['hello world']

        expect noon.parse "| hello world |"
        .to.eql [' hello world ']
        
        expect noon.parse('| .  ... |  ')
        .to.eql [' .  ... ']
        
        expect noon.parse "|66.6000|"
        .to.eql ['66.6000']

        expect noon.parse "6.6.6"
        .to.eql ['6.6.6']

        expect noon.parse "^1.2"
        .to.eql ['^1.2']

        expect noon.parse "++2"
        .to.eql ['++2']

        expect noon.parse "+-0"
        .to.eql ['+-0']
        
        expect noon.parse('... \n line 1 \n line 2 \n ...')
        .to.eql ['line 1\nline 2']

                
    it 'list', ->
        expect noon.parse("""
        a
        a1
        a 1
        """)
        .to.eql ['a', 'a1', 'a 1']
        
    it 'object', ->
        expect noon.parse """
        a  
        b  
        c  3
        """
        .to.eql a:null, b:null, c:3
        
    it 'nested lists', ->
        expect noon.parse """
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
        """
        .to.eql [
                'a'
                'b'
                ['c', [], [[]],'d']
                ['e', ['f']]
            ]

    it 'nested objects', ->
        
        expect noon.parse """
        a  
        b  
            c
            d
                e  0
            f   1
        g
        """
        .to.eql
                a:null
                b:
                    c: null
                    d:
                        e: 0
                    f: 1
                g: null
                
    it 'complex object', ->
        
        expect noon.parse """
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
        """
        .to.eql
            a:
                b: ['c']
                d: null
            'e f':
                g: 'h'
            '1': 'one  two'
            j: [{k: 'l'}, '.|':'true|false']
            

    it 'spaces', ->    
        o = {a: 1, b: 2}
            
        expect noon.parse """
        a  1
        b  2
        """
        .to.eql o
        
        expect noon.parse """
         a  1
         b  2
        """
        .to.eql o

        expect noon.parse """
            a  1
            b  2
        """
        .to.eql o

        expect noon.parse """
        
        
        a  1
        
        b  2
        
        """
        .to.eql o
        
        expect noon.parse """
        key      value   with    some    spaces   .   
        """
        .to.eql {key: "value   with    some    spaces   ."}
        
    it 'dense notation', ->
        
        expect noon.parse """
        a  . b .. c 1 .. d  2 .. e ... x y z  ... f .... null  null ... 3 .. g . h 
        b  . foo . bar
            foo
            bar
        c  . foo .. bark
            foo  bar
        """
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
                
        expect noon.parse """
        a  . b .. c 0
        """
        .to.eql
            a: 
                b:
                    c: 0

        expect noon.parse """
        a  . path ../some.file
        """
        .to.eql
            a: 
                path: '../some.file'

        expect noon.parse """
        a  . ? some sentence. some other sentence. . A: next sentence...
        """
        .to.eql
            a: 
                '?':  'some sentence. some other sentence.'
                'A:': 'next sentence...' 

    it 'dense escaped', ->

        expect noon.parse """
        a  . x | 1| . y | 2 | . z |3 |
        """
        .to.eql
            a: 
                x: ' 1'
                y: ' 2 ' 
                z: '3 ' 

        expect noon.parse """
        a  . | 1| . | 2 | . |3 |
        """
        .to.eql
            a: [ ' 1', ' 2 ', '3 '] 

        expect noon.parse """
        a  . | 1| a . | 2 | b . |3 | c
        """
        .to.eql
            a: 
                ' 1':  'a' 
                ' 2 ': 'b'
                '3 ':  'c' 

        expect noon.parse """
        a  . | 1|   a | . | 2 | | b| . |3 | |c x 
        """
        .to.eql
            a: 
                ' 1':  'a ' 
                ' 2 ': ' b'
                '3 ':  'c x' 

    it 'one line notation', ->

        expect noon.parse "key . a :: b . c :: d 1 :: e 2"
        .to.eql
            key: ['a']
            b:   ['c']
            d:   1
            e:   2

        expect noon.parse "a . b .. c 4"
        .to.eql
            a: 
                b:
                    c: 4
        
        expect noon.parse "a 1 :: b 2 :: c 5"
        .to.eql
            a: 1
            b: 2
            c: 5

        expect noon.parse "a:: b:: c 3:: d 4"
        .to.eql
            a: null
            b: null
            c: 3
            d: 4

        expect noon.parse "a      :: b          :: c:: d 4"
        .to.eql
            a: null
            b: null
            c: null
            d: 4

        expect noon.parse "a      :: b          :: c:: d  "
        .to.eql ['a', 'b', 'c', 'd']

        expect noon.parse "1 :: 2 :: 3 :: 4"
        .to.eql [1,2,3,4]

        expect noon.parse "a . 1 . 2 :: b . 6"
        .to.eql
            a: [1,2]
            b: [6]

        expect noon.parse "a     .     1     .     2     :: b    .   7     "
        .to.eql
            a: [1,2]
            b: [7]

    it 'escape', -> 
        
        expect noon.parse """
         | 1|
         |2 |
         | 3 |
        """
        .to.eql [' 1', '2 ', ' 3 '] 
        
        expect noon.parse """
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
        """
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
        expect noon.parse """    
        ||      ||
        | |     | |
        |  |    |  |
        | . |   | . |
        | .. |  | .. |
        | ...   ||
        | ....  |.|
        | ..... |. |
        | .     | . |
        | ..    | .. |
        """
        .to.eql 
            ''       :'' 
            ' '      :' '
            '  '     :'  ' 
            ' . '    :' . '    
            ' .. '   :' .. '   
            ' ...   ':''
            ' ....  ':'.'
            ' ..... ':'. '
            ' .     ':'. '
            ' ..    ':'.. '
            
        expect noon.parse '... \n| 1 |\n | 2 \n  3  |\n  ...'
        .to.eql [' 1 \n 2\n3  ']

    it 'comment', -> 
        
        expect noon.parse """
        # this is a comment
        this is some data
        """
        .to.eql ['this is some data']


        expect noon.parse """
        a  1
            #foo
        b  2
        #b  3
        c   4 # 5
        d   
            6 # 7
        #  
        ###
        """
        .to.eql 
            a: 1
            b: 2
            c: '4 # 5'
            d: ['6 # 7']

        expect noon.parse """
        a  1
        |#|
            |#
            | # 
        """
        .to.eql 
            a: 1
            '#': ['#', ' #']

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
        
        expect noon.stringify false
        .to.eql 'false'
        
        expect noon.stringify true
        .to.eql 'true'
        
        expect noon.stringify(['false', 'true', ' false', 'true  '])
        .to.eql """        
        false
        true
        | false|
        |true  |
        """
        
    it 'null', ->
        
        expect noon.stringify [null, ' null ']
        .to.eql """
        null
        | null |
        """
        
    it 'string', ->
        
        expect noon.stringify "hello world"
        .to.eql 'hello world'
        
        expect noon.stringify " .  ...  ||| "
        .to.eql '| .  ...  ||| |'
        
        expect noon.stringify "66.6000"
        .to.eql '66.6000'
        
        expect noon.stringify "1\n2\n3"
        .to.eql '...\n1\n2\n3\n...'
        
    it 'float', ->
        expect noon.stringify [0.24,66.6]
        .to.eql """
        0.24
        66.6
        """
        
    it 'list', ->
        expect noon.stringify ['a', 'a1', 'a 1']
        .to.eql """
        a
        a1
        a 1
        """

    it 'list of lists ...', ->

        expect noon.stringify [[1,2],[4,[5],[[6]]],[7],[],[[8,[9,[10,11],12]]]]
        .to.eql """
        .
            1
            2
        .
            4
            .
                5
            .
                .
                    6
        .
            7
        .
        .
            .
                8
                .
                    9
                    .
                        10
                        11
                    12
        """
        
    it 'object', ->
        expect noon.stringify {a:1, b:2, c:3}
        .to.eql """    
        a   1
        b   2
        c   3
        """
        
        o = a: 1, b: 2    
        r = """
        a   1
        b   2
        """
        expect noon.stringify o
        .to.eql r

        expect noon.stringify o, indent: '  '
        .to.eql r

        expect noon.stringify o, indent: 2
        .to.eql r
        
        expect noon.stringify {key: "value   with    some    spaces  ."}
        .to.eql """
        key  value   with    some    spaces  .
        """
        
    it 'escape', ->
        
        expect noon.stringify [
            '' 
            ' '
            '  '
            ' . ' 
            ' .. '
            ' ... '
            ' .' 
            ' ..'
            ' ...'
            '. ' 
            '.. '
            '... '
            '|'
            '||'
            '#'
            '# a'
        ]
        .to.eql """    
        ||
        | |
        |  |
        | . |
        | .. |
        | ... |
        | .|
        | ..|
        | ...|
        |. |
        |.. |
        |... |
        |||
        ||||
        |#|
        |# a|
        """
        
        expect noon.stringify {
            ''       :'' 
            ' '      :' '
            '  '     :'  ' 
            ' . '    :' . '    
            ' .. '   :' .. '   
            ' ... '  :' .|. '    
            ' .'     :' .'   
            ' ..'    :' ..'  
            ' ...'   :' .|.'   
            '. '     :'. '   
            '.. '    :'.. '  
            '... '   :'.|. '   
            '.  .'   :'|'
            '.   .'  :'||'
            '#'      :'#'
            '# a'    :'# b'
            
        }
        .to.eql """    
        ||      ||
        | |     | |
        |  |    |  |
        | . |   | . |
        | .. |  | .. |
        | ... |  | .|. |
        | .|    | .|
        | ..|   | ..|
        | ...|  | .|.|
        |. |    |. |
        |.. |   |.. |
        |... |  |.|. |
        |.  .|  |||
        |.   .|  ||||
        |#|     |#|
        |# a|   |# b|
        """
        
        expect noon.stringify " 1 \n2 \n  3"
        .to.eql '...\n| 1 |\n|2 |\n|  3|\n...'

        expect noon.stringify o: " 1 \n2 \n  3"
        .to.eql 'o   ...\n| 1 |\n|2 |\n|  3|\n...'
        
        expect noon.stringify a: ["a  b", "1   3", "   c    d  e   "]
        .to.eql """
        a
            |a  b|
            |1   3|
            |   c    d  e   |
        """

    it 'trim', ->
        o = a: 1, b: null, c: 2
        
        expect noon.stringify o, align: false
        .to.eql """
        a  1
        b
        c  2
        """
        expect noon.stringify o, align: true
        .to.eql """
        a   1
        b
        c   2
        """

        expect noon.stringify {a: b: c: 1}, align: true
        .to.eql """
        a
            b
                c   1
        """

        expect noon.stringify {x: y: z: 1}, align: false
        .to.eql """
        x
            y
                z  1
        """

    it 'maxalign', ->
        o = o: 1, ooOOoo: 2
        expect noon.stringify o, maxalign: 2
        .to.eql """
        o  1
        ooOOoo  2
        """
        expect noon.stringify o, maxalign: 4
        .to.eql """
        o   1
        ooOOoo  2
        """
        expect noon.stringify o, maxalign: 8
        .to.eql """
        o       1
        ooOOoo  2
        """

        expect noon.stringify o, maxalign: 18
        .to.eql """
        o       1
        ooOOoo  2
        """
        
        t = foofoo: 
             barbarbar: 1
             foo: 2
             
        expect noon.stringify t
        .to.eql """
        foofoo
            barbarbar   1
            foo         2
        """

        expect noon.stringify t, indent: 3
        .to.eql """
        foofoo
           barbarbar   1
           foo         2
        """

        t = 
            foobar: 
                barfoo: 1
                bar: 2
            foo: 
                bar: 1

        expect noon.stringify t
        .to.eql """
        foobar
                barfoo  1
                bar     2
        foo
                bar  1
        """
        
    it 'indent', ->
        o = a: b: c: 1
        expect noon.stringify o, indent: 2, align: false
        .to.eql """
        a
          b
            c  1
        """
        expect noon.stringify o, indent: 4, align: false
        .to.eql """
        a
            b
                c  1
        """
        expect noon.stringify o, indent: 8, align: false
        .to.eql """
        a
                b
                        c  1
        """
        expect noon.stringify o, indent: '  ', align: false
        .to.eql """
        a
          b
            c  1
        """
        expect noon.stringify o, indent: '    ', align: false
        .to.eql """
        a
            b
                c  1
        """
        expect noon.stringify o, indent: '        ', align: false
        .to.eql """
        a
                b
                        c  1
        """

    it 'comment', ->
        
        expect noon.stringify '#'
        .to.eql "|#|"

        expect noon.stringify '#foo'
        .to.eql "|#foo|"

        expect noon.stringify ['###', '#', '  # ']
        .to.eql """
        |###|
        |#|
        |  # |
        """

    it 'json', ->
                
        expect noon.stringify {"a": "b"}, ext: '.json', indent: 8
        .to.eql """
        {
                "a": "b"
        }
        """
        
###
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000        00000000  000   000  000000000
000          000     000   000  000  0000  000  000        000  000        000 000         000        000 000      000   
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000          0000000     00000       000   
     000     000     000   000  000  000  0000  000   000  000  000          000           000        000 000      000   
0000000      000     000   000  000  000   000   0000000   000  000          000           00000000  000   000     000   
###

describe 'stringify ext', ->

    o = a: 1, b: 2    
    it 'should output noon by default', -> 
        
        expect noon.stringify o
        .to.eql """
        a   1
        b   2
        """

    it 'should output noon', -> 
        
        expect noon.stringify o, ext: '.noon'
        .to.eql """
        a   1
        b   2
        """
        
    it 'should output json', -> 
        
        expect noon.stringify o, ext: '.json'
        .to.eql """
        {
            "a": 1,
            "b": 2
        }
        """

    it 'should output cson', -> 
        
        expect noon.stringify o, ext: '.cson'
        .to.eql """
        a: 1
        b: 2
        """

    it 'should output yaml', -> 
        
        expect noon.stringify o, ext: '.yaml'
        .to.eql """
        a: 1
        b: 2
        
        """
