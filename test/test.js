// koffee 1.3.0
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsS0FBUjs7QUFDVCxNQUFBLEdBQVMsSUFBSSxDQUFDOztBQUNkLElBQUksQ0FBQyxNQUFMLENBQUE7O0FBRUEsUUFBQSxDQUFTLGtCQUFULEVBQTRCLFNBQUE7SUFFeEIsRUFBQSxDQUFHLHdCQUFILEVBQTRCLFNBQUE7ZUFDeEIsQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFiLENBQW1CLENBQUMsTUFBTSxDQUFDLEdBQTNCLENBQStCLFVBQS9CO0lBRHdCLENBQTVCO0lBRUEsRUFBQSxDQUFHLDRCQUFILEVBQWdDLFNBQUE7ZUFDNUIsQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFiLENBQXVCLENBQUMsTUFBTSxDQUFDLEdBQS9CLENBQW1DLFVBQW5DO0lBRDRCLENBQWhDO0lBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTJCLFNBQUE7ZUFDdkIsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFiLENBQWtCLENBQUMsTUFBTSxDQUFDLEdBQTFCLENBQThCLFVBQTlCO0lBRHVCLENBQTNCO1dBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTJCLFNBQUE7ZUFDdkIsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFiLENBQWtCLENBQUMsTUFBTSxDQUFDLEdBQTFCLENBQThCLFVBQTlCO0lBRHVCLENBQTNCO0FBUndCLENBQTVCOztBQWlCQSxRQUFBLENBQVMsTUFBVCxFQUFnQixTQUFBO0FBRVosUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsV0FBckI7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Q0FBQyxFQUFFLENBQUMsR0FESixDQUNRLGNBRFI7SUFGb0IsQ0FBeEI7SUFRQSxFQUFBLENBQUcsb0JBQUgsRUFBd0IsU0FBQTtlQUVwQixNQUFBLENBQU8sSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWtCO1lBQUEsR0FBQSxFQUFLLE9BQUw7U0FBbEIsQ0FBUCxDQUNBLENBQUMsRUFBRSxDQUFDLEdBREosQ0FDUSxtQ0FEUjtJQUZvQixDQUF4QjtXQVVBLEVBQUEsQ0FBRyxvQkFBSCxFQUF3QixTQUFBO2VBRXBCLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsRUFBa0I7WUFBQSxHQUFBLEVBQUssT0FBTDtTQUFsQixDQUFQLENBQ0EsQ0FBQyxFQUFFLENBQUMsR0FESixDQUNRLGNBRFI7SUFGb0IsQ0FBeEI7QUE3QnFCLENBQXpCIiwic291cmNlc0NvbnRlbnQiOlsiYXNzZXJ0ID0gcmVxdWlyZSAnYXNzZXJ0J1xuY2hhaSAgID0gcmVxdWlyZSAnY2hhaSdcbnBhdGggICA9IHJlcXVpcmUgJ3BhdGgnXG5mcyAgICAgPSByZXF1aXJlICdmcydcbm5vb24gICA9IHJlcXVpcmUgJy4uLydcbmV4cGVjdCA9IGNoYWkuZXhwZWN0XG5jaGFpLnNob3VsZCgpXG5cbmRlc2NyaWJlICdtb2R1bGUgaW50ZXJmYWNlJyAtPlxuICAgIFxuICAgIGl0ICdzaG91bGQgaW1wbGVtZW50IHBhcnNlJyAtPlxuICAgICAgICAodHlwZW9mIG5vb24ucGFyc2UpLnNob3VsZC5lcWwgJ2Z1bmN0aW9uJ1xuICAgIGl0ICdzaG91bGQgaW1wbGVtZW50IHN0cmluZ2lmeScgLT5cbiAgICAgICAgKHR5cGVvZiBub29uLnN0cmluZ2lmeSkuc2hvdWxkLmVxbCAnZnVuY3Rpb24nXG4gICAgaXQgJ3Nob3VsZCBpbXBsZW1lbnQgbG9hZCcgLT5cbiAgICAgICAgKHR5cGVvZiBub29uLmxvYWQpLnNob3VsZC5lcWwgJ2Z1bmN0aW9uJ1xuICAgIGl0ICdzaG91bGQgaW1wbGVtZW50IHNhdmUnIC0+XG4gICAgICAgICh0eXBlb2Ygbm9vbi5zYXZlKS5zaG91bGQuZXFsICdmdW5jdGlvbidcbiAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5kZXNjcmliZSAnbG9hZCcgLT5cbiAgICBcbiAgICB0ZXN0Tm9vbiA9IHBhdGguam9pbiBfX2Rpcm5hbWUsICd0ZXN0Lm5vb24nXG4gICAgXG4gICAgaXQgJ3N5bmMnIC0+XG4gICAgICAgIFxuICAgICAgICByID0gbm9vbi5sb2FkIHRlc3ROb29uXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgci5udW1iZXIuaW50IFxuICAgICAgICAudG8uZXFsIDQyXG5cbiAgICBpdCAnYXN5bmMnLCAoZG9uZSkgLT5cbiAgICAgICAgXG4gICAgICAgIG5vb24ubG9hZCB0ZXN0Tm9vbiwgKHIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCByLm51bWJlci5pbnQgXG4gICAgICAgICAgICAudG8uZXFsIDQyXG4gICAgICAgICAgICBkb25lKClcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgXG5cbmRlc2NyaWJlICdzYXZlJyAtPlxuICAgIFxuICAgIHdyaXRlTm9vbiA9IHBhdGguam9pbiBfX2Rpcm5hbWUsICd3cml0ZS5ub29uJ1xuICAgIHdyaXRlRGF0YSA9IGhlbGxvOiAnd29ybGQnXG4gICAgXG4gICAgaXQgJ3N5bmMnIC0+XG4gICAgICAgIFxuICAgICAgICB0cnkgXG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jIHdyaXRlTm9vblxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgICAgIG5vb24uc2F2ZSB3cml0ZU5vb24sIHdyaXRlRGF0YVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ubG9hZCB3cml0ZU5vb25cbiAgICAgICAgLnRvLmVxbCB3cml0ZURhdGFcbiAgICAgICAgXG4gICAgaXQgJ2FzeW5jJywgKGRvbmUpIC0+XG4gICAgICAgIFxuICAgICAgICB0cnkgXG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jIHdyaXRlTm9vblxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgICAgIG5vb24uc2F2ZSB3cml0ZU5vb24sIHdyaXRlRGF0YSwgKGVycikgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IGVyclxuICAgICAgICAgICAgLnRvLmVxbCBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdCBub29uLmxvYWQgd3JpdGVOb29uXG4gICAgICAgICAgICAudG8uZXFsIHdyaXRlRGF0YVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkb25lKClcbiAgICAgICAgICAgIFxuIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyMjXG5cbmRlc2NyaWJlICdwYXJzZScgLT5cbiAgICBcbiAgICBpdCAnbnVtYmVyJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCI2NjZcIlxuICAgICAgICAudG8uZXFsIFs2NjZdXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIjEuMjNcIlxuICAgICAgICAudG8uZXFsIFsxLjIzXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCIwLjAwMFwiXG4gICAgICAgIC50by5lcWwgWzBdXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIkluZmluaXR5XCJcbiAgICAgICAgLnRvLmVxbCBbSW5maW5pdHldXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgNDJcbiAgICAgICAgNjYuMFxuICAgICAgICAwLjQyXG4gICAgICAgIDY2LjYwXG4gICAgICAgIEluZmluaXR5XG4gICAgICAgICsyMFxuICAgICAgICAtMjBcbiAgICAgICAgKzBcbiAgICAgICAgLTEuMjNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgWzQyLDY2LDAuNDIsNjYuNixJbmZpbml0eSwyMCwtMjAsMCwtMS4yM11cbiAgICAgICAgXG4gICAgaXQgJ2Jvb2wnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcInRydWVcIlxuICAgICAgICAudG8uZXFsIFt0cnVlXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIHRydWVcbiAgICAgICAgZmFsc2VcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgW3RydWUsZmFsc2VdXG4gICAgICAgIFxuICAgIGl0ICdudWxsJyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgbnVsbFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBbbnVsbF0gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgaXQgJ3N0cmluZycgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiaGVsbG8gd29ybGRcIlxuICAgICAgICAudG8uZXFsIFsnaGVsbG8gd29ybGQnXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwifCBoZWxsbyB3b3JsZCB8XCJcbiAgICAgICAgLnRvLmVxbCBbJyBoZWxsbyB3b3JsZCAnXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UoJ3wgLiAgLi4uIHwgICcpXG4gICAgICAgIC50by5lcWwgWycgLiAgLi4uICddXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcInw2Ni42MDAwfFwiXG4gICAgICAgIC50by5lcWwgWyc2Ni42MDAwJ11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIjYuNi42XCJcbiAgICAgICAgLnRvLmVxbCBbJzYuNi42J11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIl4xLjJcIlxuICAgICAgICAudG8uZXFsIFsnXjEuMiddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCIrKzJcIlxuICAgICAgICAudG8uZXFsIFsnKysyJ11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIistMFwiXG4gICAgICAgIC50by5lcWwgWycrLTAnXVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UoJy4uLiBcXG4gbGluZSAxIFxcbiBsaW5lIDIgXFxuIC4uLicpXG4gICAgICAgIC50by5lcWwgWydsaW5lIDFcXG5saW5lIDInXVxuXG4gICAgICAgICAgICAgICAgXG4gICAgaXQgJ2xpc3QnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlKFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgIGExXG4gICAgICAgIGEgMVxuICAgICAgICBcIlwiXCIpXG4gICAgICAgIC50by5lcWwgWydhJywgJ2ExJywgJ2EgMSddXG4gICAgICAgIFxuICAgIGl0ICdvYmplY3QnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICBcbiAgICAgICAgYiAgXG4gICAgICAgIGMgIDNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgYTpudWxsLCBiOm51bGwsIGM6M1xuICAgICAgICBcbiAgICBpdCAnbmVzdGVkIGxpc3RzJyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgXG4gICAgICAgIGIgIFxuICAgICAgICAuXG4gICAgICAgICAgICBjXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgZFxuICAgICAgICAuXG4gICAgICAgICAgICBlXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgZlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBbXG4gICAgICAgICAgICAgICAgJ2EnXG4gICAgICAgICAgICAgICAgJ2InXG4gICAgICAgICAgICAgICAgWydjJywgW10sIFtbXV0sJ2QnXVxuICAgICAgICAgICAgICAgIFsnZScsIFsnZiddXVxuICAgICAgICAgICAgXVxuXG4gICAgaXQgJ25lc3RlZCBvYmplY3RzJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIFxuICAgICAgICBiICBcbiAgICAgICAgICAgIGNcbiAgICAgICAgICAgIGRcbiAgICAgICAgICAgICAgICBlICAwXG4gICAgICAgICAgICBmICAgMVxuICAgICAgICBnXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICAgICAgYTpudWxsXG4gICAgICAgICAgICAgICAgYjpcbiAgICAgICAgICAgICAgICAgICAgYzogbnVsbFxuICAgICAgICAgICAgICAgICAgICBkOlxuICAgICAgICAgICAgICAgICAgICAgICAgZTogMFxuICAgICAgICAgICAgICAgICAgICBmOiAxXG4gICAgICAgICAgICAgICAgZzogbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgIGl0ICdjb21wbGV4IG9iamVjdCcgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAgIGNcbiAgICAgICAgICAgIGRcbiAgICAgICAgZSBmXG4gICAgICAgICAgICBnICBoXG4gICAgICAgIDEgIG9uZSAgdHdvICBcbiAgICAgICAgalxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIGsgIGxcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAufCAgdHJ1ZXxmYWxzZVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTpcbiAgICAgICAgICAgICAgICBiOiBbJ2MnXVxuICAgICAgICAgICAgICAgIGQ6IG51bGxcbiAgICAgICAgICAgICdlIGYnOlxuICAgICAgICAgICAgICAgIGc6ICdoJ1xuICAgICAgICAgICAgJzEnOiAnb25lICB0d28nXG4gICAgICAgICAgICBqOiBbe2s6ICdsJ30sICcufCc6J3RydWV8ZmFsc2UnXVxuICAgICAgICAgICAgXG5cbiAgICBpdCAnc3BhY2VzJyAtPiAgICBcbiAgICAgICAgbyA9IHthOiAxLCBiOiAyfVxuICAgICAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAxXG4gICAgICAgIGIgIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgb1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgICBhICAxXG4gICAgICAgICBiICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgICAgIGEgIDFcbiAgICAgICAgICAgIGIgIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgb1xuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGEgIDFcbiAgICAgICAgXG4gICAgICAgIGIgIDJcbiAgICAgICAgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIG9cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBrZXkgICAgICB2YWx1ZSAgIHdpdGggICAgc29tZSAgICBzcGFjZXMgICAuICAgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIHtrZXk6IFwidmFsdWUgICB3aXRoICAgIHNvbWUgICAgc3BhY2VzICAgLlwifVxuICAgICAgICBcbiAgICBpdCAnd2hpdGVzcGFjZSBsaW5lcycgLT5cbiAgICAgICAgXG4gICAgICAgIG8gPSB7YTogMSwgYjogMn1cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICAgXG4gICAgICAgIGEgIDFcbiAgICAgICAgIFxuICAgICAgICBiICAyXG4gICAgICAgICBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgb1xuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGEgIDFcbiAgICAgICAgICAgIFxuICAgICAgICBiICAyXG4gICAgICAgICAgICBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgb1xuICAgICAgICBcbiAgICBpdCAnZGVuc2Ugbm90YXRpb24nIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiBiIC4uIGMgMSAuLiBkICAyIC4uIGUgLi4uIHggeSB6ICAuLi4gZiAuLi4uIG51bGwgIG51bGwgLi4uIDMgLi4gZyAuIGggXG4gICAgICAgIGIgIC4gZm9vIC4gYmFyXG4gICAgICAgICAgICBmb29cbiAgICAgICAgICAgIGJhclxuICAgICAgICBjICAuIGZvbyAuLiBiYXJrXG4gICAgICAgICAgICBmb28gIGJhclxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTpcbiAgICAgICAgICAgICAgICBiOlxuICAgICAgICAgICAgICAgICAgICBjOiAxXG4gICAgICAgICAgICAgICAgICAgIGQ6IDJcbiAgICAgICAgICAgICAgICAgICAgZTogXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAneSB6J1xuICAgICAgICAgICAgICAgICAgICAgICAgZjogXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ251bGwnOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAnMyc6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZzogbnVsbFxuICAgICAgICAgICAgICAgIGg6IG51bGxcbiAgICAgICAgICAgIGI6IFsgJ2ZvbycsICdiYXInLCAnZm9vJywgJ2JhcicgXVxuICAgICAgICAgICAgYzogXG4gICAgICAgICAgICAgICAgZm9vOiAnYmFyJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiBiIC4uIGMgMFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgYjpcbiAgICAgICAgICAgICAgICAgICAgYzogMFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHBhdGggLi4vc29tZS5maWxlXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICBwYXRoOiAnLi4vc29tZS5maWxlJ1xuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuID8gc29tZSBzZW50ZW5jZS4gc29tZSBvdGhlciBzZW50ZW5jZS4gLiBBOiBuZXh0IHNlbnRlbmNlLi4uXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICAnPyc6ICAnc29tZSBzZW50ZW5jZS4gc29tZSBvdGhlciBzZW50ZW5jZS4nXG4gICAgICAgICAgICAgICAgJ0E6JzogJ25leHQgc2VudGVuY2UuLi4nIFxuXG4gICAgaXQgJ2RlbnNlIGVzY2FwZWQnIC0+XG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4geCB8IDF8IC4geSB8IDIgfCAuIHogfDMgfFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgeDogJyAxJ1xuICAgICAgICAgICAgICAgIHk6ICcgMiAnIFxuICAgICAgICAgICAgICAgIHo6ICczICcgXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gfCAxfCAuIHwgMiB8IC4gfDMgfFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogWyAnIDEnLCAnIDIgJywgJzMgJ10gXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gfCAxfCBhIC4gfCAyIHwgYiAuIHwzIHwgY1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgJyAxJzogICdhJyBcbiAgICAgICAgICAgICAgICAnIDIgJzogJ2InXG4gICAgICAgICAgICAgICAgJzMgJzogICdjJyBcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiB8IDF8ICAgYSB8IC4gfCAyIHwgfCBifCAuIHwzIHwgfGMgeCBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgICcgMSc6ICAnYSAnIFxuICAgICAgICAgICAgICAgICcgMiAnOiAnIGInXG4gICAgICAgICAgICAgICAgJzMgJzogICdjIHgnIFxuXG4gICAgaXQgJ29uZSBsaW5lIG5vdGF0aW9uJyAtPlxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwia2V5IC4gYSA6OiBiIC4gYyA6OiBkIDEgOjogZSAyXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAga2V5OiBbJ2EnXVxuICAgICAgICAgICAgYjogICBbJ2MnXVxuICAgICAgICAgICAgZDogICAxXG4gICAgICAgICAgICBlOiAgIDJcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImEgLiBiIC4uIGMgNFwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgIGI6XG4gICAgICAgICAgICAgICAgICAgIGM6IDRcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAxIDo6IGIgMiA6OiBjIDVcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiAxXG4gICAgICAgICAgICBiOiAyXG4gICAgICAgICAgICBjOiA1XG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhOjogYjo6IGMgMzo6IGQgNFwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IG51bGxcbiAgICAgICAgICAgIGI6IG51bGxcbiAgICAgICAgICAgIGM6IDNcbiAgICAgICAgICAgIGQ6IDRcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImEgICAgICA6OiBiICAgICAgICAgIDo6IGM6OiBkIDRcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBudWxsXG4gICAgICAgICAgICBiOiBudWxsXG4gICAgICAgICAgICBjOiBudWxsXG4gICAgICAgICAgICBkOiA0XG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhICAgICAgOjogYiAgICAgICAgICA6OiBjOjogZCAgXCJcbiAgICAgICAgLnRvLmVxbCBbJ2EnLCAnYicsICdjJywgJ2QnXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiMSA6OiAyIDo6IDMgOjogNFwiXG4gICAgICAgIC50by5lcWwgWzEsMiwzLDRdXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhIC4gMSAuIDIgOjogYiAuIDZcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBbMSwyXVxuICAgICAgICAgICAgYjogWzZdXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhICAgICAuICAgICAxICAgICAuICAgICAyICAgICA6OiBiICAgIC4gICA3ICAgICBcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBbMSwyXVxuICAgICAgICAgICAgYjogWzddXG5cbiAgICBpdCAnZXNjYXBlJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICAgfCAxfFxuICAgICAgICAgfDIgfFxuICAgICAgICAgfCAzIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgWycgMScsICcyICcsICcgMyAnXSBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICB8IDEgIDEgIFxuICAgICAgICBiICB8IDIgIDIgIHxcbiAgICAgICAgYyAgICAzICAzICB8XG4gICAgICAgIGQgIHx8XG4gICAgICAgIGUgIHwgfFxuICAgICAgICBmICB8fHxcbiAgICAgICAgZyAgfHwgfCB8fCBcbiAgICAgICAgaCAgfC4gLiAuIFxuICAgICAgICB8aSB8ICAgICAgICAxXG4gICAgICAgIHwganwgICAgICAgIDIgXG4gICAgICAgIHwgayAgayB8ICAgIDMgIFxuICAgICAgICB8bCB8ICAgICAgICB8IGwgICAgXG4gICAgICAgIHwgbSAgbSB8ICAgIG0gbSAgfCAgICBcbiAgICAgICAgfCBuICBuIHwgICAgfHx8fFxuICAgICAgICB8IG8gbyB8XG4gICAgICAgIHwgcCAgIHBcbiAgICAgICAgfCBxIHwgIHxcbiAgICAgICAgfHwgIHxcbiAgICAgICAgfHJ8NFxuICAgICAgICB8c3x8IHxcbiAgICAgICAgdCAgfDVcbiAgICAgICAgfHUgfDZcbiAgICAgICAgfC58ICAuXG4gICAgICAgIHwgfHRydWVcbiAgICAgICAgfCN8fCNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6ICcgMSAgMSdcbiAgICAgICAgICAgIGI6ICcgMiAgMiAgJ1xuICAgICAgICAgICAgYzogJzMgIDMgICdcbiAgICAgICAgICAgIGQ6ICcnXG4gICAgICAgICAgICBlOiAnICdcbiAgICAgICAgICAgIGY6ICd8J1xuICAgICAgICAgICAgZzogJ3wgfCB8J1xuICAgICAgICAgICAgaDogJy4gLiAuJ1xuICAgICAgICAgICAgJ2kgJzogMVxuICAgICAgICAgICAgJyBqJzogMlxuICAgICAgICAgICAgJyBrICBrICc6IDNcbiAgICAgICAgICAgICdsICc6ICcgbCdcbiAgICAgICAgICAgICcgbSAgbSAnOiAnbSBtICAnXG4gICAgICAgICAgICAnIG4gIG4gJzogJ3x8J1xuICAgICAgICAgICAgJyBvIG8gJzogbnVsbFxuICAgICAgICAgICAgJyBwICAgcCc6IG51bGxcbiAgICAgICAgICAgICcgcSAnOiAnJ1xuICAgICAgICAgICAgJyc6ICcnXG4gICAgICAgICAgICAncic6IDRcbiAgICAgICAgICAgICdzJzogJyAnXG4gICAgICAgICAgICAndCc6ICc1J1xuICAgICAgICAgICAgJ3UgJzogNlxuICAgICAgICAgICAgJy4nOiAnLidcbiAgICAgICAgICAgICcgJzogdHJ1ZVxuICAgICAgICAgICAgJyMnOiAnIydcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiICAgIFxuICAgICAgICB8fCAgICAgIHx8XG4gICAgICAgIHwgfCAgICAgfCB8XG4gICAgICAgIHwgIHwgICAgfCAgfFxuICAgICAgICB8IC4gfCAgIHwgLiB8XG4gICAgICAgIHwgLi4gfCAgfCAuLiB8XG4gICAgICAgIHwgLi4uICAgfHxcbiAgICAgICAgfCAuLi4uICB8LnxcbiAgICAgICAgfCAuLi4uLiB8LiB8XG4gICAgICAgIHwgLiAgICAgfCAuIHxcbiAgICAgICAgfCAuLiAgICB8IC4uIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgXG4gICAgICAgICAgICAnJyAgICAgICA6JycgXG4gICAgICAgICAgICAnICcgICAgICA6JyAnXG4gICAgICAgICAgICAnICAnICAgICA6JyAgJyBcbiAgICAgICAgICAgICcgLiAnICAgIDonIC4gJyAgICBcbiAgICAgICAgICAgICcgLi4gJyAgIDonIC4uICcgICBcbiAgICAgICAgICAgICcgLi4uICAgJzonJ1xuICAgICAgICAgICAgJyAuLi4uICAnOicuJ1xuICAgICAgICAgICAgJyAuLi4uLiAnOicuICdcbiAgICAgICAgICAgICcgLiAgICAgJzonLiAnXG4gICAgICAgICAgICAnIC4uICAgICc6Jy4uICdcbiAgICAgICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSAnLi4uIFxcbnwgMSB8XFxuIHwgMiBcXG4gIDMgIHxcXG4gIC4uLidcbiAgICAgICAgLnRvLmVxbCBbJyAxIFxcbiAyXFxuMyAgJ11cblxuICAgIGl0ICdjb21tZW50JyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICAjIHRoaXMgaXMgYSBjb21tZW50XG4gICAgICAgIHRoaXMgaXMgc29tZSBkYXRhXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFsndGhpcyBpcyBzb21lIGRhdGEnXVxuXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIDFcbiAgICAgICAgICAgICNmb29cbiAgICAgICAgYiAgMlxuICAgICAgICAjYiAgM1xuICAgICAgICBjICAgNCAjIDVcbiAgICAgICAgZCAgIFxuICAgICAgICAgICAgNiAjIDdcbiAgICAgICAgIyAgXG4gICAgICAgICMjI1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBcbiAgICAgICAgICAgIGE6IDFcbiAgICAgICAgICAgIGI6IDJcbiAgICAgICAgICAgIGM6ICc0ICMgNSdcbiAgICAgICAgICAgIGQ6IFsnNiAjIDcnXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAxXG4gICAgICAgIHwjfFxuICAgICAgICAgICAgfCNcbiAgICAgICAgICAgIHwgIyBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgXG4gICAgICAgICAgICBhOiAxXG4gICAgICAgICAgICAnIyc6IFsnIycsICcgIyddXG4gICAgICAgICAgICBcbiAgICBpdCAnZW1wdHkgc3RyaW5nJyAtPiBcbiAgICBcbiAgICAgICAgZXhwZWN0KG5vb24ucGFyc2UoJycpKS50by5lcWwgJydcbiAgICAgICAgZXhwZWN0KG5vb24ucGFyc2UoJyAnKSkudG8uZXFsICcnXG4gICAgICAgIGV4cGVjdChub29uLnBhcnNlKCkpLnRvLmVxbCAnJ1xuXG4jIyNcbiAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAwMCAgICAgIDAwMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdzdHJpbmdpZnknIC0+XG4gICAgXG4gICAgaXQgJ251bWJlcicgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkoNDIpXG4gICAgICAgIC50by5lcWwgJzQyJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5KDY2LjYwMDApXG4gICAgICAgIC50by5lcWwgJzY2LjYnXG4gICAgICAgIFxuICAgIGl0ICdib29sJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBmYWxzZVxuICAgICAgICAudG8uZXFsICdmYWxzZSdcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB0cnVlXG4gICAgICAgIC50by5lcWwgJ3RydWUnXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkoWydmYWxzZScsICd0cnVlJywgJyBmYWxzZScsICd0cnVlICAnXSlcbiAgICAgICAgLnRvLmVxbCBcIlwiXCIgICAgICAgIFxuICAgICAgICBmYWxzZVxuICAgICAgICB0cnVlXG4gICAgICAgIHwgZmFsc2V8XG4gICAgICAgIHx0cnVlICB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnbnVsbCcgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbbnVsbCwgJyBudWxsICddXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG51bGxcbiAgICAgICAgfCBudWxsIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdzdHJpbmcnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgXCJoZWxsbyB3b3JsZFwiXG4gICAgICAgIC50by5lcWwgJ2hlbGxvIHdvcmxkJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFwiIC4gIC4uLiAgfHx8IFwiXG4gICAgICAgIC50by5lcWwgJ3wgLiAgLi4uICB8fHwgfCdcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBcIjY2LjYwMDBcIlxuICAgICAgICAudG8uZXFsICc2Ni42MDAwJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFwiMVxcbjJcXG4zXCJcbiAgICAgICAgLnRvLmVxbCAnLi4uXFxuMVxcbjJcXG4zXFxuLi4uJ1xuICAgICAgICBcbiAgICBpdCAnZmxvYXQnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbMC4yNCw2Ni42XVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICAwLjI0XG4gICAgICAgIDY2LjZcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdsaXN0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgWydhJywgJ2ExJywgJ2EgMSddXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgYTFcbiAgICAgICAgYSAxXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ2xpc3Qgb2YgbGlzdHMgLi4uJyAtPlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbWzEsMl0sWzQsWzVdLFtbNl1dXSxbN10sW10sW1s4LFs5LFsxMCwxMV0sMTJdXV1dXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIC5cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIDJcbiAgICAgICAgLlxuICAgICAgICAgICAgNFxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIDVcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgLlxuICAgICAgICAgICAgN1xuICAgICAgICAuXG4gICAgICAgIC5cbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgICAgICAgICAxMVxuICAgICAgICAgICAgICAgICAgICAxMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ29iamVjdCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHthOjEsIGI6MiwgYzozfVxuICAgICAgICAudG8uZXFsIFwiXCJcIiAgICBcbiAgICAgICAgYSAgIDFcbiAgICAgICAgYiAgIDJcbiAgICAgICAgYyAgIDNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBvID0gYTogMSwgYjogMiAgICBcbiAgICAgICAgciA9IFwiXCJcIlxuICAgICAgICBhICAgMVxuICAgICAgICBiICAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG9cbiAgICAgICAgLnRvLmVxbCByXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogJyAgJ1xuICAgICAgICAudG8uZXFsIHJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAyXG4gICAgICAgIC50by5lcWwgclxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHtrZXk6IFwidmFsdWUgICB3aXRoICAgIHNvbWUgICAgc3BhY2VzICAuXCJ9XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGtleSAgdmFsdWUgICB3aXRoICAgIHNvbWUgICAgc3BhY2VzICAuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnZXNjYXBlJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFtcbiAgICAgICAgICAgICcnIFxuICAgICAgICAgICAgJyAnXG4gICAgICAgICAgICAnICAnXG4gICAgICAgICAgICAnIC4gJyBcbiAgICAgICAgICAgICcgLi4gJ1xuICAgICAgICAgICAgJyAuLi4gJ1xuICAgICAgICAgICAgJyAuJyBcbiAgICAgICAgICAgICcgLi4nXG4gICAgICAgICAgICAnIC4uLidcbiAgICAgICAgICAgICcuICcgXG4gICAgICAgICAgICAnLi4gJ1xuICAgICAgICAgICAgJy4uLiAnXG4gICAgICAgICAgICAnfCdcbiAgICAgICAgICAgICd8fCdcbiAgICAgICAgICAgICcjJ1xuICAgICAgICAgICAgJyMgYSdcbiAgICAgICAgXVxuICAgICAgICAudG8uZXFsIFwiXCJcIiAgICBcbiAgICAgICAgfHxcbiAgICAgICAgfCB8XG4gICAgICAgIHwgIHxcbiAgICAgICAgfCAuIHxcbiAgICAgICAgfCAuLiB8XG4gICAgICAgIHwgLi4uIHxcbiAgICAgICAgfCAufFxuICAgICAgICB8IC4ufFxuICAgICAgICB8IC4uLnxcbiAgICAgICAgfC4gfFxuICAgICAgICB8Li4gfFxuICAgICAgICB8Li4uIHxcbiAgICAgICAgfHx8XG4gICAgICAgIHx8fHxcbiAgICAgICAgfCN8XG4gICAgICAgIHwjIGF8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHtcbiAgICAgICAgICAgICcnICAgICAgIDonJyBcbiAgICAgICAgICAgICcgJyAgICAgIDonICdcbiAgICAgICAgICAgICcgICcgICAgIDonICAnIFxuICAgICAgICAgICAgJyAuICcgICAgOicgLiAnICAgIFxuICAgICAgICAgICAgJyAuLiAnICAgOicgLi4gJyAgIFxuICAgICAgICAgICAgJyAuLi4gJyAgOicgLnwuICcgICAgXG4gICAgICAgICAgICAnIC4nICAgICA6JyAuJyAgIFxuICAgICAgICAgICAgJyAuLicgICAgOicgLi4nICBcbiAgICAgICAgICAgICcgLi4uJyAgIDonIC58LicgICBcbiAgICAgICAgICAgICcuICcgICAgIDonLiAnICAgXG4gICAgICAgICAgICAnLi4gJyAgICA6Jy4uICcgIFxuICAgICAgICAgICAgJy4uLiAnICAgOicufC4gJyAgIFxuICAgICAgICAgICAgJy4gIC4nICAgOid8J1xuICAgICAgICAgICAgJy4gICAuJyAgOid8fCdcbiAgICAgICAgICAgICcjJyAgICAgIDonIydcbiAgICAgICAgICAgICcjIGEnICAgIDonIyBiJ1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCIgICAgXG4gICAgICAgIHx8ICAgICAgfHxcbiAgICAgICAgfCB8ICAgICB8IHxcbiAgICAgICAgfCAgfCAgICB8ICB8XG4gICAgICAgIHwgLiB8ICAgfCAuIHxcbiAgICAgICAgfCAuLiB8ICB8IC4uIHxcbiAgICAgICAgfCAuLi4gfCAgfCAufC4gfFxuICAgICAgICB8IC58ICAgIHwgLnxcbiAgICAgICAgfCAuLnwgICB8IC4ufFxuICAgICAgICB8IC4uLnwgIHwgLnwufFxuICAgICAgICB8LiB8ICAgIHwuIHxcbiAgICAgICAgfC4uIHwgICB8Li4gfFxuICAgICAgICB8Li4uIHwgIHwufC4gfFxuICAgICAgICB8LiAgLnwgIHx8fFxuICAgICAgICB8LiAgIC58ICB8fHx8XG4gICAgICAgIHwjfCAgICAgfCN8XG4gICAgICAgIHwjIGF8ICAgfCMgYnxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgXCIgMSBcXG4yIFxcbiAgM1wiXG4gICAgICAgIC50by5lcWwgJy4uLlxcbnwgMSB8XFxufDIgfFxcbnwgIDN8XFxuLi4uJ1xuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvOiBcIiAxIFxcbjIgXFxuICAzXCJcbiAgICAgICAgLnRvLmVxbCAnbyAgIC4uLlxcbnwgMSB8XFxufDIgfFxcbnwgIDN8XFxuLi4uJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IGE6IFtcImEgIGJcIiwgXCIxICAgM1wiLCBcIiAgIGMgICAgZCAgZSAgIFwiXVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICB8YSAgYnxcbiAgICAgICAgICAgIHwxICAgM3xcbiAgICAgICAgICAgIHwgICBjICAgIGQgIGUgICB8XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ3RyaW0nIC0+XG4gICAgICAgIG8gPSBhOiAxLCBiOiBudWxsLCBjOiAyXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGEgIDFcbiAgICAgICAgYlxuICAgICAgICBjICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgYWxpZ246IHRydWVcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYSAgIDFcbiAgICAgICAgYlxuICAgICAgICBjICAgMlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkge2E6IGI6IGM6IDF9LCBhbGlnbjogdHJ1ZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgYyAgIDFcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHt4OiB5OiB6OiAxfSwgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIHhcbiAgICAgICAgICAgIHlcbiAgICAgICAgICAgICAgICB6ICAxXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ21heGFsaWduJyAtPlxuICAgICAgICBvID0gbzogMSwgb29PT29vOiAyXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBtYXhhbGlnbjogMlxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBvICAxXG4gICAgICAgIG9vT09vbyAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIG1heGFsaWduOiA0XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG8gICAxXG4gICAgICAgIG9vT09vbyAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIG1heGFsaWduOiA4XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG8gICAgICAgMVxuICAgICAgICBvb09Pb28gIDJcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIG1heGFsaWduOiAxOFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBvICAgICAgIDFcbiAgICAgICAgb29PT29vICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgdCA9IGZvb2ZvbzogXG4gICAgICAgICAgICAgYmFyYmFyYmFyOiAxXG4gICAgICAgICAgICAgZm9vOiAyXG4gICAgICAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB0XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGZvb2Zvb1xuICAgICAgICAgICAgYmFyYmFyYmFyICAgMVxuICAgICAgICAgICAgZm9vICAgICAgICAgMlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgdCwgaW5kZW50OiAzXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGZvb2Zvb1xuICAgICAgICAgICBiYXJiYXJiYXIgICAxXG4gICAgICAgICAgIGZvbyAgICAgICAgIDJcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgdCA9IFxuICAgICAgICAgICAgZm9vYmFyOiBcbiAgICAgICAgICAgICAgICBiYXJmb286IDFcbiAgICAgICAgICAgICAgICBiYXI6IDJcbiAgICAgICAgICAgIGZvbzogXG4gICAgICAgICAgICAgICAgYmFyOiAxXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHRcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgZm9vYmFyXG4gICAgICAgICAgICAgICAgYmFyZm9vICAxXG4gICAgICAgICAgICAgICAgYmFyICAgICAyXG4gICAgICAgIGZvb1xuICAgICAgICAgICAgICAgIGJhciAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ2luZGVudCcgLT5cbiAgICAgICAgbyA9IGE6IGI6IGM6IDFcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogMiwgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICBiXG4gICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiA0LCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgIGMgIDFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6IDgsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogJyAgJywgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICBiXG4gICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAnICAgICcsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogJyAgICAgICAgJywgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ2NvbW1lbnQnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgJyMnXG4gICAgICAgIC50by5lcWwgXCJ8I3xcIlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSAnI2ZvbydcbiAgICAgICAgLnRvLmVxbCBcInwjZm9vfFwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFsnIyMjJywgJyMnLCAnICAjICddXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIHwjIyN8XG4gICAgICAgIHwjfFxuICAgICAgICB8ICAjIHxcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAnanNvbicgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHtcImFcIjogXCJiXCJ9LCBleHQ6ICcuanNvbicsIGluZGVudDogOFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJhXCI6IFwiYlwiXG4gICAgICAgIH1cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdyZWdleHAnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbIC9eaGVsbG9cXHN3b3JsZCQvZ2ksIC9bXFx3XFxkXSovIF1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgXmhlbGxvXFxcXHN3b3JsZCRcbiAgICAgICAgW1xcXFx3XFxcXGRdKlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ3JlZ2V4cCB2YWx1ZXMnIC0+XG4gICAgICAgIHJlc3VsdCA9IG5vb24uc3RyaW5naWZ5IHthOiAvXmhlbGxvXFxzd29ybGQkL2dpLCBiOiAvW1xcd1xcZF0qL31cbiAgICAgICAgZXhwY3RkID0gXCJhICAgXmhlbGxvXFxcXHN3b3JsZCRcXG5iICAgW1xcXFx3XFxcXGRdKlwiXG4gICAgICAgIGV4cGVjdChyZXN1bHQpIC50by5lcWwgZXhwY3RkXG5cbiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAwMCAgICAgIDAwMDAwICAgICAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdzdHJpbmdpZnkgZXh0JyAtPlxuXG4gICAgbyA9IGE6IDEsIGI6IDIgICAgXG4gICAgaXQgJ3Nob3VsZCBvdXRwdXQgbm9vbiBieSBkZWZhdWx0JyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGEgICAxXG4gICAgICAgIGIgICAyXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ3Nob3VsZCBvdXRwdXQgbm9vbicgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgZXh0OiAnLm5vb24nXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGEgICAxXG4gICAgICAgIGIgICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnc2hvdWxkIG91dHB1dCBqc29uJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBleHQ6ICcuanNvbidcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAge1xuICAgICAgICAgICAgXCJhXCI6IDEsXG4gICAgICAgICAgICBcImJcIjogMlxuICAgICAgICB9XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgJ3Nob3VsZCBvdXRwdXQgeWFtbCcgLT4gXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgZXh0OiAnLnlhbWwnXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGE6IDFcbiAgICAgICAgYjogMlxuICAgICAgICBcbiAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=test.coffee