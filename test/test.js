// koffee 0.56.0
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
    return it('comment', function() {
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
    it('should output json', function() {
        return expect(noon.stringify(o, {
            ext: '.json'
        })).to.eql("{\n    \"a\": 1,\n    \"b\": 2\n}");
    });
    return it('should output yaml', function() {
        return expect(noon.stringify(o, {
            ext: '.yaml'
        })).to.eql("a: 1\nb: 2\n");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsS0FBUjs7QUFDVCxNQUFBLEdBQVMsSUFBSSxDQUFDOztBQUNkLElBQUksQ0FBQyxNQUFMLENBQUE7O0FBRUEsUUFBQSxDQUFTLGtCQUFULEVBQTRCLFNBQUE7SUFFeEIsRUFBQSxDQUFHLHdCQUFILEVBQTRCLFNBQUE7ZUFDeEIsQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFiLENBQW1CLENBQUMsTUFBTSxDQUFDLEdBQTNCLENBQStCLFVBQS9CO0lBRHdCLENBQTVCO0lBRUEsRUFBQSxDQUFHLDRCQUFILEVBQWdDLFNBQUE7ZUFDNUIsQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFiLENBQXVCLENBQUMsTUFBTSxDQUFDLEdBQS9CLENBQW1DLFVBQW5DO0lBRDRCLENBQWhDO0lBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTJCLFNBQUE7ZUFDdkIsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFiLENBQWtCLENBQUMsTUFBTSxDQUFDLEdBQTFCLENBQThCLFVBQTlCO0lBRHVCLENBQTNCO1dBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTJCLFNBQUE7ZUFDdkIsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFiLENBQWtCLENBQUMsTUFBTSxDQUFDLEdBQTFCLENBQThCLFVBQTlCO0lBRHVCLENBQTNCO0FBUndCLENBQTVCOztBQWlCQSxRQUFBLENBQVMsTUFBVCxFQUFnQixTQUFBO0FBRVosUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsV0FBckI7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QUFLLE9BQUw7U0FBbEIsQ0FBUCxDQUNBLENBQUMsRUFBRSxDQUFDLEdBREosQ0FDUSxjQURSO0lBRm9CLENBQXhCO0FBN0JxQixDQUF6QiIsInNvdXJjZXNDb250ZW50IjpbImFzc2VydCA9IHJlcXVpcmUgJ2Fzc2VydCdcbmNoYWkgICA9IHJlcXVpcmUgJ2NoYWknXG5wYXRoICAgPSByZXF1aXJlICdwYXRoJ1xuZnMgICAgID0gcmVxdWlyZSAnZnMnXG5ub29uICAgPSByZXF1aXJlICcuLi8nXG5leHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS5zaG91bGQoKVxuXG5kZXNjcmliZSAnbW9kdWxlIGludGVyZmFjZScgLT5cbiAgICBcbiAgICBpdCAnc2hvdWxkIGltcGxlbWVudCBwYXJzZScgLT5cbiAgICAgICAgKHR5cGVvZiBub29uLnBhcnNlKS5zaG91bGQuZXFsICdmdW5jdGlvbidcbiAgICBpdCAnc2hvdWxkIGltcGxlbWVudCBzdHJpbmdpZnknIC0+XG4gICAgICAgICh0eXBlb2Ygbm9vbi5zdHJpbmdpZnkpLnNob3VsZC5lcWwgJ2Z1bmN0aW9uJ1xuICAgIGl0ICdzaG91bGQgaW1wbGVtZW50IGxvYWQnIC0+XG4gICAgICAgICh0eXBlb2Ygbm9vbi5sb2FkKS5zaG91bGQuZXFsICdmdW5jdGlvbidcbiAgICBpdCAnc2hvdWxkIGltcGxlbWVudCBzYXZlJyAtPlxuICAgICAgICAodHlwZW9mIG5vb24uc2F2ZSkuc2hvdWxkLmVxbCAnZnVuY3Rpb24nXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuZGVzY3JpYmUgJ2xvYWQnIC0+XG4gICAgXG4gICAgdGVzdE5vb24gPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAndGVzdC5ub29uJ1xuICAgIFxuICAgIGl0ICdzeW5jJyAtPlxuICAgICAgICBcbiAgICAgICAgciA9IG5vb24ubG9hZCB0ZXN0Tm9vblxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IHIubnVtYmVyLmludCBcbiAgICAgICAgLnRvLmVxbCA0MlxuXG4gICAgaXQgJ2FzeW5jJywgKGRvbmUpIC0+XG4gICAgICAgIFxuICAgICAgICBub29uLmxvYWQgdGVzdE5vb24sIChyKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgci5udW1iZXIuaW50IFxuICAgICAgICAgICAgLnRvLmVxbCA0MlxuICAgICAgICAgICAgZG9uZSgpXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuXG5kZXNjcmliZSAnc2F2ZScgLT5cbiAgICBcbiAgICB3cml0ZU5vb24gPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnd3JpdGUubm9vbidcbiAgICB3cml0ZURhdGEgPSBoZWxsbzogJ3dvcmxkJ1xuICAgIFxuICAgIGl0ICdzeW5jJyAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5IFxuICAgICAgICAgICAgZnMudW5saW5rU3luYyB3cml0ZU5vb25cbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICAgICBub29uLnNhdmUgd3JpdGVOb29uLCB3cml0ZURhdGFcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLmxvYWQgd3JpdGVOb29uXG4gICAgICAgIC50by5lcWwgd3JpdGVEYXRhXG4gICAgICAgIFxuICAgIGl0ICdhc3luYycsIChkb25lKSAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5IFxuICAgICAgICAgICAgZnMudW5saW5rU3luYyB3cml0ZU5vb25cbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICAgICBub29uLnNhdmUgd3JpdGVOb29uLCB3cml0ZURhdGEsIChlcnIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBlcnJcbiAgICAgICAgICAgIC50by5lcWwgbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qgbm9vbi5sb2FkIHdyaXRlTm9vblxuICAgICAgICAgICAgLnRvLmVxbCB3cml0ZURhdGFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZG9uZSgpXG4gICAgICAgICAgICBcbiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDBcbiMjI1xuXG5kZXNjcmliZSAncGFyc2UnIC0+XG4gICAgXG4gICAgaXQgJ251bWJlcicgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiNjY2XCJcbiAgICAgICAgLnRvLmVxbCBbNjY2XVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCIxLjIzXCJcbiAgICAgICAgLnRvLmVxbCBbMS4yM11cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiMC4wMDBcIlxuICAgICAgICAudG8uZXFsIFswXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJJbmZpbml0eVwiXG4gICAgICAgIC50by5lcWwgW0luZmluaXR5XVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIDQyXG4gICAgICAgIDY2LjBcbiAgICAgICAgMC40MlxuICAgICAgICA2Ni42MFxuICAgICAgICBJbmZpbml0eVxuICAgICAgICArMjBcbiAgICAgICAgLTIwXG4gICAgICAgICswXG4gICAgICAgIC0xLjIzXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFs0Miw2NiwwLjQyLDY2LjYsSW5maW5pdHksMjAsLTIwLDAsLTEuMjNdXG4gICAgICAgIFxuICAgIGl0ICdib29sJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJ0cnVlXCJcbiAgICAgICAgLnRvLmVxbCBbdHJ1ZV1cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICB0cnVlXG4gICAgICAgIGZhbHNlXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFt0cnVlLGZhbHNlXVxuICAgICAgICBcbiAgICBpdCAnbnVsbCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIG51bGxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgW251bGxdICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIGl0ICdzdHJpbmcnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImhlbGxvIHdvcmxkXCJcbiAgICAgICAgLnRvLmVxbCBbJ2hlbGxvIHdvcmxkJ11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcInwgaGVsbG8gd29ybGQgfFwiXG4gICAgICAgIC50by5lcWwgWycgaGVsbG8gd29ybGQgJ11cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlKCd8IC4gIC4uLiB8ICAnKVxuICAgICAgICAudG8uZXFsIFsnIC4gIC4uLiAnXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJ8NjYuNjAwMHxcIlxuICAgICAgICAudG8uZXFsIFsnNjYuNjAwMCddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCI2LjYuNlwiXG4gICAgICAgIC50by5lcWwgWyc2LjYuNiddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJeMS4yXCJcbiAgICAgICAgLnRvLmVxbCBbJ14xLjInXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiKysyXCJcbiAgICAgICAgLnRvLmVxbCBbJysrMiddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCIrLTBcIlxuICAgICAgICAudG8uZXFsIFsnKy0wJ11cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlKCcuLi4gXFxuIGxpbmUgMSBcXG4gbGluZSAyIFxcbiAuLi4nKVxuICAgICAgICAudG8uZXFsIFsnbGluZSAxXFxubGluZSAyJ11cblxuICAgICAgICAgICAgICAgIFxuICAgIGl0ICdsaXN0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZShcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICBhMVxuICAgICAgICBhIDFcbiAgICAgICAgXCJcIlwiKVxuICAgICAgICAudG8uZXFsIFsnYScsICdhMScsICdhIDEnXVxuICAgICAgICBcbiAgICBpdCAnb2JqZWN0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgXG4gICAgICAgIGIgIFxuICAgICAgICBjICAzXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIGE6bnVsbCwgYjpudWxsLCBjOjNcbiAgICAgICAgXG4gICAgaXQgJ25lc3RlZCBsaXN0cycgLT5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIFxuICAgICAgICBiICBcbiAgICAgICAgLlxuICAgICAgICAgICAgY1xuICAgICAgICAgICAgLlxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGRcbiAgICAgICAgLlxuICAgICAgICAgICAgZVxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIGZcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgW1xuICAgICAgICAgICAgICAgICdhJ1xuICAgICAgICAgICAgICAgICdiJ1xuICAgICAgICAgICAgICAgIFsnYycsIFtdLCBbW11dLCdkJ11cbiAgICAgICAgICAgICAgICBbJ2UnLCBbJ2YnXV1cbiAgICAgICAgICAgIF1cblxuICAgIGl0ICduZXN0ZWQgb2JqZWN0cycgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICBcbiAgICAgICAgYiAgXG4gICAgICAgICAgICBjXG4gICAgICAgICAgICBkXG4gICAgICAgICAgICAgICAgZSAgMFxuICAgICAgICAgICAgZiAgIDFcbiAgICAgICAgZ1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgICAgIGE6bnVsbFxuICAgICAgICAgICAgICAgIGI6XG4gICAgICAgICAgICAgICAgICAgIGM6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGU6IDBcbiAgICAgICAgICAgICAgICAgICAgZjogMVxuICAgICAgICAgICAgICAgIGc6IG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICBpdCAnY29tcGxleCBvYmplY3QnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgICBjXG4gICAgICAgICAgICBkXG4gICAgICAgIGUgZlxuICAgICAgICAgICAgZyAgaFxuICAgICAgICAxICBvbmUgIHR3byAgXG4gICAgICAgIGpcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICBrICBsXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgLnwgIHRydWV8ZmFsc2VcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6XG4gICAgICAgICAgICAgICAgYjogWydjJ11cbiAgICAgICAgICAgICAgICBkOiBudWxsXG4gICAgICAgICAgICAnZSBmJzpcbiAgICAgICAgICAgICAgICBnOiAnaCdcbiAgICAgICAgICAgICcxJzogJ29uZSAgdHdvJ1xuICAgICAgICAgICAgajogW3trOiAnbCd9LCAnLnwnOid0cnVlfGZhbHNlJ11cbiAgICAgICAgICAgIFxuXG4gICAgaXQgJ3NwYWNlcycgLT4gICAgXG4gICAgICAgIG8gPSB7YTogMSwgYjogMn1cbiAgICAgICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgMVxuICAgICAgICBiICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICAgYSAgMVxuICAgICAgICAgYiAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgICAgICBhICAxXG4gICAgICAgICAgICBiICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBhICAxXG4gICAgICAgIFxuICAgICAgICBiICAyXG4gICAgICAgIFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAga2V5ICAgICAgdmFsdWUgICB3aXRoICAgIHNvbWUgICAgc3BhY2VzICAgLiAgIFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCB7a2V5OiBcInZhbHVlICAgd2l0aCAgICBzb21lICAgIHNwYWNlcyAgIC5cIn1cbiAgICAgICAgXG4gICAgaXQgJ3doaXRlc3BhY2UgbGluZXMnIC0+XG4gICAgICAgIFxuICAgICAgICBvID0ge2E6IDEsIGI6IDJ9XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgIFxuICAgICAgICBhICAxXG4gICAgICAgICBcbiAgICAgICAgYiAgMlxuICAgICAgICAgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhICAxXG4gICAgICAgICAgICBcbiAgICAgICAgYiAgMlxuICAgICAgICAgICAgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cbiAgICAgICAgXG4gICAgaXQgJ2RlbnNlIG5vdGF0aW9uJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gYiAuLiBjIDEgLi4gZCAgMiAuLiBlIC4uLiB4IHkgeiAgLi4uIGYgLi4uLiBudWxsICBudWxsIC4uLiAzIC4uIGcgLiBoIFxuICAgICAgICBiICAuIGZvbyAuIGJhclxuICAgICAgICAgICAgZm9vXG4gICAgICAgICAgICBiYXJcbiAgICAgICAgYyAgLiBmb28gLi4gYmFya1xuICAgICAgICAgICAgZm9vICBiYXJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6XG4gICAgICAgICAgICAgICAgYjpcbiAgICAgICAgICAgICAgICAgICAgYzogMVxuICAgICAgICAgICAgICAgICAgICBkOiAyXG4gICAgICAgICAgICAgICAgICAgIGU6IFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogJ3kgeidcbiAgICAgICAgICAgICAgICAgICAgICAgIGY6IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdudWxsJzogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgJzMnOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIGc6IG51bGxcbiAgICAgICAgICAgICAgICBoOiBudWxsXG4gICAgICAgICAgICBiOiBbICdmb28nLCAnYmFyJywgJ2ZvbycsICdiYXInIF1cbiAgICAgICAgICAgIGM6IFxuICAgICAgICAgICAgICAgIGZvbzogJ2JhcidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gYiAuLiBjIDBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgIGI6XG4gICAgICAgICAgICAgICAgICAgIGM6IDBcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiBwYXRoIC4uL3NvbWUuZmlsZVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgcGF0aDogJy4uL3NvbWUuZmlsZSdcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiA/IHNvbWUgc2VudGVuY2UuIHNvbWUgb3RoZXIgc2VudGVuY2UuIC4gQTogbmV4dCBzZW50ZW5jZS4uLlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgJz8nOiAgJ3NvbWUgc2VudGVuY2UuIHNvbWUgb3RoZXIgc2VudGVuY2UuJ1xuICAgICAgICAgICAgICAgICdBOic6ICduZXh0IHNlbnRlbmNlLi4uJyBcblxuICAgIGl0ICdkZW5zZSBlc2NhcGVkJyAtPlxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHggfCAxfCAuIHkgfCAyIHwgLiB6IHwzIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgIHg6ICcgMSdcbiAgICAgICAgICAgICAgICB5OiAnIDIgJyBcbiAgICAgICAgICAgICAgICB6OiAnMyAnIFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHwgMXwgLiB8IDIgfCAuIHwzIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFsgJyAxJywgJyAyICcsICczICddIFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHwgMXwgYSAuIHwgMiB8IGIgLiB8MyB8IGNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgICcgMSc6ICAnYScgXG4gICAgICAgICAgICAgICAgJyAyICc6ICdiJ1xuICAgICAgICAgICAgICAgICczICc6ICAnYycgXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gfCAxfCAgIGEgfCAuIHwgMiB8IHwgYnwgLiB8MyB8IHxjIHggXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICAnIDEnOiAgJ2EgJyBcbiAgICAgICAgICAgICAgICAnIDIgJzogJyBiJ1xuICAgICAgICAgICAgICAgICczICc6ICAnYyB4JyBcblxuICAgIGl0ICdvbmUgbGluZSBub3RhdGlvbicgLT5cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImtleSAuIGEgOjogYiAuIGMgOjogZCAxIDo6IGUgMlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGtleTogWydhJ11cbiAgICAgICAgICAgIGI6ICAgWydjJ11cbiAgICAgICAgICAgIGQ6ICAgMVxuICAgICAgICAgICAgZTogICAyXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhIC4gYiAuLiBjIDRcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICBiOlxuICAgICAgICAgICAgICAgICAgICBjOiA0XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImEgMSA6OiBiIDIgOjogYyA1XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogMVxuICAgICAgICAgICAgYjogMlxuICAgICAgICAgICAgYzogNVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYTo6IGI6OiBjIDM6OiBkIDRcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBudWxsXG4gICAgICAgICAgICBiOiBudWxsXG4gICAgICAgICAgICBjOiAzXG4gICAgICAgICAgICBkOiA0XG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhICAgICAgOjogYiAgICAgICAgICA6OiBjOjogZCA0XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogbnVsbFxuICAgICAgICAgICAgYjogbnVsbFxuICAgICAgICAgICAgYzogbnVsbFxuICAgICAgICAgICAgZDogNFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAgICAgIDo6IGIgICAgICAgICAgOjogYzo6IGQgIFwiXG4gICAgICAgIC50by5lcWwgWydhJywgJ2InLCAnYycsICdkJ11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIjEgOjogMiA6OiAzIDo6IDRcIlxuICAgICAgICAudG8uZXFsIFsxLDIsMyw0XVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAuIDEgLiAyIDo6IGIgLiA2XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogWzEsMl1cbiAgICAgICAgICAgIGI6IFs2XVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAgICAgLiAgICAgMSAgICAgLiAgICAgMiAgICAgOjogYiAgICAuICAgNyAgICAgXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogWzEsMl1cbiAgICAgICAgICAgIGI6IFs3XVxuXG4gICAgaXQgJ2VzY2FwZScgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgIHwgMXxcbiAgICAgICAgIHwyIHxcbiAgICAgICAgIHwgMyB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFsnIDEnLCAnMiAnLCAnIDMgJ10gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgfCAxICAxICBcbiAgICAgICAgYiAgfCAyICAyICB8XG4gICAgICAgIGMgICAgMyAgMyAgfFxuICAgICAgICBkICB8fFxuICAgICAgICBlICB8IHxcbiAgICAgICAgZiAgfHx8XG4gICAgICAgIGcgIHx8IHwgfHwgXG4gICAgICAgIGggIHwuIC4gLiBcbiAgICAgICAgfGkgfCAgICAgICAgMVxuICAgICAgICB8IGp8ICAgICAgICAyIFxuICAgICAgICB8IGsgIGsgfCAgICAzICBcbiAgICAgICAgfGwgfCAgICAgICAgfCBsICAgIFxuICAgICAgICB8IG0gIG0gfCAgICBtIG0gIHwgICAgXG4gICAgICAgIHwgbiAgbiB8ICAgIHx8fHxcbiAgICAgICAgfCBvIG8gfFxuICAgICAgICB8IHAgICBwXG4gICAgICAgIHwgcSB8ICB8XG4gICAgICAgIHx8ICB8XG4gICAgICAgIHxyfDRcbiAgICAgICAgfHN8fCB8XG4gICAgICAgIHQgIHw1XG4gICAgICAgIHx1IHw2XG4gICAgICAgIHwufCAgLlxuICAgICAgICB8IHx0cnVlXG4gICAgICAgIHwjfHwjXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiAnIDEgIDEnXG4gICAgICAgICAgICBiOiAnIDIgIDIgICdcbiAgICAgICAgICAgIGM6ICczICAzICAnXG4gICAgICAgICAgICBkOiAnJ1xuICAgICAgICAgICAgZTogJyAnXG4gICAgICAgICAgICBmOiAnfCdcbiAgICAgICAgICAgIGc6ICd8IHwgfCdcbiAgICAgICAgICAgIGg6ICcuIC4gLidcbiAgICAgICAgICAgICdpICc6IDFcbiAgICAgICAgICAgICcgaic6IDJcbiAgICAgICAgICAgICcgayAgayAnOiAzXG4gICAgICAgICAgICAnbCAnOiAnIGwnXG4gICAgICAgICAgICAnIG0gIG0gJzogJ20gbSAgJ1xuICAgICAgICAgICAgJyBuICBuICc6ICd8fCdcbiAgICAgICAgICAgICcgbyBvICc6IG51bGxcbiAgICAgICAgICAgICcgcCAgIHAnOiBudWxsXG4gICAgICAgICAgICAnIHEgJzogJydcbiAgICAgICAgICAgICcnOiAnJ1xuICAgICAgICAgICAgJ3InOiA0XG4gICAgICAgICAgICAncyc6ICcgJ1xuICAgICAgICAgICAgJ3QnOiAnNSdcbiAgICAgICAgICAgICd1ICc6IDZcbiAgICAgICAgICAgICcuJzogJy4nXG4gICAgICAgICAgICAnICc6IHRydWVcbiAgICAgICAgICAgICcjJzogJyMnXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIiAgICBcbiAgICAgICAgfHwgICAgICB8fFxuICAgICAgICB8IHwgICAgIHwgfFxuICAgICAgICB8ICB8ICAgIHwgIHxcbiAgICAgICAgfCAuIHwgICB8IC4gfFxuICAgICAgICB8IC4uIHwgIHwgLi4gfFxuICAgICAgICB8IC4uLiAgIHx8XG4gICAgICAgIHwgLi4uLiAgfC58XG4gICAgICAgIHwgLi4uLi4gfC4gfFxuICAgICAgICB8IC4gICAgIHwgLiB8XG4gICAgICAgIHwgLi4gICAgfCAuLiB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFxuICAgICAgICAgICAgJycgICAgICAgOicnIFxuICAgICAgICAgICAgJyAnICAgICAgOicgJ1xuICAgICAgICAgICAgJyAgJyAgICAgOicgICcgXG4gICAgICAgICAgICAnIC4gJyAgICA6JyAuICcgICAgXG4gICAgICAgICAgICAnIC4uICcgICA6JyAuLiAnICAgXG4gICAgICAgICAgICAnIC4uLiAgICc6JydcbiAgICAgICAgICAgICcgLi4uLiAgJzonLidcbiAgICAgICAgICAgICcgLi4uLi4gJzonLiAnXG4gICAgICAgICAgICAnIC4gICAgICc6Jy4gJ1xuICAgICAgICAgICAgJyAuLiAgICAnOicuLiAnXG4gICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgJy4uLiBcXG58IDEgfFxcbiB8IDIgXFxuICAzICB8XFxuICAuLi4nXG4gICAgICAgIC50by5lcWwgWycgMSBcXG4gMlxcbjMgICddXG5cbiAgICBpdCAnY29tbWVudCcgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgIyB0aGlzIGlzIGEgY29tbWVudFxuICAgICAgICB0aGlzIGlzIHNvbWUgZGF0YVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBbJ3RoaXMgaXMgc29tZSBkYXRhJ11cblxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAxXG4gICAgICAgICAgICAjZm9vXG4gICAgICAgIGIgIDJcbiAgICAgICAgI2IgIDNcbiAgICAgICAgYyAgIDQgIyA1XG4gICAgICAgIGQgICBcbiAgICAgICAgICAgIDYgIyA3XG4gICAgICAgICMgIFxuICAgICAgICAjIyNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgXG4gICAgICAgICAgICBhOiAxXG4gICAgICAgICAgICBiOiAyXG4gICAgICAgICAgICBjOiAnNCAjIDUnXG4gICAgICAgICAgICBkOiBbJzYgIyA3J11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgMVxuICAgICAgICB8I3xcbiAgICAgICAgICAgIHwjXG4gICAgICAgICAgICB8ICMgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFxuICAgICAgICAgICAgYTogMVxuICAgICAgICAgICAgJyMnOiBbJyMnLCAnICMnXVxuXG4jIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAwMCAgICAgIDAwMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdzdHJpbmdpZnknIC0+XG4gICAgXG4gICAgaXQgJ251bWJlcicgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkoNDIpXG4gICAgICAgIC50by5lcWwgJzQyJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5KDY2LjYwMDApXG4gICAgICAgIC50by5lcWwgJzY2LjYnXG4gICAgICAgIFxuICAgIGl0ICdib29sJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBmYWxzZVxuICAgICAgICAudG8uZXFsICdmYWxzZSdcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB0cnVlXG4gICAgICAgIC50by5lcWwgJ3RydWUnXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkoWydmYWxzZScsICd0cnVlJywgJyBmYWxzZScsICd0cnVlICAnXSlcbiAgICAgICAgLnRvLmVxbCBcIlwiXCIgICAgICAgIFxuICAgICAgICBmYWxzZVxuICAgICAgICB0cnVlXG4gICAgICAgIHwgZmFsc2V8XG4gICAgICAgIHx0cnVlICB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnbnVsbCcgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbbnVsbCwgJyBudWxsICddXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG51bGxcbiAgICAgICAgfCBudWxsIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdzdHJpbmcnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgXCJoZWxsbyB3b3JsZFwiXG4gICAgICAgIC50by5lcWwgJ2hlbGxvIHdvcmxkJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFwiIC4gIC4uLiAgfHx8IFwiXG4gICAgICAgIC50by5lcWwgJ3wgLiAgLi4uICB8fHwgfCdcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBcIjY2LjYwMDBcIlxuICAgICAgICAudG8uZXFsICc2Ni42MDAwJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFwiMVxcbjJcXG4zXCJcbiAgICAgICAgLnRvLmVxbCAnLi4uXFxuMVxcbjJcXG4zXFxuLi4uJ1xuICAgICAgICBcbiAgICBpdCAnZmxvYXQnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbMC4yNCw2Ni42XVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICAwLjI0XG4gICAgICAgIDY2LjZcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdsaXN0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgWydhJywgJ2ExJywgJ2EgMSddXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgYTFcbiAgICAgICAgYSAxXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ2xpc3Qgb2YgbGlzdHMgLi4uJyAtPlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbWzEsMl0sWzQsWzVdLFtbNl1dXSxbN10sW10sW1s4LFs5LFsxMCwxMV0sMTJdXV1dXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIC5cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIDJcbiAgICAgICAgLlxuICAgICAgICAgICAgNFxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIDVcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgLlxuICAgICAgICAgICAgN1xuICAgICAgICAuXG4gICAgICAgIC5cbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgICAgICAgICAxMVxuICAgICAgICAgICAgICAgICAgICAxMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ29iamVjdCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHthOjEsIGI6MiwgYzozfVxuICAgICAgICAudG8uZXFsIFwiXCJcIiAgICBcbiAgICAgICAgYSAgIDFcbiAgICAgICAgYiAgIDJcbiAgICAgICAgYyAgIDNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBvID0gYTogMSwgYjogMiAgICBcbiAgICAgICAgciA9IFwiXCJcIlxuICAgICAgICBhICAgMVxuICAgICAgICBiICAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG9cbiAgICAgICAgLnRvLmVxbCByXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogJyAgJ1xuICAgICAgICAudG8uZXFsIHJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAyXG4gICAgICAgIC50by5lcWwgclxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHtrZXk6IFwidmFsdWUgICB3aXRoICAgIHNvbWUgICAgc3BhY2VzICAuXCJ9XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGtleSAgdmFsdWUgICB3aXRoICAgIHNvbWUgICAgc3BhY2VzICAuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnZXNjYXBlJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFtcbiAgICAgICAgICAgICcnIFxuICAgICAgICAgICAgJyAnXG4gICAgICAgICAgICAnICAnXG4gICAgICAgICAgICAnIC4gJyBcbiAgICAgICAgICAgICcgLi4gJ1xuICAgICAgICAgICAgJyAuLi4gJ1xuICAgICAgICAgICAgJyAuJyBcbiAgICAgICAgICAgICcgLi4nXG4gICAgICAgICAgICAnIC4uLidcbiAgICAgICAgICAgICcuICcgXG4gICAgICAgICAgICAnLi4gJ1xuICAgICAgICAgICAgJy4uLiAnXG4gICAgICAgICAgICAnfCdcbiAgICAgICAgICAgICd8fCdcbiAgICAgICAgICAgICcjJ1xuICAgICAgICAgICAgJyMgYSdcbiAgICAgICAgXVxuICAgICAgICAudG8uZXFsIFwiXCJcIiAgICBcbiAgICAgICAgfHxcbiAgICAgICAgfCB8XG4gICAgICAgIHwgIHxcbiAgICAgICAgfCAuIHxcbiAgICAgICAgfCAuLiB8XG4gICAgICAgIHwgLi4uIHxcbiAgICAgICAgfCAufFxuICAgICAgICB8IC4ufFxuICAgICAgICB8IC4uLnxcbiAgICAgICAgfC4gfFxuICAgICAgICB8Li4gfFxuICAgICAgICB8Li4uIHxcbiAgICAgICAgfHx8XG4gICAgICAgIHx8fHxcbiAgICAgICAgfCN8XG4gICAgICAgIHwjIGF8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHtcbiAgICAgICAgICAgICcnICAgICAgIDonJyBcbiAgICAgICAgICAgICcgJyAgICAgIDonICdcbiAgICAgICAgICAgICcgICcgICAgIDonICAnIFxuICAgICAgICAgICAgJyAuICcgICAgOicgLiAnICAgIFxuICAgICAgICAgICAgJyAuLiAnICAgOicgLi4gJyAgIFxuICAgICAgICAgICAgJyAuLi4gJyAgOicgLnwuICcgICAgXG4gICAgICAgICAgICAnIC4nICAgICA6JyAuJyAgIFxuICAgICAgICAgICAgJyAuLicgICAgOicgLi4nICBcbiAgICAgICAgICAgICcgLi4uJyAgIDonIC58LicgICBcbiAgICAgICAgICAgICcuICcgICAgIDonLiAnICAgXG4gICAgICAgICAgICAnLi4gJyAgICA6Jy4uICcgIFxuICAgICAgICAgICAgJy4uLiAnICAgOicufC4gJyAgIFxuICAgICAgICAgICAgJy4gIC4nICAgOid8J1xuICAgICAgICAgICAgJy4gICAuJyAgOid8fCdcbiAgICAgICAgICAgICcjJyAgICAgIDonIydcbiAgICAgICAgICAgICcjIGEnICAgIDonIyBiJ1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCIgICAgXG4gICAgICAgIHx8ICAgICAgfHxcbiAgICAgICAgfCB8ICAgICB8IHxcbiAgICAgICAgfCAgfCAgICB8ICB8XG4gICAgICAgIHwgLiB8ICAgfCAuIHxcbiAgICAgICAgfCAuLiB8ICB8IC4uIHxcbiAgICAgICAgfCAuLi4gfCAgfCAufC4gfFxuICAgICAgICB8IC58ICAgIHwgLnxcbiAgICAgICAgfCAuLnwgICB8IC4ufFxuICAgICAgICB8IC4uLnwgIHwgLnwufFxuICAgICAgICB8LiB8ICAgIHwuIHxcbiAgICAgICAgfC4uIHwgICB8Li4gfFxuICAgICAgICB8Li4uIHwgIHwufC4gfFxuICAgICAgICB8LiAgLnwgIHx8fFxuICAgICAgICB8LiAgIC58ICB8fHx8XG4gICAgICAgIHwjfCAgICAgfCN8XG4gICAgICAgIHwjIGF8ICAgfCMgYnxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgXCIgMSBcXG4yIFxcbiAgM1wiXG4gICAgICAgIC50by5lcWwgJy4uLlxcbnwgMSB8XFxufDIgfFxcbnwgIDN8XFxuLi4uJ1xuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvOiBcIiAxIFxcbjIgXFxuICAzXCJcbiAgICAgICAgLnRvLmVxbCAnbyAgIC4uLlxcbnwgMSB8XFxufDIgfFxcbnwgIDN8XFxuLi4uJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IGE6IFtcImEgIGJcIiwgXCIxICAgM1wiLCBcIiAgIGMgICAgZCAgZSAgIFwiXVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICB8YSAgYnxcbiAgICAgICAgICAgIHwxICAgM3xcbiAgICAgICAgICAgIHwgICBjICAgIGQgIGUgICB8XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ3RyaW0nIC0+XG4gICAgICAgIG8gPSBhOiAxLCBiOiBudWxsLCBjOiAyXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGEgIDFcbiAgICAgICAgYlxuICAgICAgICBjICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgYWxpZ246IHRydWVcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYSAgIDFcbiAgICAgICAgYlxuICAgICAgICBjICAgMlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkge2E6IGI6IGM6IDF9LCBhbGlnbjogdHJ1ZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgYyAgIDFcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHt4OiB5OiB6OiAxfSwgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIHhcbiAgICAgICAgICAgIHlcbiAgICAgICAgICAgICAgICB6ICAxXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ21heGFsaWduJyAtPlxuICAgICAgICBvID0gbzogMSwgb29PT29vOiAyXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBtYXhhbGlnbjogMlxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBvICAxXG4gICAgICAgIG9vT09vbyAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIG1heGFsaWduOiA0XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG8gICAxXG4gICAgICAgIG9vT09vbyAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIG1heGFsaWduOiA4XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG8gICAgICAgMVxuICAgICAgICBvb09Pb28gIDJcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIG1heGFsaWduOiAxOFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBvICAgICAgIDFcbiAgICAgICAgb29PT29vICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgdCA9IGZvb2ZvbzogXG4gICAgICAgICAgICAgYmFyYmFyYmFyOiAxXG4gICAgICAgICAgICAgZm9vOiAyXG4gICAgICAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB0XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGZvb2Zvb1xuICAgICAgICAgICAgYmFyYmFyYmFyICAgMVxuICAgICAgICAgICAgZm9vICAgICAgICAgMlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgdCwgaW5kZW50OiAzXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGZvb2Zvb1xuICAgICAgICAgICBiYXJiYXJiYXIgICAxXG4gICAgICAgICAgIGZvbyAgICAgICAgIDJcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgdCA9IFxuICAgICAgICAgICAgZm9vYmFyOiBcbiAgICAgICAgICAgICAgICBiYXJmb286IDFcbiAgICAgICAgICAgICAgICBiYXI6IDJcbiAgICAgICAgICAgIGZvbzogXG4gICAgICAgICAgICAgICAgYmFyOiAxXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHRcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgZm9vYmFyXG4gICAgICAgICAgICAgICAgYmFyZm9vICAxXG4gICAgICAgICAgICAgICAgYmFyICAgICAyXG4gICAgICAgIGZvb1xuICAgICAgICAgICAgICAgIGJhciAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ2luZGVudCcgLT5cbiAgICAgICAgbyA9IGE6IGI6IGM6IDFcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogMiwgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICBiXG4gICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiA0LCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgIGMgIDFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6IDgsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogJyAgJywgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICBiXG4gICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAnICAgICcsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogJyAgICAgICAgJywgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ2NvbW1lbnQnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgJyMnXG4gICAgICAgIC50by5lcWwgXCJ8I3xcIlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSAnI2ZvbydcbiAgICAgICAgLnRvLmVxbCBcInwjZm9vfFwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFsnIyMjJywgJyMnLCAnICAjICddXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIHwjIyN8XG4gICAgICAgIHwjfFxuICAgICAgICB8ICAjIHxcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAnanNvbicgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHtcImFcIjogXCJiXCJ9LCBleHQ6ICcuanNvbicsIGluZGVudDogOFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJhXCI6IFwiYlwiXG4gICAgICAgIH1cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdyZWdleHAnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbIC9eaGVsbG9cXHN3b3JsZCQvZ2ksIC9bXFx3XFxkXSovIF1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgXmhlbGxvXFxcXHN3b3JsZCRcbiAgICAgICAgW1xcXFx3XFxcXGRdKlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ3JlZ2V4cCB2YWx1ZXMnIC0+XG4gICAgICAgIHJlc3VsdCA9IG5vb24uc3RyaW5naWZ5IHthOiAvXmhlbGxvXFxzd29ybGQkL2dpLCBiOiAvW1xcd1xcZF0qL31cbiAgICAgICAgZXhwY3RkID0gXCJhICAgXmhlbGxvXFxcXHN3b3JsZCRcXG5iICAgW1xcXFx3XFxcXGRdKlwiXG4gICAgICAgIGV4cGVjdChyZXN1bHQpIC50by5lcWwgZXhwY3RkXG5cbiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAwMCAgICAgIDAwMDAwICAgICAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdzdHJpbmdpZnkgZXh0JyAtPlxuXG4gICAgbyA9IGE6IDEsIGI6IDIgICAgXG4gICAgaXQgJ3Nob3VsZCBvdXRwdXQgbm9vbiBieSBkZWZhdWx0JyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGEgICAxXG4gICAgICAgIGIgICAyXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ3Nob3VsZCBvdXRwdXQgbm9vbicgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgZXh0OiAnLm5vb24nXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGEgICAxXG4gICAgICAgIGIgICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnc2hvdWxkIG91dHB1dCBqc29uJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBleHQ6ICcuanNvbidcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAge1xuICAgICAgICAgICAgXCJhXCI6IDEsXG4gICAgICAgICAgICBcImJcIjogMlxuICAgICAgICB9XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ3Nob3VsZCBvdXRwdXQgeWFtbCcgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgZXh0OiAnLnlhbWwnXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGE6IDFcbiAgICAgICAgYjogMlxuICAgICAgICBcbiAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=test.coffee