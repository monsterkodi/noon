// koffee 1.14.0
var assert, chai, expect, fs, noon, path;

assert = require('assert');

chai = require('chai');

path = require('path');

fs = require('fs');

noon = require('../');

expect = chai.expect;

chai.should();

describe('module interface', function() {
    it('should implement parse', function() {
        return (typeof noon.parse).should.eql('function');
    });
    it('should implement stringify', function() {
        return (typeof noon.stringify).should.eql('function');
    });
    it('should implement load', function() {
        return (typeof noon.load).should.eql('function');
    });
    return it('should implement save', function() {
        return (typeof noon.save).should.eql('function');
    });
});

describe('load', function() {
    var testNoon;
    testNoon = path.join(__dirname, 'test.noon');
    it('sync', function() {
        var r;
        r = noon.load(testNoon);
        return expect(r.number.int).to.eql(42);
    });
    return it('async', function(done) {
        return noon.load(testNoon, function(r) {
            expect(r.number.int).to.eql(42);
            return done();
        });
    });
});

describe('save', function() {
    var writeData, writeNoon;
    writeNoon = path.join(__dirname, 'write.noon');
    writeData = {
        hello: 'world'
    };
    it('sync', function() {
        var err;
        try {
            fs.unlinkSync(writeNoon);
        } catch (error) {
            err = error;
            null;
        }
        noon.save(writeNoon, writeData);
        return expect(noon.load(writeNoon)).to.eql(writeData);
    });
    return it('async', function(done) {
        var err;
        try {
            fs.unlinkSync(writeNoon);
        } catch (error) {
            err = error;
            null;
        }
        return noon.save(writeNoon, writeData, function(err) {
            expect(err).to.eql(null);
            expect(noon.load(writeNoon)).to.eql(writeData);
            return done();
        });
    });
});


/*
00000000    0000000   00000000    0000000  00000000
000   000  000   000  000   000  000       000     
00000000   000000000  0000000    0000000   0000000 
000        000   000  000   000       000  000     
000        000   000  000   000  0000000   00000000
 */

describe('parse', function() {
    it('number', function() {
        expect(noon.parse("666")).to.eql([666]);
        expect(noon.parse("1.23")).to.eql([1.23]);
        expect(noon.parse("0.000")).to.eql([0]);
        expect(noon.parse("Infinity")).to.eql([2e308]);
        return expect(noon.parse("42\n66.0\n0.42\n66.60\nInfinity\n+20\n-20\n+0\n-1.23")).to.eql([42, 66, 0.42, 66.6, 2e308, 20, -20, 0, -1.23]);
    });
    it('bool', function() {
        expect(noon.parse("true")).to.eql([true]);
        return expect(noon.parse("true\nfalse")).to.eql([true, false]);
    });
    it('null', function() {
        return expect(noon.parse("null")).to.eql([null]);
    });
    it('string', function() {
        expect(noon.parse("hello world")).to.eql(['hello world']);
        expect(noon.parse("| hello world |")).to.eql([' hello world ']);
        expect(noon.parse('| .  ... |  ')).to.eql([' .  ... ']);
        expect(noon.parse("|66.6000|")).to.eql(['66.6000']);
        expect(noon.parse("6.6.6")).to.eql(['6.6.6']);
        expect(noon.parse("^1.2")).to.eql(['^1.2']);
        expect(noon.parse("++2")).to.eql(['++2']);
        expect(noon.parse("+-0")).to.eql(['+-0']);
        return expect(noon.parse('... \n line 1 \n line 2 \n ...')).to.eql(['line 1\nline 2']);
    });
    it('list', function() {
        return expect(noon.parse("a\na1\na 1")).to.eql(['a', 'a1', 'a 1']);
    });
    it('object', function() {
        return expect(noon.parse("a  \nb  \nc  3")).to.eql({
            a: null,
            b: null,
            c: 3
        });
    });
    it('nested lists', function() {
        return expect(noon.parse("a  \nb  \n.\n    c\n    .\n    .\n        .\n    d\n.\n    e\n    .\n        f")).to.eql(['a', 'b', ['c', [], [[]], 'd'], ['e', ['f']]]);
    });
    it('nested objects', function() {
        return expect(noon.parse("a  \nb  \n    c\n    d\n        e  0\n    f   1\ng")).to.eql({
            a: null,
            b: {
                c: null,
                d: {
                    e: 0
                },
                f: 1
            },
            g: null
        });
    });
    it('complex object', function() {
        return expect(noon.parse("a\n    b\n      c\n    d\ne f\n    g  h\n1  one  two  \nj\n    .\n        k  l\n    .\n        .|  true|false")).to.eql({
            a: {
                b: ['c'],
                d: null
            },
            'e f': {
                g: 'h'
            },
            '1': 'one  two',
            j: [
                {
                    k: 'l'
                }, {
                    '.|': 'true|false'
                }
            ]
        });
    });
    it('spaces', function() {
        var o;
        o = {
            a: 1,
            b: 2
        };
        expect(noon.parse("a  1\nb  2")).to.eql(o);
        expect(noon.parse("a  1\nb  2")).to.eql(o);
        expect(noon.parse("a  1\nb  2")).to.eql(o);
        expect(noon.parse("\n\na  1\n\nb  2\n")).to.eql(o);
        return expect(noon.parse("key      value   with    some    spaces   .   ")).to.eql({
            key: "value   with    some    spaces   ."
        });
    });
    it('whitespace lines', function() {
        var o;
        o = {
            a: 1,
            b: 2
        };
        expect(noon.parse(" \na  1\n \nb  2\n ")).to.eql(o);
        return expect(noon.parse("    \na  1\n    \nb  2\n    ")).to.eql(o);
    });
    it('dense notation', function() {
        expect(noon.parse("a  . b .. c 1 .. d  2 .. e ... x y z  ... f .... null  null ... 3 .. g . h \nb  . foo . bar\n    foo\n    bar\nc  . foo .. bark\n    foo  bar")).to.eql({
            a: {
                b: {
                    c: 1,
                    d: 2,
                    e: {
                        x: 'y z',
                        f: {
                            'null': null
                        },
                        '3': null
                    },
                    g: null
                },
                h: null
            },
            b: ['foo', 'bar', 'foo', 'bar'],
            c: {
                foo: 'bar'
            }
        });
        expect(noon.parse("a  . b .. c 0")).to.eql({
            a: {
                b: {
                    c: 0
                }
            }
        });
        expect(noon.parse("a  . path ../some.file")).to.eql({
            a: {
                path: '../some.file'
            }
        });
        return expect(noon.parse("a  . ? some sentence. some other sentence. . A: next sentence...")).to.eql({
            a: {
                '?': 'some sentence. some other sentence.',
                'A:': 'next sentence...'
            }
        });
    });
    it('dense escaped', function() {
        expect(noon.parse("a  . x | 1| . y | 2 | . z |3 |")).to.eql({
            a: {
                x: ' 1',
                y: ' 2 ',
                z: '3 '
            }
        });
        expect(noon.parse("a  . | 1| . | 2 | . |3 |")).to.eql({
            a: [' 1', ' 2 ', '3 ']
        });
        expect(noon.parse("a  . | 1| a . | 2 | b . |3 | c")).to.eql({
            a: {
                ' 1': 'a',
                ' 2 ': 'b',
                '3 ': 'c'
            }
        });
        return expect(noon.parse("a  . | 1|   a | . | 2 | | b| . |3 | |c x ")).to.eql({
            a: {
                ' 1': 'a ',
                ' 2 ': ' b',
                '3 ': 'c x'
            }
        });
    });
    it('one line notation', function() {
        expect(noon.parse("key . a :: b . c :: d 1 :: e 2")).to.eql({
            key: ['a'],
            b: ['c'],
            d: 1,
            e: 2
        });
        expect(noon.parse("a . b .. c 4")).to.eql({
            a: {
                b: {
                    c: 4
                }
            }
        });
        expect(noon.parse("a 1 :: b 2 :: c 5")).to.eql({
            a: 1,
            b: 2,
            c: 5
        });
        expect(noon.parse("a:: b:: c 3:: d 4")).to.eql({
            a: null,
            b: null,
            c: 3,
            d: 4
        });
        expect(noon.parse("a      :: b          :: c:: d 4")).to.eql({
            a: null,
            b: null,
            c: null,
            d: 4
        });
        expect(noon.parse("a      :: b          :: c:: d  ")).to.eql(['a', 'b', 'c', 'd']);
        expect(noon.parse("1 :: 2 :: 3 :: 4")).to.eql([1, 2, 3, 4]);
        expect(noon.parse("a . 1 . 2 :: b . 6")).to.eql({
            a: [1, 2],
            b: [6]
        });
        return expect(noon.parse("a     .     1     .     2     :: b    .   7     ")).to.eql({
            a: [1, 2],
            b: [7]
        });
    });
    it('escape', function() {
        expect(noon.parse("| 1|\n|2 |\n| 3 |")).to.eql([' 1', '2 ', ' 3 ']);
        expect(noon.parse("a  | 1  1  \nb  | 2  2  |\nc    3  3  |\nd  ||\ne  | |\nf  |||\ng  || | || \nh  |. . . \n|i |        1\n| j|        2 \n| k  k |    3  \n|l |        | l    \n| m  m |    m m  |    \n| n  n |    ||||\n| o o |\n| p   p\n| q |  |\n||  |\n|r|4\n|s|| |\nt  |5\n|u |6\n|.|  .\n| |true\n|#||#")).to.eql({
            a: ' 1  1',
            b: ' 2  2  ',
            c: '3  3  ',
            d: '',
            e: ' ',
            f: '|',
            g: '| | |',
            h: '. . .',
            'i ': 1,
            ' j': 2,
            ' k  k ': 3,
            'l ': ' l',
            ' m  m ': 'm m  ',
            ' n  n ': '||',
            ' o o ': null,
            ' p   p': null,
            ' q ': '',
            '': '',
            'r': 4,
            's': ' ',
            't': '5',
            'u ': 6,
            '.': '.',
            ' ': true,
            '#': '#'
        });
        expect(noon.parse("||      ||\n| |     | |\n|  |    |  |\n| . |   | . |\n| .. |  | .. |\n| ...   ||\n| ....  |.|\n| ..... |. |\n| .     | . |\n| ..    | .. |")).to.eql({
            '': '',
            ' ': ' ',
            '  ': '  ',
            ' . ': ' . ',
            ' .. ': ' .. ',
            ' ...   ': '',
            ' ....  ': '.',
            ' ..... ': '. ',
            ' .     ': '. ',
            ' ..    ': '.. '
        });
        return expect(noon.parse('... \n| 1 |\n | 2 \n  3  |\n  ...')).to.eql([' 1 \n 2\n3  ']);
    });
    it('comment', function() {
        expect(noon.parse("# this is a comment\nthis is some data")).to.eql(['this is some data']);
        expect(noon.parse("a  1\n    #foo\nb  2\n#b  3\nc   4 # 5\nd   \n    6 # 7\n#  \n###")).to.eql({
            a: 1,
            b: 2,
            c: '4 # 5',
            d: ['6 # 7']
        });
        return expect(noon.parse("a  1\n|#|\n    |#\n    | # ")).to.eql({
            a: 1,
            '#': ['#', ' #']
        });
    });
    return it('empty string', function() {
        expect(noon.parse('')).to.eql('');
        expect(noon.parse(' ')).to.eql('');
        return expect(noon.parse()).to.eql('');
    });
});


/*
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000
000          000     000   000  000  0000  000  000        000  000        000 000 
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000  
     000     000     000   000  000  000  0000  000   000  000  000          000   
0000000      000     000   000  000  000   000   0000000   000  000          000
 */

describe('stringify', function() {
    it('number', function() {
        expect(noon.stringify(42)).to.eql('42');
        return expect(noon.stringify(66.6000)).to.eql('66.6');
    });
    it('bool', function() {
        expect(noon.stringify(false)).to.eql('false');
        expect(noon.stringify(true)).to.eql('true');
        return expect(noon.stringify(['false', 'true', ' false', 'true  '])).to.eql("false\ntrue\n| false|\n|true  |");
    });
    it('null', function() {
        return expect(noon.stringify([null, ' null '])).to.eql("null\n| null |");
    });
    it('string', function() {
        expect(noon.stringify("hello world")).to.eql('hello world');
        expect(noon.stringify(" .  ...  ||| ")).to.eql('| .  ...  ||| |');
        expect(noon.stringify("66.6000")).to.eql('66.6000');
        return expect(noon.stringify("1\n2\n3")).to.eql('...\n1\n2\n3\n...');
    });
    it('float', function() {
        return expect(noon.stringify([0.24, 66.6])).to.eql("0.24\n66.6");
    });
    it('list', function() {
        return expect(noon.stringify(['a', 'a1', 'a 1'])).to.eql("a\na1\na 1");
    });
    it('list of lists ...', function() {
        return expect(noon.stringify([[1, 2], [4, [5], [[6]]], [7], [], [[8, [9, [10, 11], 12]]]])).to.eql(".\n    1\n    2\n.\n    4\n    .\n        5\n    .\n        .\n            6\n.\n    7\n.\n.\n    .\n        8\n        .\n            9\n            .\n                10\n                11\n            12");
    });
    it('object', function() {
        var o, r;
        expect(noon.stringify({
            a: 1,
            b: 2,
            c: 3
        })).to.eql("a   1\nb   2\nc   3");
        o = {
            a: 1,
            b: 2
        };
        r = "a   1\nb   2";
        expect(noon.stringify(o)).to.eql(r);
        expect(noon.stringify(o, {
            indent: '  '
        })).to.eql(r);
        expect(noon.stringify(o, {
            indent: 2
        })).to.eql(r);
        return expect(noon.stringify({
            key: "value   with    some    spaces  ."
        })).to.eql("key  value   with    some    spaces  .");
    });
    it('escape', function() {
        expect(noon.stringify(['', ' ', '  ', ' . ', ' .. ', ' ... ', ' .', ' ..', ' ...', '. ', '.. ', '... ', '|', '||', '#', '# a'])).to.eql("||\n| |\n|  |\n| . |\n| .. |\n| ... |\n| .|\n| ..|\n| ...|\n|. |\n|.. |\n|... |\n|||\n||||\n|#|\n|# a|");
        expect(noon.stringify({
            '': '',
            ' ': ' ',
            '  ': '  ',
            ' . ': ' . ',
            ' .. ': ' .. ',
            ' ... ': ' .|. ',
            ' .': ' .',
            ' ..': ' ..',
            ' ...': ' .|.',
            '. ': '. ',
            '.. ': '.. ',
            '... ': '.|. ',
            '.  .': '|',
            '.   .': '||',
            '#': '#',
            '# a': '# b'
        })).to.eql("||      ||\n| |     | |\n|  |    |  |\n| . |   | . |\n| .. |  | .. |\n| ... |  | .|. |\n| .|    | .|\n| ..|   | ..|\n| ...|  | .|.|\n|. |    |. |\n|.. |   |.. |\n|... |  |.|. |\n|.  .|  |||\n|.   .|  ||||\n|#|     |#|\n|# a|   |# b|");
        expect(noon.stringify(" 1 \n2 \n  3")).to.eql('...\n| 1 |\n|2 |\n|  3|\n...');
        expect(noon.stringify({
            o: " 1 \n2 \n  3"
        })).to.eql('o   ...\n| 1 |\n|2 |\n|  3|\n...');
        return expect(noon.stringify({
            a: ["a  b", "1   3", "   c    d  e   "]
        })).to.eql("a\n    |a  b|\n    |1   3|\n    |   c    d  e   |");
    });
    it('trim', function() {
        var o;
        o = {
            a: 1,
            b: null,
            c: 2
        };
        expect(noon.stringify(o, {
            align: false
        })).to.eql("a  1\nb\nc  2");
        expect(noon.stringify(o, {
            align: true
        })).to.eql("a   1\nb\nc   2");
        expect(noon.stringify({
            a: {
                b: {
                    c: 1
                }
            }
        }, {
            align: true
        })).to.eql("a\n    b\n        c   1");
        return expect(noon.stringify({
            x: {
                y: {
                    z: 1
                }
            }
        }, {
            align: false
        })).to.eql("x\n    y\n        z  1");
    });
    it('maxalign', function() {
        var o, t;
        o = {
            o: 1,
            ooOOoo: 2
        };
        expect(noon.stringify(o, {
            maxalign: 2
        })).to.eql("o  1\nooOOoo  2");
        expect(noon.stringify(o, {
            maxalign: 4
        })).to.eql("o   1\nooOOoo  2");
        expect(noon.stringify(o, {
            maxalign: 8
        })).to.eql("o       1\nooOOoo  2");
        expect(noon.stringify(o, {
            maxalign: 18
        })).to.eql("o       1\nooOOoo  2");
        t = {
            foofoo: {
                barbarbar: 1,
                foo: 2
            }
        };
        expect(noon.stringify(t)).to.eql("foofoo\n    barbarbar   1\n    foo         2");
        expect(noon.stringify(t, {
            indent: 3
        })).to.eql("foofoo\n   barbarbar   1\n   foo         2");
        t = {
            foobar: {
                barfoo: 1,
                bar: 2
            },
            foo: {
                bar: 1
            }
        };
        return expect(noon.stringify(t)).to.eql("foobar\n        barfoo  1\n        bar     2\nfoo\n        bar  1");
    });
    it('indent', function() {
        var o;
        o = {
            a: {
                b: {
                    c: 1
                }
            }
        };
        expect(noon.stringify(o, {
            indent: 2,
            align: false
        })).to.eql("a\n  b\n    c  1");
        expect(noon.stringify(o, {
            indent: 4,
            align: false
        })).to.eql("a\n    b\n        c  1");
        expect(noon.stringify(o, {
            indent: 8,
            align: false
        })).to.eql("a\n        b\n                c  1");
        expect(noon.stringify(o, {
            indent: '  ',
            align: false
        })).to.eql("a\n  b\n    c  1");
        expect(noon.stringify(o, {
            indent: '    ',
            align: false
        })).to.eql("a\n    b\n        c  1");
        return expect(noon.stringify(o, {
            indent: '        ',
            align: false
        })).to.eql("a\n        b\n                c  1");
    });
    it('comment', function() {
        expect(noon.stringify('#')).to.eql("|#|");
        expect(noon.stringify('#foo')).to.eql("|#foo|");
        return expect(noon.stringify(['###', '#', '  # '])).to.eql("|###|\n|#|\n|  # |");
    });
    it('json', function() {
        return expect(noon.stringify({
            "a": "b"
        }, {
            ext: '.json',
            indent: 8
        })).to.eql("{\n        \"a\": \"b\"\n}");
    });
    it('regexp', function() {
        return expect(noon.stringify([/^hello\sworld$/gi, /[\w\d]*/])).to.eql("^hello\\sworld$\n[\\w\\d]*");
    });
    return it('regexp values', function() {
        var expctd, result;
        result = noon.stringify({
            a: /^hello\sworld$/gi,
            b: /[\w\d]*/
        });
        expctd = "a   ^hello\\sworld$\nb   [\\w\\d]*";
        return expect(result).to.eql(expctd);
    });
});


/*
 0000000  000000000  00000000   000  000   000   0000000   000  00000000  000   000        00000000  000   000  000000000
000          000     000   000  000  0000  000  000        000  000        000 000         000        000 000      000   
0000000      000     0000000    000  000 0 000  000  0000  000  000000      00000          0000000     00000       000   
     000     000     000   000  000  000  0000  000   000  000  000          000           000        000 000      000   
0000000      000     000   000  000  000   000   0000000   000  000          000           00000000  000   000     000
 */

describe('stringify ext', function() {
    var o;
    o = {
        a: 1,
        b: 2
    };
    it('should output noon by default', function() {
        return expect(noon.stringify(o)).to.eql("a   1\nb   2");
    });
    it('should output noon', function() {
        return expect(noon.stringify(o, {
            ext: '.noon'
        })).to.eql("a   1\nb   2");
    });
    return it('should output json', function() {
        return expect(noon.stringify(o, {
            ext: '.json'
        })).to.eql("{\n    \"a\": 1,\n    \"b\": 2\n}");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJ0ZXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBQTs7QUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxFQUFBLEdBQVMsT0FBQSxDQUFRLElBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxLQUFSOztBQUNULE1BQUEsR0FBUyxJQUFJLENBQUM7O0FBQ2QsSUFBSSxDQUFDLE1BQUwsQ0FBQTs7QUFFQSxRQUFBLENBQVMsa0JBQVQsRUFBNEIsU0FBQTtJQUV4QixFQUFBLENBQUcsd0JBQUgsRUFBNEIsU0FBQTtlQUN4QixDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQWIsQ0FBbUIsQ0FBQyxNQUFNLENBQUMsR0FBM0IsQ0FBK0IsVUFBL0I7SUFEd0IsQ0FBNUI7SUFFQSxFQUFBLENBQUcsNEJBQUgsRUFBZ0MsU0FBQTtlQUM1QixDQUFDLE9BQU8sSUFBSSxDQUFDLFNBQWIsQ0FBdUIsQ0FBQyxNQUFNLENBQUMsR0FBL0IsQ0FBbUMsVUFBbkM7SUFENEIsQ0FBaEM7SUFFQSxFQUFBLENBQUcsdUJBQUgsRUFBMkIsU0FBQTtlQUN2QixDQUFDLE9BQU8sSUFBSSxDQUFDLElBQWIsQ0FBa0IsQ0FBQyxNQUFNLENBQUMsR0FBMUIsQ0FBOEIsVUFBOUI7SUFEdUIsQ0FBM0I7V0FFQSxFQUFBLENBQUcsdUJBQUgsRUFBMkIsU0FBQTtlQUN2QixDQUFDLE9BQU8sSUFBSSxDQUFDLElBQWIsQ0FBa0IsQ0FBQyxNQUFNLENBQUMsR0FBMUIsQ0FBOEIsVUFBOUI7SUFEdUIsQ0FBM0I7QUFSd0IsQ0FBNUI7O0FBaUJBLFFBQUEsQ0FBUyxNQUFULEVBQWdCLFNBQUE7QUFFWixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixF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LENBQVAsQ0FDQSxDQUFDLEVBQUUsQ0FBQyxHQURKLENBQ1EsY0FEUjtJQUZvQixDQUF4QjtXQVFBLEVBQUEsQ0FBRyxvQkFBSCxFQUF3QixTQUFBO2VBRXBCLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsRUFBa0I7WUFBQSxHQUFBLEVBQUssT0FBTDtTQUFsQixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLG1DQURSO0lBRm9CLENBQXhCO0FBbkJxQixDQUF6QiIsInNvdXJjZXNDb250ZW50IjpbImFzc2VydCA9IHJlcXVpcmUgJ2Fzc2VydCdcbmNoYWkgICA9IHJlcXVpcmUgJ2NoYWknXG5wYXRoICAgPSByZXF1aXJlICdwYXRoJ1xuZnMgICAgID0gcmVxdWlyZSAnZnMnXG5ub29uICAgPSByZXF1aXJlICcuLi8nXG5leHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS5zaG91bGQoKVxuXG5kZXNjcmliZSAnbW9kdWxlIGludGVyZmFjZScgLT5cbiAgICBcbiAgICBpdCAnc2hvdWxkIGltcGxlbWVudCBwYXJzZScgLT5cbiAgICAgICAgKHR5cGVvZiBub29uLnBhcnNlKS5zaG91bGQuZXFsICdmdW5jdGlvbidcbiAgICBpdCAnc2hvdWxkIGltcGxlbWVudCBzdHJpbmdpZnknIC0+XG4gICAgICAgICh0eXBlb2Ygbm9vbi5zdHJpbmdpZnkpLnNob3VsZC5lcWwgJ2Z1bmN0aW9uJ1xuICAgIGl0ICdzaG91bGQgaW1wbGVtZW50IGxvYWQnIC0+XG4gICAgICAgICh0eXBlb2Ygbm9vbi5sb2FkKS5zaG91bGQuZXFsICdmdW5jdGlvbidcbiAgICBpdCAnc2hvdWxkIGltcGxlbWVudCBzYXZlJyAtPlxuICAgICAgICAodHlwZW9mIG5vb24uc2F2ZSkuc2hvdWxkLmVxbCAnZnVuY3Rpb24nXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuZGVzY3JpYmUgJ2xvYWQnIC0+XG4gICAgXG4gICAgdGVzdE5vb24gPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAndGVzdC5ub29uJ1xuICAgIFxuICAgIGl0ICdzeW5jJyAtPlxuICAgICAgICBcbiAgICAgICAgciA9IG5vb24ubG9hZCB0ZXN0Tm9vblxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IHIubnVtYmVyLmludCBcbiAgICAgICAgLnRvLmVxbCA0MlxuXG4gICAgaXQgJ2FzeW5jJywgKGRvbmUpIC0+XG4gICAgICAgIFxuICAgICAgICBub29uLmxvYWQgdGVzdE5vb24sIChyKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgci5udW1iZXIuaW50IFxuICAgICAgICAgICAgLnRvLmVxbCA0MlxuICAgICAgICAgICAgZG9uZSgpXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5kZXNjcmliZSAnc2F2ZScgLT5cbiAgICBcbiAgICB3cml0ZU5vb24gPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnd3JpdGUubm9vbidcbiAgICB3cml0ZURhdGEgPSBoZWxsbzogJ3dvcmxkJ1xuICAgIFxuICAgIGl0ICdzeW5jJyAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5IFxuICAgICAgICAgICAgZnMudW5saW5rU3luYyB3cml0ZU5vb25cbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICAgICBub29uLnNhdmUgd3JpdGVOb29uLCB3cml0ZURhdGFcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLmxvYWQgd3JpdGVOb29uXG4gICAgICAgIC50by5lcWwgd3JpdGVEYXRhXG4gICAgICAgIFxuICAgIGl0ICdhc3luYycsIChkb25lKSAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5IFxuICAgICAgICAgICAgZnMudW5saW5rU3luYyB3cml0ZU5vb25cbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICAgICBub29uLnNhdmUgd3JpdGVOb29uLCB3cml0ZURhdGEsIChlcnIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlcnJcbiAgICAgICAgICAgIC50by5lcWwgbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgbm9vbi5sb2FkIHdyaXRlTm9vblxuICAgICAgICAgICAgLnRvLmVxbCB3cml0ZURhdGFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZG9uZSgpXG4gICAgICAgICAgICBcbiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5kZXNjcmliZSAncGFyc2UnIC0+XG4gICAgXG4gICAgaXQgJ251bWJlcicgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiNjY2XCJcbiAgICAgICAgLnRvLmVxbCBbNjY2XVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCIxLjIzXCJcbiAgICAgICAgLnRvLmVxbCBbMS4yM11cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiMC4wMDBcIlxuICAgICAgICAudG8uZXFsIFswXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJJbmZpbml0eVwiXG4gICAgICAgIC50by5lcWwgW0luZmluaXR5XVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIDQyXG4gICAgICAgIDY2LjBcbiAgICAgICAgMC40MlxuICAgICAgICA2Ni42MFxuICAgICAgICBJbmZpbml0eVxuICAgICAgICArMjBcbiAgICAgICAgLTIwXG4gICAgICAgICswXG4gICAgICAgIC0xLjIzXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFs0Miw2NiwwLjQyLDY2LjYsSW5maW5pdHksMjAsLTIwLDAsLTEuMjNdXG4gICAgICAgIFxuICAgIGl0ICdib29sJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJ0cnVlXCJcbiAgICAgICAgLnRvLmVxbCBbdHJ1ZV1cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICB0cnVlXG4gICAgICAgIGZhbHNlXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFt0cnVlLGZhbHNlXVxuICAgICAgICBcbiAgICBpdCAnbnVsbCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIG51bGxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgW251bGxdICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIGl0ICdzdHJpbmcnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImhlbGxvIHdvcmxkXCJcbiAgICAgICAgLnRvLmVxbCBbJ2hlbGxvIHdvcmxkJ11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcInwgaGVsbG8gd29ybGQgfFwiXG4gICAgICAgIC50by5lcWwgWycgaGVsbG8gd29ybGQgJ11cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlKCd8IC4gIC4uLiB8ICAnKVxuICAgICAgICAudG8uZXFsIFsnIC4gIC4uLiAnXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJ8NjYuNjAwMHxcIlxuICAgICAgICAudG8uZXFsIFsnNjYuNjAwMCddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCI2LjYuNlwiXG4gICAgICAgIC50by5lcWwgWyc2LjYuNiddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJeMS4yXCJcbiAgICAgICAgLnRvLmVxbCBbJ14xLjInXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiKysyXCJcbiAgICAgICAgLnRvLmVxbCBbJysrMiddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCIrLTBcIlxuICAgICAgICAudG8uZXFsIFsnKy0wJ11cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlKCcuLi4gXFxuIGxpbmUgMSBcXG4gbGluZSAyIFxcbiAuLi4nKVxuICAgICAgICAudG8uZXFsIFsnbGluZSAxXFxubGluZSAyJ11cblxuICAgICAgICAgICAgICAgIFxuICAgIGl0ICdsaXN0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZShcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICBhMVxuICAgICAgICBhIDFcbiAgICAgICAgXCJcIlwiKVxuICAgICAgICAudG8uZXFsIFsnYScsICdhMScsICdhIDEnXVxuICAgICAgICBcbiAgICBpdCAnb2JqZWN0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgXG4gICAgICAgIGIgIFxuICAgICAgICBjICAzXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIGE6bnVsbCwgYjpudWxsLCBjOjNcbiAgICAgICAgXG4gICAgaXQgJ25lc3RlZCBsaXN0cycgLT5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIFxuICAgICAgICBiICBcbiAgICAgICAgLlxuICAgICAgICAgICAgY1xuICAgICAgICAgICAgLlxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGRcbiAgICAgICAgLlxuICAgICAgICAgICAgZVxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIGZcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgW1xuICAgICAgICAgICAgICAgICdhJ1xuICAgICAgICAgICAgICAgICdiJ1xuICAgICAgICAgICAgICAgIFsnYycsIFtdLCBbW11dLCdkJ11cbiAgICAgICAgICAgICAgICBbJ2UnLCBbJ2YnXV1cbiAgICAgICAgICAgIF1cblxuICAgIGl0ICduZXN0ZWQgb2JqZWN0cycgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICBcbiAgICAgICAgYiAgXG4gICAgICAgICAgICBjXG4gICAgICAgICAgICBkXG4gICAgICAgICAgICAgICAgZSAgMFxuICAgICAgICAgICAgZiAgIDFcbiAgICAgICAgZ1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgICAgIGE6bnVsbFxuICAgICAgICAgICAgICAgIGI6XG4gICAgICAgICAgICAgICAgICAgIGM6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGU6IDBcbiAgICAgICAgICAgICAgICAgICAgZjogMVxuICAgICAgICAgICAgICAgIGc6IG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICBpdCAnY29tcGxleCBvYmplY3QnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgICBjXG4gICAgICAgICAgICBkXG4gICAgICAgIGUgZlxuICAgICAgICAgICAgZyAgaFxuICAgICAgICAxICBvbmUgIHR3byAgXG4gICAgICAgIGpcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICBrICBsXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgLnwgIHRydWV8ZmFsc2VcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6XG4gICAgICAgICAgICAgICAgYjogWydjJ11cbiAgICAgICAgICAgICAgICBkOiBudWxsXG4gICAgICAgICAgICAnZSBmJzpcbiAgICAgICAgICAgICAgICBnOiAnaCdcbiAgICAgICAgICAgICcxJzogJ29uZSAgdHdvJ1xuICAgICAgICAgICAgajogW3trOiAnbCd9LCAnLnwnOid0cnVlfGZhbHNlJ11cbiAgICAgICAgICAgIFxuXG4gICAgaXQgJ3NwYWNlcycgLT4gICAgXG4gICAgICAgIG8gPSB7YTogMSwgYjogMn1cbiAgICAgICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgMVxuICAgICAgICBiICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICAgYSAgMVxuICAgICAgICAgYiAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgICAgICBhICAxXG4gICAgICAgICAgICBiICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBhICAxXG4gICAgICAgIFxuICAgICAgICBiICAyXG4gICAgICAgIFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAga2V5ICAgICAgdmFsdWUgICB3aXRoICAgIHNvbWUgICAgc3BhY2VzICAgLiAgIFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCB7a2V5OiBcInZhbHVlICAgd2l0aCAgICBzb21lICAgIHNwYWNlcyAgIC5cIn1cbiAgICAgICAgXG4gICAgaXQgJ3doaXRlc3BhY2UgbGluZXMnIC0+XG4gICAgICAgIFxuICAgICAgICBvID0ge2E6IDEsIGI6IDJ9XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgIFxuICAgICAgICBhICAxXG4gICAgICAgICBcbiAgICAgICAgYiAgMlxuICAgICAgICAgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhICAxXG4gICAgICAgICAgICBcbiAgICAgICAgYiAgMlxuICAgICAgICAgICAgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cbiAgICAgICAgXG4gICAgaXQgJ2RlbnNlIG5vdGF0aW9uJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gYiAuLiBjIDEgLi4gZCAgMiAuLiBlIC4uLiB4IHkgeiAgLi4uIGYgLi4uLiBudWxsICBudWxsIC4uLiAzIC4uIGcgLiBoIFxuICAgICAgICBiICAuIGZvbyAuIGJhclxuICAgICAgICAgICAgZm9vXG4gICAgICAgICAgICBiYXJcbiAgICAgICAgYyAgLiBmb28gLi4gYmFya1xuICAgICAgICAgICAgZm9vICBiYXJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6XG4gICAgICAgICAgICAgICAgYjpcbiAgICAgICAgICAgICAgICAgICAgYzogMVxuICAgICAgICAgICAgICAgICAgICBkOiAyXG4gICAgICAgICAgICAgICAgICAgIGU6IFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogJ3kgeidcbiAgICAgICAgICAgICAgICAgICAgICAgIGY6IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdudWxsJzogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgJzMnOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIGc6IG51bGxcbiAgICAgICAgICAgICAgICBoOiBudWxsXG4gICAgICAgICAgICBiOiBbICdmb28nLCAnYmFyJywgJ2ZvbycsICdiYXInIF1cbiAgICAgICAgICAgIGM6IFxuICAgICAgICAgICAgICAgIGZvbzogJ2JhcidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gYiAuLiBjIDBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgIGI6XG4gICAgICAgICAgICAgICAgICAgIGM6IDBcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiBwYXRoIC4uL3NvbWUuZmlsZVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgcGF0aDogJy4uL3NvbWUuZmlsZSdcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiA/IHNvbWUgc2VudGVuY2UuIHNvbWUgb3RoZXIgc2VudGVuY2UuIC4gQTogbmV4dCBzZW50ZW5jZS4uLlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgJz8nOiAgJ3NvbWUgc2VudGVuY2UuIHNvbWUgb3RoZXIgc2VudGVuY2UuJ1xuICAgICAgICAgICAgICAgICdBOic6ICduZXh0IHNlbnRlbmNlLi4uJyBcblxuICAgIGl0ICdkZW5zZSBlc2NhcGVkJyAtPlxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHggfCAxfCAuIHkgfCAyIHwgLiB6IHwzIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgIHg6ICcgMSdcbiAgICAgICAgICAgICAgICB5OiAnIDIgJyBcbiAgICAgICAgICAgICAgICB6OiAnMyAnIFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHwgMXwgLiB8IDIgfCAuIHwzIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFsgJyAxJywgJyAyICcsICczICddIFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHwgMXwgYSAuIHwgMiB8IGIgLiB8MyB8IGNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgICcgMSc6ICAnYScgXG4gICAgICAgICAgICAgICAgJyAyICc6ICdiJ1xuICAgICAgICAgICAgICAgICczICc6ICAnYycgXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gfCAxfCAgIGEgfCAuIHwgMiB8IHwgYnwgLiB8MyB8IHxjIHggXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICAnIDEnOiAgJ2EgJyBcbiAgICAgICAgICAgICAgICAnIDIgJzogJyBiJ1xuICAgICAgICAgICAgICAgICczICc6ICAnYyB4JyBcblxuICAgIGl0ICdvbmUgbGluZSBub3RhdGlvbicgLT5cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImtleSAuIGEgOjogYiAuIGMgOjogZCAxIDo6IGUgMlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGtleTogWydhJ11cbiAgICAgICAgICAgIGI6ICAgWydjJ11cbiAgICAgICAgICAgIGQ6ICAgMVxuICAgICAgICAgICAgZTogICAyXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhIC4gYiAuLiBjIDRcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICBiOlxuICAgICAgICAgICAgICAgICAgICBjOiA0XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImEgMSA6OiBiIDIgOjogYyA1XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogMVxuICAgICAgICAgICAgYjogMlxuICAgICAgICAgICAgYzogNVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYTo6IGI6OiBjIDM6OiBkIDRcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBudWxsXG4gICAgICAgICAgICBiOiBudWxsXG4gICAgICAgICAgICBjOiAzXG4gICAgICAgICAgICBkOiA0XG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhICAgICAgOjogYiAgICAgICAgICA6OiBjOjogZCA0XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogbnVsbFxuICAgICAgICAgICAgYjogbnVsbFxuICAgICAgICAgICAgYzogbnVsbFxuICAgICAgICAgICAgZDogNFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAgICAgIDo6IGIgICAgICAgICAgOjogYzo6IGQgIFwiXG4gICAgICAgIC50by5lcWwgWydhJywgJ2InLCAnYycsICdkJ11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIjEgOjogMiA6OiAzIDo6IDRcIlxuICAgICAgICAudG8uZXFsIFsxLDIsMyw0XVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAuIDEgLiAyIDo6IGIgLiA2XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogWzEsMl1cbiAgICAgICAgICAgIGI6IFs2XVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAgICAgLiAgICAgMSAgICAgLiAgICAgMiAgICAgOjogYiAgICAuICAgNyAgICAgXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogWzEsMl1cbiAgICAgICAgICAgIGI6IFs3XVxuXG4gICAgaXQgJ2VzY2FwZScgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgIHwgMXxcbiAgICAgICAgIHwyIHxcbiAgICAgICAgIHwgMyB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFsnIDEnLCAnMiAnLCAnIDMgJ10gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgfCAxICAxICBcbiAgICAgICAgYiAgfCAyICAyICB8XG4gICAgICAgIGMgICAgMyAgMyAgfFxuICAgICAgICBkICB8fFxuICAgICAgICBlICB8IHxcbiAgICAgICAgZiAgfHx8XG4gICAgICAgIGcgIHx8IHwgfHwgXG4gICAgICAgIGggIHwuIC4gLiBcbiAgICAgICAgfGkgfCAgICAgICAgMVxuICAgICAgICB8IGp8ICAgICAgICAyIFxuICAgICAgICB8IGsgIGsgfCAgICAzICBcbiAgICAgICAgfGwgfCAgICAgICAgfCBsICAgIFxuICAgICAgICB8IG0gIG0gfCAgICBtIG0gIHwgICAgXG4gICAgICAgIHwgbiAgbiB8ICAgIHx8fHxcbiAgICAgICAgfCBvIG8gfFxuICAgICAgICB8IHAgICBwXG4gICAgICAgIHwgcSB8ICB8XG4gICAgICAgIHx8ICB8XG4gICAgICAgIHxyfDRcbiAgICAgICAgfHN8fCB8XG4gICAgICAgIHQgIHw1XG4gICAgICAgIHx1IHw2XG4gICAgICAgIHwufCAgLlxuICAgICAgICB8IHx0cnVlXG4gICAgICAgIHwjfHwjXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiAnIDEgIDEnXG4gICAgICAgICAgICBiOiAnIDIgIDIgICdcbiAgICAgICAgICAgIGM6ICczICAzICAnXG4gICAgICAgICAgICBkOiAnJ1xuICAgICAgICAgICAgZTogJyAnXG4gICAgICAgICAgICBmOiAnfCdcbiAgICAgICAgICAgIGc6ICd8IHwgfCdcbiAgICAgICAgICAgIGg6ICcuIC4gLidcbiAgICAgICAgICAgICdpICc6IDFcbiAgICAgICAgICAgICcgaic6IDJcbiAgICAgICAgICAgICcgayAgayAnOiAzXG4gICAgICAgICAgICAnbCAnOiAnIGwnXG4gICAgICAgICAgICAnIG0gIG0gJzogJ20gbSAgJ1xuICAgICAgICAgICAgJyBuICBuICc6ICd8fCdcbiAgICAgICAgICAgICcgbyBvICc6IG51bGxcbiAgICAgICAgICAgICcgcCAgIHAnOiBudWxsXG4gICAgICAgICAgICAnIHEgJzogJydcbiAgICAgICAgICAgICcnOiAnJ1xuICAgICAgICAgICAgJ3InOiA0XG4gICAgICAgICAgICAncyc6ICcgJ1xuICAgICAgICAgICAgJ3QnOiAnNSdcbiAgICAgICAgICAgICd1ICc6IDZcbiAgICAgICAgICAgICcuJzogJy4nXG4gICAgICAgICAgICAnICc6IHRydWVcbiAgICAgICAgICAgICcjJzogJyMnXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIiAgICBcbiAgICAgICAgfHwgICAgICB8fFxuICAgICAgICB8IHwgICAgIHwgfFxuICAgICAgICB8ICB8ICAgIHwgIHxcbiAgICAgICAgfCAuIHwgICB8IC4gfFxuICAgICAgICB8IC4uIHwgIHwgLi4gfFxuICAgICAgICB8IC4uLiAgIHx8XG4gICAgICAgIHwgLi4uLiAgfC58XG4gICAgICAgIHwgLi4uLi4gfC4gfFxuICAgICAgICB8IC4gICAgIHwgLiB8XG4gICAgICAgIHwgLi4gICAgfCAuLiB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFxuICAgICAgICAgICAgJycgICAgICAgOicnIFxuICAgICAgICAgICAgJyAnICAgICAgOicgJ1xuICAgICAgICAgICAgJyAgJyAgICAgOicgICcgXG4gICAgICAgICAgICAnIC4gJyAgICA6JyAuICcgICAgXG4gICAgICAgICAgICAnIC4uICcgICA6JyAuLiAnICAgXG4gICAgICAgICAgICAnIC4uLiAgICc6JydcbiAgICAgICAgICAgICcgLi4uLiAgJzonLidcbiAgICAgICAgICAgICcgLi4uLi4gJzonLiAnXG4gICAgICAgICAgICAnIC4gICAgICc6Jy4gJ1xuICAgICAgICAgICAgJyAuLiAgICAnOicuLiAnXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgJy4uLiBcXG58IDEgfFxcbiB8IDIgXFxuICAzICB8XFxuICAuLi4nXG4gICAgICAgIC50by5lcWwgWycgMSBcXG4gMlxcbjMgICddXG5cbiAgICBpdCAnY29tbWVudCcgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgIyB0aGlzIGlzIGEgY29tbWVudFxuICAgICAgICB0aGlzIGlzIHNvbWUgZGF0YVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBbJ3RoaXMgaXMgc29tZSBkYXRhJ11cblxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAxXG4gICAgICAgICAgICAjZm9vXG4gICAgICAgIGIgIDJcbiAgICAgICAgI2IgIDNcbiAgICAgICAgYyAgIDQgIyA1XG4gICAgICAgIGQgICBcbiAgICAgICAgICAgIDYgIyA3XG4gICAgICAgICMgIFxuICAgICAgICAjIyNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgXG4gICAgICAgICAgICBhOiAxXG4gICAgICAgICAgICBiOiAyXG4gICAgICAgICAgICBjOiAnNCAjIDUnXG4gICAgICAgICAgICBkOiBbJzYgIyA3J11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgMVxuICAgICAgICB8I3xcbiAgICAgICAgICAgIHwjXG4gICAgICAgICAgICB8ICMgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFxuICAgICAgICAgICAgYTogMVxuICAgICAgICAgICAgJyMnOiBbJyMnLCAnICMnXVxuICAgICAgICAgICAgXG4gICAgaXQgJ2VtcHR5IHN0cmluZycgLT4gXG4gICAgXG4gICAgICAgIGV4cGVjdChub29uLnBhcnNlKCcnKSkudG8uZXFsICcnXG4gICAgICAgIGV4cGVjdChub29uLnBhcnNlKCcgJykpLnRvLmVxbCAnJ1xuICAgICAgICBleHBlY3Qobm9vbi5wYXJzZSgpKS50by5lcWwgJydcblxuIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAwMDAgICAgICAwMDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMjI1xuXG5kZXNjcmliZSAnc3RyaW5naWZ5JyAtPlxuICAgIFxuICAgIGl0ICdudW1iZXInIC0+IFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5KDQyKVxuICAgICAgICAudG8uZXFsICc0MidcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSg2Ni42MDAwKVxuICAgICAgICAudG8uZXFsICc2Ni42J1xuICAgICAgICBcbiAgICBpdCAnYm9vbCcgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgZmFsc2VcbiAgICAgICAgLnRvLmVxbCAnZmFsc2UnXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgdHJ1ZVxuICAgICAgICAudG8uZXFsICd0cnVlJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5KFsnZmFsc2UnLCAndHJ1ZScsICcgZmFsc2UnLCAndHJ1ZSAgJ10pXG4gICAgICAgIC50by5lcWwgXCJcIlwiICAgICAgICBcbiAgICAgICAgZmFsc2VcbiAgICAgICAgdHJ1ZVxuICAgICAgICB8IGZhbHNlfFxuICAgICAgICB8dHJ1ZSAgfFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ251bGwnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgW251bGwsICcgbnVsbCAnXVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBudWxsXG4gICAgICAgIHwgbnVsbCB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnc3RyaW5nJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFwiaGVsbG8gd29ybGRcIlxuICAgICAgICAudG8uZXFsICdoZWxsbyB3b3JsZCdcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBcIiAuICAuLi4gIHx8fCBcIlxuICAgICAgICAudG8uZXFsICd8IC4gIC4uLiAgfHx8IHwnXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgXCI2Ni42MDAwXCJcbiAgICAgICAgLnRvLmVxbCAnNjYuNjAwMCdcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBcIjFcXG4yXFxuM1wiXG4gICAgICAgIC50by5lcWwgJy4uLlxcbjFcXG4yXFxuM1xcbi4uLidcbiAgICAgICAgXG4gICAgaXQgJ2Zsb2F0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgWzAuMjQsNjYuNl1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgMC4yNFxuICAgICAgICA2Ni42XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnbGlzdCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFsnYScsICdhMScsICdhIDEnXVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgIGExXG4gICAgICAgIGEgMVxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICdsaXN0IG9mIGxpc3RzIC4uLicgLT5cblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgW1sxLDJdLFs0LFs1XSxbWzZdXV0sWzddLFtdLFtbOCxbOSxbMTAsMTFdLDEyXV1dXVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICAuXG4gICAgICAgICAgICAxXG4gICAgICAgICAgICAyXG4gICAgICAgIC5cbiAgICAgICAgICAgIDRcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICA1XG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgIC5cbiAgICAgICAgICAgIDdcbiAgICAgICAgLlxuICAgICAgICAuXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgOFxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICAgICAgICAgMTFcbiAgICAgICAgICAgICAgICAgICAgMTJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdvYmplY3QnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB7YToxLCBiOjIsIGM6M31cbiAgICAgICAgLnRvLmVxbCBcIlwiXCIgICAgXG4gICAgICAgIGEgICAxXG4gICAgICAgIGIgICAyXG4gICAgICAgIGMgICAzXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgbyA9IGE6IDEsIGI6IDIgICAgXG4gICAgICAgIHIgPSBcIlwiXCJcbiAgICAgICAgYSAgIDFcbiAgICAgICAgYiAgIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvXG4gICAgICAgIC50by5lcWwgclxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6ICcgICdcbiAgICAgICAgLnRvLmVxbCByXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogMlxuICAgICAgICAudG8uZXFsIHJcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB7a2V5OiBcInZhbHVlICAgd2l0aCAgICBzb21lICAgIHNwYWNlcyAgLlwifVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBrZXkgIHZhbHVlICAgd2l0aCAgICBzb21lICAgIHNwYWNlcyAgLlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ2VzY2FwZScgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbXG4gICAgICAgICAgICAnJyBcbiAgICAgICAgICAgICcgJ1xuICAgICAgICAgICAgJyAgJ1xuICAgICAgICAgICAgJyAuICcgXG4gICAgICAgICAgICAnIC4uICdcbiAgICAgICAgICAgICcgLi4uICdcbiAgICAgICAgICAgICcgLicgXG4gICAgICAgICAgICAnIC4uJ1xuICAgICAgICAgICAgJyAuLi4nXG4gICAgICAgICAgICAnLiAnIFxuICAgICAgICAgICAgJy4uICdcbiAgICAgICAgICAgICcuLi4gJ1xuICAgICAgICAgICAgJ3wnXG4gICAgICAgICAgICAnfHwnXG4gICAgICAgICAgICAnIydcbiAgICAgICAgICAgICcjIGEnXG4gICAgICAgIF1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCIgICAgXG4gICAgICAgIHx8XG4gICAgICAgIHwgfFxuICAgICAgICB8ICB8XG4gICAgICAgIHwgLiB8XG4gICAgICAgIHwgLi4gfFxuICAgICAgICB8IC4uLiB8XG4gICAgICAgIHwgLnxcbiAgICAgICAgfCAuLnxcbiAgICAgICAgfCAuLi58XG4gICAgICAgIHwuIHxcbiAgICAgICAgfC4uIHxcbiAgICAgICAgfC4uLiB8XG4gICAgICAgIHx8fFxuICAgICAgICB8fHx8XG4gICAgICAgIHwjfFxuICAgICAgICB8IyBhfFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB7XG4gICAgICAgICAgICAnJyAgICAgICA6JycgXG4gICAgICAgICAgICAnICcgICAgICA6JyAnXG4gICAgICAgICAgICAnICAnICAgICA6JyAgJyBcbiAgICAgICAgICAgICcgLiAnICAgIDonIC4gJyAgICBcbiAgICAgICAgICAgICcgLi4gJyAgIDonIC4uICcgICBcbiAgICAgICAgICAgICcgLi4uICcgIDonIC58LiAnICAgIFxuICAgICAgICAgICAgJyAuJyAgICAgOicgLicgICBcbiAgICAgICAgICAgICcgLi4nICAgIDonIC4uJyAgXG4gICAgICAgICAgICAnIC4uLicgICA6JyAufC4nICAgXG4gICAgICAgICAgICAnLiAnICAgICA6Jy4gJyAgIFxuICAgICAgICAgICAgJy4uICcgICAgOicuLiAnICBcbiAgICAgICAgICAgICcuLi4gJyAgIDonLnwuICcgICBcbiAgICAgICAgICAgICcuICAuJyAgIDonfCdcbiAgICAgICAgICAgICcuICAgLicgIDonfHwnXG4gICAgICAgICAgICAnIycgICAgICA6JyMnXG4gICAgICAgICAgICAnIyBhJyAgICA6JyMgYidcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIC50by5lcWwgXCJcIlwiICAgIFxuICAgICAgICB8fCAgICAgIHx8XG4gICAgICAgIHwgfCAgICAgfCB8XG4gICAgICAgIHwgIHwgICAgfCAgfFxuICAgICAgICB8IC4gfCAgIHwgLiB8XG4gICAgICAgIHwgLi4gfCAgfCAuLiB8XG4gICAgICAgIHwgLi4uIHwgIHwgLnwuIHxcbiAgICAgICAgfCAufCAgICB8IC58XG4gICAgICAgIHwgLi58ICAgfCAuLnxcbiAgICAgICAgfCAuLi58ICB8IC58LnxcbiAgICAgICAgfC4gfCAgICB8LiB8XG4gICAgICAgIHwuLiB8ICAgfC4uIHxcbiAgICAgICAgfC4uLiB8ICB8LnwuIHxcbiAgICAgICAgfC4gIC58ICB8fHxcbiAgICAgICAgfC4gICAufCAgfHx8fFxuICAgICAgICB8I3wgICAgIHwjfFxuICAgICAgICB8IyBhfCAgIHwjIGJ8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFwiIDEgXFxuMiBcXG4gIDNcIlxuICAgICAgICAudG8uZXFsICcuLi5cXG58IDEgfFxcbnwyIHxcXG58ICAzfFxcbi4uLidcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbzogXCIgMSBcXG4yIFxcbiAgM1wiXG4gICAgICAgIC50by5lcWwgJ28gICAuLi5cXG58IDEgfFxcbnwyIHxcXG58ICAzfFxcbi4uLidcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBhOiBbXCJhICBiXCIsIFwiMSAgIDNcIiwgXCIgICBjICAgIGQgIGUgICBcIl1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgfGEgIGJ8XG4gICAgICAgICAgICB8MSAgIDN8XG4gICAgICAgICAgICB8ICAgYyAgICBkICBlICAgfFxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICd0cmltJyAtPlxuICAgICAgICBvID0gYTogMSwgYjogbnVsbCwgYzogMlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhICAxXG4gICAgICAgIGJcbiAgICAgICAgYyAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGFsaWduOiB0cnVlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGEgICAxXG4gICAgICAgIGJcbiAgICAgICAgYyAgIDJcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHthOiBiOiBjOiAxfSwgYWxpZ246IHRydWVcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgIGMgICAxXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB7eDogeTogejogMX0sIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICB4XG4gICAgICAgICAgICB5XG4gICAgICAgICAgICAgICAgeiAgMVxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICdtYXhhbGlnbicgLT5cbiAgICAgICAgbyA9IG86IDEsIG9vT09vbzogMlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgbWF4YWxpZ246IDJcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgbyAgMVxuICAgICAgICBvb09Pb28gIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBtYXhhbGlnbjogNFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBvICAgMVxuICAgICAgICBvb09Pb28gIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBtYXhhbGlnbjogOFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBvICAgICAgIDFcbiAgICAgICAgb29PT29vICAyXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBtYXhhbGlnbjogMThcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgbyAgICAgICAxXG4gICAgICAgIG9vT09vbyAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIHQgPSBmb29mb286IFxuICAgICAgICAgICAgIGJhcmJhcmJhcjogMVxuICAgICAgICAgICAgIGZvbzogMlxuICAgICAgICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgdFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBmb29mb29cbiAgICAgICAgICAgIGJhcmJhcmJhciAgIDFcbiAgICAgICAgICAgIGZvbyAgICAgICAgIDJcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHQsIGluZGVudDogM1xuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBmb29mb29cbiAgICAgICAgICAgYmFyYmFyYmFyICAgMVxuICAgICAgICAgICBmb28gICAgICAgICAyXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIHQgPSBcbiAgICAgICAgICAgIGZvb2JhcjogXG4gICAgICAgICAgICAgICAgYmFyZm9vOiAxXG4gICAgICAgICAgICAgICAgYmFyOiAyXG4gICAgICAgICAgICBmb286IFxuICAgICAgICAgICAgICAgIGJhcjogMVxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB0XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGZvb2JhclxuICAgICAgICAgICAgICAgIGJhcmZvbyAgMVxuICAgICAgICAgICAgICAgIGJhciAgICAgMlxuICAgICAgICBmb29cbiAgICAgICAgICAgICAgICBiYXIgIDFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdpbmRlbnQnIC0+XG4gICAgICAgIG8gPSBhOiBiOiBjOiAxXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6IDIsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgYlxuICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogNCwgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiA4LCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgIDFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6ICcgICcsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgYlxuICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogJyAgICAnLCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgIGMgIDFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6ICcgICAgICAgICcsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICdjb21tZW50JyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5ICcjJ1xuICAgICAgICAudG8uZXFsIFwifCN8XCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgJyNmb28nXG4gICAgICAgIC50by5lcWwgXCJ8I2Zvb3xcIlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbJyMjIycsICcjJywgJyAgIyAnXVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICB8IyMjfFxuICAgICAgICB8I3xcbiAgICAgICAgfCAgIyB8XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ2pzb24nIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB7XCJhXCI6IFwiYlwifSwgZXh0OiAnLmpzb24nLCBpbmRlbnQ6IDhcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiYVwiOiBcImJcIlxuICAgICAgICB9XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAncmVnZXhwJyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgWyAvXmhlbGxvXFxzd29ybGQkL2dpLCAvW1xcd1xcZF0qLyBdXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIF5oZWxsb1xcXFxzd29ybGQkXG4gICAgICAgIFtcXFxcd1xcXFxkXSpcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdyZWdleHAgdmFsdWVzJyAtPlxuICAgICAgICByZXN1bHQgPSBub29uLnN0cmluZ2lmeSB7YTogL15oZWxsb1xcc3dvcmxkJC9naSwgYjogL1tcXHdcXGRdKi99XG4gICAgICAgIGV4cGN0ZCA9IFwiYSAgIF5oZWxsb1xcXFxzd29ybGQkXFxuYiAgIFtcXFxcd1xcXFxkXSpcIlxuICAgICAgICBleHBlY3QocmVzdWx0KSAudG8uZXFsIGV4cGN0ZFxuXG4jIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbjAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAwMDAgICAgICAwMDAwMCAgICAgICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICBcbiMjI1xuXG5kZXNjcmliZSAnc3RyaW5naWZ5IGV4dCcgLT5cblxuICAgIG8gPSBhOiAxLCBiOiAyICAgIFxuICAgIGl0ICdzaG91bGQgb3V0cHV0IG5vb24gYnkgZGVmYXVsdCcgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgb1xuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhICAgMVxuICAgICAgICBiICAgMlxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICdzaG91bGQgb3V0cHV0IG5vb24nIC0+IFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGV4dDogJy5ub29uJ1xuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhICAgMVxuICAgICAgICBiICAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ3Nob3VsZCBvdXRwdXQganNvbicgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgZXh0OiAnLmpzb24nXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIHtcbiAgICAgICAgICAgIFwiYVwiOiAxLFxuICAgICAgICAgICAgXCJiXCI6IDJcbiAgICAgICAgfVxuICAgICAgICBcIlwiXCJcbiJdfQ==
//# sourceURL=test.coffee