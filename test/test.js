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
    return it('should output json', function() {
        return expect(noon.stringify(o, {
            ext: '.json'
        })).to.eql("{\n    \"a\": 1,\n    \"b\": 2\n}");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsS0FBUjs7QUFDVCxNQUFBLEdBQVMsSUFBSSxDQUFDOztBQUNkLElBQUksQ0FBQyxNQUFMLENBQUE7O0FBRUEsUUFBQSxDQUFTLGtCQUFULEVBQTRCLFNBQUE7SUFFeEIsRUFBQSxDQUFHLHdCQUFILEVBQTRCLFNBQUE7ZUFDeEIsQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFiLENBQW1CLENBQUMsTUFBTSxDQUFDLEdBQTNCLENBQStCLFVBQS9CO0lBRHdCLENBQTVCO0lBRUEsRUFBQSxDQUFHLDRCQUFILEVBQWdDLFNBQUE7ZUFDNUIsQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFiLENBQXVCLENBQUMsTUFBTSxDQUFDLEdBQS9CLENBQW1DLFVBQW5DO0lBRDRCLENBQWhDO0lBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTJCLFNBQUE7ZUFDdkIsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFiLENBQWtCLENBQUMsTUFBTSxDQUFDLEdBQTFCLENBQThCLFVBQTlCO0lBRHVCLENBQTNCO1dBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTJCLFNBQUE7ZUFDdkIsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFiLENBQWtCLENBQUMsTUFBTSxDQUFDLEdBQTFCLENBQThCLFVBQTlCO0lBRHVCLENBQTNCO0FBUndCLENBQTVCOztBQWlCQSxRQUFBLENBQVMsTUFBVCxFQUFnQixTQUFBO0FBRVosUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsV0FBckI7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Q0FBQyxFQUFFLENBQUMsR0FESixDQUNRLGNBRFI7SUFGb0IsQ0FBeEI7V0FRQSxFQUFBLENBQUcsb0JBQUgsRUFBd0IsU0FBQTtlQUVwQixNQUFBLENBQU8sSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWtCO1lBQUEsR0FBQSxFQUFLLE9BQUw7U0FBbEIsQ0FBUCxDQUNBLENBQUMsRUFBRSxDQUFDLEdBREosQ0FDUSxtQ0FEUjtJQUZvQixDQUF4QjtBQW5CcUIsQ0FBekIiLCJzb3VyY2VzQ29udGVudCI6WyJhc3NlcnQgPSByZXF1aXJlICdhc3NlcnQnXG5jaGFpICAgPSByZXF1aXJlICdjaGFpJ1xucGF0aCAgID0gcmVxdWlyZSAncGF0aCdcbmZzICAgICA9IHJlcXVpcmUgJ2ZzJ1xubm9vbiAgID0gcmVxdWlyZSAnLi4vJ1xuZXhwZWN0ID0gY2hhaS5leHBlY3RcbmNoYWkuc2hvdWxkKClcblxuZGVzY3JpYmUgJ21vZHVsZSBpbnRlcmZhY2UnIC0+XG4gICAgXG4gICAgaXQgJ3Nob3VsZCBpbXBsZW1lbnQgcGFyc2UnIC0+XG4gICAgICAgICh0eXBlb2Ygbm9vbi5wYXJzZSkuc2hvdWxkLmVxbCAnZnVuY3Rpb24nXG4gICAgaXQgJ3Nob3VsZCBpbXBsZW1lbnQgc3RyaW5naWZ5JyAtPlxuICAgICAgICAodHlwZW9mIG5vb24uc3RyaW5naWZ5KS5zaG91bGQuZXFsICdmdW5jdGlvbidcbiAgICBpdCAnc2hvdWxkIGltcGxlbWVudCBsb2FkJyAtPlxuICAgICAgICAodHlwZW9mIG5vb24ubG9hZCkuc2hvdWxkLmVxbCAnZnVuY3Rpb24nXG4gICAgaXQgJ3Nob3VsZCBpbXBsZW1lbnQgc2F2ZScgLT5cbiAgICAgICAgKHR5cGVvZiBub29uLnNhdmUpLnNob3VsZC5lcWwgJ2Z1bmN0aW9uJ1xuICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmRlc2NyaWJlICdsb2FkJyAtPlxuICAgIFxuICAgIHRlc3ROb29uID0gcGF0aC5qb2luIF9fZGlybmFtZSwgJ3Rlc3Qubm9vbidcbiAgICBcbiAgICBpdCAnc3luYycgLT5cbiAgICAgICAgXG4gICAgICAgIHIgPSBub29uLmxvYWQgdGVzdE5vb25cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCByLm51bWJlci5pbnQgXG4gICAgICAgIC50by5lcWwgNDJcblxuICAgIGl0ICdhc3luYycsIChkb25lKSAtPlxuICAgICAgICBcbiAgICAgICAgbm9vbi5sb2FkIHRlc3ROb29uLCAocikgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IHIubnVtYmVyLmludCBcbiAgICAgICAgICAgIC50by5lcWwgNDJcbiAgICAgICAgICAgIGRvbmUoKVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICBcblxuZGVzY3JpYmUgJ3NhdmUnIC0+XG4gICAgXG4gICAgd3JpdGVOb29uID0gcGF0aC5qb2luIF9fZGlybmFtZSwgJ3dyaXRlLm5vb24nXG4gICAgd3JpdGVEYXRhID0gaGVsbG86ICd3b3JsZCdcbiAgICBcbiAgICBpdCAnc3luYycgLT5cbiAgICAgICAgXG4gICAgICAgIHRyeSBcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmMgd3JpdGVOb29uXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgbnVsbFxuICAgICAgICBcbiAgICAgICAgbm9vbi5zYXZlIHdyaXRlTm9vbiwgd3JpdGVEYXRhXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5sb2FkIHdyaXRlTm9vblxuICAgICAgICAudG8uZXFsIHdyaXRlRGF0YVxuICAgICAgICBcbiAgICBpdCAnYXN5bmMnLCAoZG9uZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHRyeSBcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmMgd3JpdGVOb29uXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgbnVsbFxuICAgICAgICBcbiAgICAgICAgbm9vbi5zYXZlIHdyaXRlTm9vbiwgd3JpdGVEYXRhLCAoZXJyKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QgZXJyXG4gICAgICAgICAgICAudG8uZXFsIG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0IG5vb24ubG9hZCB3cml0ZU5vb25cbiAgICAgICAgICAgIC50by5lcWwgd3JpdGVEYXRhXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICAgICAgXG4jIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwXG4jIyNcblxuZGVzY3JpYmUgJ3BhcnNlJyAtPlxuICAgIFxuICAgIGl0ICdudW1iZXInIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIjY2NlwiXG4gICAgICAgIC50by5lcWwgWzY2Nl1cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiMS4yM1wiXG4gICAgICAgIC50by5lcWwgWzEuMjNdXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIjAuMDAwXCJcbiAgICAgICAgLnRvLmVxbCBbMF1cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiSW5maW5pdHlcIlxuICAgICAgICAudG8uZXFsIFtJbmZpbml0eV1cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICA0MlxuICAgICAgICA2Ni4wXG4gICAgICAgIDAuNDJcbiAgICAgICAgNjYuNjBcbiAgICAgICAgSW5maW5pdHlcbiAgICAgICAgKzIwXG4gICAgICAgIC0yMFxuICAgICAgICArMFxuICAgICAgICAtMS4yM1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBbNDIsNjYsMC40Miw2Ni42LEluZmluaXR5LDIwLC0yMCwwLC0xLjIzXVxuICAgICAgICBcbiAgICBpdCAnYm9vbCcgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwidHJ1ZVwiXG4gICAgICAgIC50by5lcWwgW3RydWVdXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgdHJ1ZVxuICAgICAgICBmYWxzZVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBbdHJ1ZSxmYWxzZV1cbiAgICAgICAgXG4gICAgaXQgJ251bGwnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBudWxsXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFtudWxsXSAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBpdCAnc3RyaW5nJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJoZWxsbyB3b3JsZFwiXG4gICAgICAgIC50by5lcWwgWydoZWxsbyB3b3JsZCddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJ8IGhlbGxvIHdvcmxkIHxcIlxuICAgICAgICAudG8uZXFsIFsnIGhlbGxvIHdvcmxkICddXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSgnfCAuICAuLi4gfCAgJylcbiAgICAgICAgLnRvLmVxbCBbJyAuICAuLi4gJ11cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwifDY2LjYwMDB8XCJcbiAgICAgICAgLnRvLmVxbCBbJzY2LjYwMDAnXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiNi42LjZcIlxuICAgICAgICAudG8uZXFsIFsnNi42LjYnXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXjEuMlwiXG4gICAgICAgIC50by5lcWwgWydeMS4yJ11cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIisrMlwiXG4gICAgICAgIC50by5lcWwgWycrKzInXVxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiKy0wXCJcbiAgICAgICAgLnRvLmVxbCBbJystMCddXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSgnLi4uIFxcbiBsaW5lIDEgXFxuIGxpbmUgMiBcXG4gLi4uJylcbiAgICAgICAgLnRvLmVxbCBbJ2xpbmUgMVxcbmxpbmUgMiddXG5cbiAgICAgICAgICAgICAgICBcbiAgICBpdCAnbGlzdCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UoXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgYTFcbiAgICAgICAgYSAxXG4gICAgICAgIFwiXCJcIilcbiAgICAgICAgLnRvLmVxbCBbJ2EnLCAnYTEnLCAnYSAxJ11cbiAgICAgICAgXG4gICAgaXQgJ29iamVjdCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIFxuICAgICAgICBiICBcbiAgICAgICAgYyAgM1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBhOm51bGwsIGI6bnVsbCwgYzozXG4gICAgICAgIFxuICAgIGl0ICduZXN0ZWQgbGlzdHMnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICBcbiAgICAgICAgYiAgXG4gICAgICAgIC5cbiAgICAgICAgICAgIGNcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBkXG4gICAgICAgIC5cbiAgICAgICAgICAgIGVcbiAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICBmXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFtcbiAgICAgICAgICAgICAgICAnYSdcbiAgICAgICAgICAgICAgICAnYidcbiAgICAgICAgICAgICAgICBbJ2MnLCBbXSwgW1tdXSwnZCddXG4gICAgICAgICAgICAgICAgWydlJywgWydmJ11dXG4gICAgICAgICAgICBdXG5cbiAgICBpdCAnbmVzdGVkIG9iamVjdHMnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgXG4gICAgICAgIGIgIFxuICAgICAgICAgICAgY1xuICAgICAgICAgICAgZFxuICAgICAgICAgICAgICAgIGUgIDBcbiAgICAgICAgICAgIGYgICAxXG4gICAgICAgIGdcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgICAgICBhOm51bGxcbiAgICAgICAgICAgICAgICBiOlxuICAgICAgICAgICAgICAgICAgICBjOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIGQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBlOiAwXG4gICAgICAgICAgICAgICAgICAgIGY6IDFcbiAgICAgICAgICAgICAgICBnOiBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgaXQgJ2NvbXBsZXggb2JqZWN0JyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgY1xuICAgICAgICAgICAgZFxuICAgICAgICBlIGZcbiAgICAgICAgICAgIGcgIGhcbiAgICAgICAgMSAgb25lICB0d28gIFxuICAgICAgICBqXG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgayAgbFxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIC58ICB0cnVlfGZhbHNlXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOlxuICAgICAgICAgICAgICAgIGI6IFsnYyddXG4gICAgICAgICAgICAgICAgZDogbnVsbFxuICAgICAgICAgICAgJ2UgZic6XG4gICAgICAgICAgICAgICAgZzogJ2gnXG4gICAgICAgICAgICAnMSc6ICdvbmUgIHR3bydcbiAgICAgICAgICAgIGo6IFt7azogJ2wnfSwgJy58JzondHJ1ZXxmYWxzZSddXG4gICAgICAgICAgICBcblxuICAgIGl0ICdzcGFjZXMnIC0+ICAgIFxuICAgICAgICBvID0ge2E6IDEsIGI6IDJ9XG4gICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIDFcbiAgICAgICAgYiAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgIGEgIDFcbiAgICAgICAgIGIgIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgb1xuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICAgICAgYSAgMVxuICAgICAgICAgICAgYiAgMlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgYSAgMVxuICAgICAgICBcbiAgICAgICAgYiAgMlxuICAgICAgICBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgb1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGtleSAgICAgIHZhbHVlICAgd2l0aCAgICBzb21lICAgIHNwYWNlcyAgIC4gICBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwge2tleTogXCJ2YWx1ZSAgIHdpdGggICAgc29tZSAgICBzcGFjZXMgICAuXCJ9XG4gICAgICAgIFxuICAgIGl0ICd3aGl0ZXNwYWNlIGxpbmVzJyAtPlxuICAgICAgICBcbiAgICAgICAgbyA9IHthOiAxLCBiOiAyfVxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgICBcbiAgICAgICAgYSAgMVxuICAgICAgICAgXG4gICAgICAgIGIgIDJcbiAgICAgICAgIFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgYSAgMVxuICAgICAgICAgICAgXG4gICAgICAgIGIgIDJcbiAgICAgICAgICAgIFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBvXG4gICAgICAgIFxuICAgIGl0ICdkZW5zZSBub3RhdGlvbicgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIGIgLi4gYyAxIC4uIGQgIDIgLi4gZSAuLi4geCB5IHogIC4uLiBmIC4uLi4gbnVsbCAgbnVsbCAuLi4gMyAuLiBnIC4gaCBcbiAgICAgICAgYiAgLiBmb28gLiBiYXJcbiAgICAgICAgICAgIGZvb1xuICAgICAgICAgICAgYmFyXG4gICAgICAgIGMgIC4gZm9vIC4uIGJhcmtcbiAgICAgICAgICAgIGZvbyAgYmFyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOlxuICAgICAgICAgICAgICAgIGI6XG4gICAgICAgICAgICAgICAgICAgIGM6IDFcbiAgICAgICAgICAgICAgICAgICAgZDogMlxuICAgICAgICAgICAgICAgICAgICBlOiBcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6ICd5IHonXG4gICAgICAgICAgICAgICAgICAgICAgICBmOiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbnVsbCc6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICczJzogbnVsbFxuICAgICAgICAgICAgICAgICAgICBnOiBudWxsXG4gICAgICAgICAgICAgICAgaDogbnVsbFxuICAgICAgICAgICAgYjogWyAnZm9vJywgJ2JhcicsICdmb28nLCAnYmFyJyBdXG4gICAgICAgICAgICBjOiBcbiAgICAgICAgICAgICAgICBmb286ICdiYXInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIGIgLi4gYyAwXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICBiOlxuICAgICAgICAgICAgICAgICAgICBjOiAwXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gcGF0aCAuLi9zb21lLmZpbGVcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgIHBhdGg6ICcuLi9zb21lLmZpbGUnXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIC4gPyBzb21lIHNlbnRlbmNlLiBzb21lIG90aGVyIHNlbnRlbmNlLiAuIEE6IG5leHQgc2VudGVuY2UuLi5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFxuICAgICAgICAgICAgICAgICc/JzogICdzb21lIHNlbnRlbmNlLiBzb21lIG90aGVyIHNlbnRlbmNlLidcbiAgICAgICAgICAgICAgICAnQTonOiAnbmV4dCBzZW50ZW5jZS4uLicgXG5cbiAgICBpdCAnZGVuc2UgZXNjYXBlZCcgLT5cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiB4IHwgMXwgLiB5IHwgMiB8IC4geiB8MyB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICB4OiAnIDEnXG4gICAgICAgICAgICAgICAgeTogJyAyICcgXG4gICAgICAgICAgICAgICAgejogJzMgJyBcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiB8IDF8IC4gfCAyIHwgLiB8MyB8XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBbICcgMScsICcgMiAnLCAnMyAnXSBcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgLiB8IDF8IGEgLiB8IDIgfCBiIC4gfDMgfCBjXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBhOiBcbiAgICAgICAgICAgICAgICAnIDEnOiAgJ2EnIFxuICAgICAgICAgICAgICAgICcgMiAnOiAnYidcbiAgICAgICAgICAgICAgICAnMyAnOiAgJ2MnIFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiXCJcIlxuICAgICAgICBhICAuIHwgMXwgICBhIHwgLiB8IDIgfCB8IGJ8IC4gfDMgfCB8YyB4IFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgJyAxJzogICdhICcgXG4gICAgICAgICAgICAgICAgJyAyICc6ICcgYidcbiAgICAgICAgICAgICAgICAnMyAnOiAgJ2MgeCcgXG5cbiAgICBpdCAnb25lIGxpbmUgbm90YXRpb24nIC0+XG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJrZXkgLiBhIDo6IGIgLiBjIDo6IGQgMSA6OiBlIDJcIlxuICAgICAgICAudG8uZXFsXG4gICAgICAgICAgICBrZXk6IFsnYSddXG4gICAgICAgICAgICBiOiAgIFsnYyddXG4gICAgICAgICAgICBkOiAgIDFcbiAgICAgICAgICAgIGU6ICAgMlxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAuIGIgLi4gYyA0XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogXG4gICAgICAgICAgICAgICAgYjpcbiAgICAgICAgICAgICAgICAgICAgYzogNFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJhIDEgOjogYiAyIDo6IGMgNVwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IDFcbiAgICAgICAgICAgIGI6IDJcbiAgICAgICAgICAgIGM6IDVcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImE6OiBiOjogYyAzOjogZCA0XCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogbnVsbFxuICAgICAgICAgICAgYjogbnVsbFxuICAgICAgICAgICAgYzogM1xuICAgICAgICAgICAgZDogNFxuXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlIFwiYSAgICAgIDo6IGIgICAgICAgICAgOjogYzo6IGQgNFwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IG51bGxcbiAgICAgICAgICAgIGI6IG51bGxcbiAgICAgICAgICAgIGM6IG51bGxcbiAgICAgICAgICAgIGQ6IDRcblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImEgICAgICA6OiBiICAgICAgICAgIDo6IGM6OiBkICBcIlxuICAgICAgICAudG8uZXFsIFsnYScsICdiJywgJ2MnLCAnZCddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCIxIDo6IDIgOjogMyA6OiA0XCJcbiAgICAgICAgLnRvLmVxbCBbMSwyLDMsNF1cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImEgLiAxIC4gMiA6OiBiIC4gNlwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFsxLDJdXG4gICAgICAgICAgICBiOiBbNl1cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcImEgICAgIC4gICAgIDEgICAgIC4gICAgIDIgICAgIDo6IGIgICAgLiAgIDcgICAgIFwiXG4gICAgICAgIC50by5lcWxcbiAgICAgICAgICAgIGE6IFsxLDJdXG4gICAgICAgICAgICBiOiBbN11cblxuICAgIGl0ICdlc2NhcGUnIC0+IFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgICB8IDF8XG4gICAgICAgICB8MiB8XG4gICAgICAgICB8IDMgfFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBbJyAxJywgJzIgJywgJyAzICddIFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIHwgMSAgMSAgXG4gICAgICAgIGIgIHwgMiAgMiAgfFxuICAgICAgICBjICAgIDMgIDMgIHxcbiAgICAgICAgZCAgfHxcbiAgICAgICAgZSAgfCB8XG4gICAgICAgIGYgIHx8fFxuICAgICAgICBnICB8fCB8IHx8IFxuICAgICAgICBoICB8LiAuIC4gXG4gICAgICAgIHxpIHwgICAgICAgIDFcbiAgICAgICAgfCBqfCAgICAgICAgMiBcbiAgICAgICAgfCBrICBrIHwgICAgMyAgXG4gICAgICAgIHxsIHwgICAgICAgIHwgbCAgICBcbiAgICAgICAgfCBtICBtIHwgICAgbSBtICB8ICAgIFxuICAgICAgICB8IG4gIG4gfCAgICB8fHx8XG4gICAgICAgIHwgbyBvIHxcbiAgICAgICAgfCBwICAgcFxuICAgICAgICB8IHEgfCAgfFxuICAgICAgICB8fCAgfFxuICAgICAgICB8cnw0XG4gICAgICAgIHxzfHwgfFxuICAgICAgICB0ICB8NVxuICAgICAgICB8dSB8NlxuICAgICAgICB8LnwgIC5cbiAgICAgICAgfCB8dHJ1ZVxuICAgICAgICB8I3x8I1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbFxuICAgICAgICAgICAgYTogJyAxICAxJ1xuICAgICAgICAgICAgYjogJyAyICAyICAnXG4gICAgICAgICAgICBjOiAnMyAgMyAgJ1xuICAgICAgICAgICAgZDogJydcbiAgICAgICAgICAgIGU6ICcgJ1xuICAgICAgICAgICAgZjogJ3wnXG4gICAgICAgICAgICBnOiAnfCB8IHwnXG4gICAgICAgICAgICBoOiAnLiAuIC4nXG4gICAgICAgICAgICAnaSAnOiAxXG4gICAgICAgICAgICAnIGonOiAyXG4gICAgICAgICAgICAnIGsgIGsgJzogM1xuICAgICAgICAgICAgJ2wgJzogJyBsJ1xuICAgICAgICAgICAgJyBtICBtICc6ICdtIG0gICdcbiAgICAgICAgICAgICcgbiAgbiAnOiAnfHwnXG4gICAgICAgICAgICAnIG8gbyAnOiBudWxsXG4gICAgICAgICAgICAnIHAgICBwJzogbnVsbFxuICAgICAgICAgICAgJyBxICc6ICcnXG4gICAgICAgICAgICAnJzogJydcbiAgICAgICAgICAgICdyJzogNFxuICAgICAgICAgICAgJ3MnOiAnICdcbiAgICAgICAgICAgICd0JzogJzUnXG4gICAgICAgICAgICAndSAnOiA2XG4gICAgICAgICAgICAnLic6ICcuJ1xuICAgICAgICAgICAgJyAnOiB0cnVlXG4gICAgICAgICAgICAnIyc6ICcjJ1xuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCIgICAgXG4gICAgICAgIHx8ICAgICAgfHxcbiAgICAgICAgfCB8ICAgICB8IHxcbiAgICAgICAgfCAgfCAgICB8ICB8XG4gICAgICAgIHwgLiB8ICAgfCAuIHxcbiAgICAgICAgfCAuLiB8ICB8IC4uIHxcbiAgICAgICAgfCAuLi4gICB8fFxuICAgICAgICB8IC4uLi4gIHwufFxuICAgICAgICB8IC4uLi4uIHwuIHxcbiAgICAgICAgfCAuICAgICB8IC4gfFxuICAgICAgICB8IC4uICAgIHwgLi4gfFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBcbiAgICAgICAgICAgICcnICAgICAgIDonJyBcbiAgICAgICAgICAgICcgJyAgICAgIDonICdcbiAgICAgICAgICAgICcgICcgICAgIDonICAnIFxuICAgICAgICAgICAgJyAuICcgICAgOicgLiAnICAgIFxuICAgICAgICAgICAgJyAuLiAnICAgOicgLi4gJyAgIFxuICAgICAgICAgICAgJyAuLi4gICAnOicnXG4gICAgICAgICAgICAnIC4uLi4gICc6Jy4nXG4gICAgICAgICAgICAnIC4uLi4uICc6Jy4gJ1xuICAgICAgICAgICAgJyAuICAgICAnOicuICdcbiAgICAgICAgICAgICcgLi4gICAgJzonLi4gJ1xuICAgICAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnBhcnNlICcuLi4gXFxufCAxIHxcXG4gfCAyIFxcbiAgMyAgfFxcbiAgLi4uJ1xuICAgICAgICAudG8uZXFsIFsnIDEgXFxuIDJcXG4zICAnXVxuXG4gICAgaXQgJ2NvbW1lbnQnIC0+IFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgICMgdGhpcyBpcyBhIGNvbW1lbnRcbiAgICAgICAgdGhpcyBpcyBzb21lIGRhdGFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIC50by5lcWwgWyd0aGlzIGlzIHNvbWUgZGF0YSddXG5cblxuICAgICAgICBleHBlY3Qgbm9vbi5wYXJzZSBcIlwiXCJcbiAgICAgICAgYSAgMVxuICAgICAgICAgICAgI2Zvb1xuICAgICAgICBiICAyXG4gICAgICAgICNiICAzXG4gICAgICAgIGMgICA0ICMgNVxuICAgICAgICBkICAgXG4gICAgICAgICAgICA2ICMgN1xuICAgICAgICAjICBcbiAgICAgICAgIyMjXG4gICAgICAgIFwiXCJcIlxuICAgICAgICAudG8uZXFsIFxuICAgICAgICAgICAgYTogMVxuICAgICAgICAgICAgYjogMlxuICAgICAgICAgICAgYzogJzQgIyA1J1xuICAgICAgICAgICAgZDogWyc2ICMgNyddXG5cbiAgICAgICAgZXhwZWN0IG5vb24ucGFyc2UgXCJcIlwiXG4gICAgICAgIGEgIDFcbiAgICAgICAgfCN8XG4gICAgICAgICAgICB8I1xuICAgICAgICAgICAgfCAjIFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgLnRvLmVxbCBcbiAgICAgICAgICAgIGE6IDFcbiAgICAgICAgICAgICcjJzogWycjJywgJyAjJ11cbiAgICAgICAgICAgIFxuICAgIGl0ICdlbXB0eSBzdHJpbmcnIC0+IFxuICAgIFxuICAgICAgICBleHBlY3Qobm9vbi5wYXJzZSgnJykpLnRvLmVxbCAnJ1xuICAgICAgICBleHBlY3Qobm9vbi5wYXJzZSgnICcpKS50by5lcWwgJydcbiAgICAgICAgZXhwZWN0KG5vb24ucGFyc2UoKSkudG8uZXFsICcnXG5cbiMjI1xuIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwMDAwICAgICAgMDAwMDAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ3N0cmluZ2lmeScgLT5cbiAgICBcbiAgICBpdCAnbnVtYmVyJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSg0MilcbiAgICAgICAgLnRvLmVxbCAnNDInXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkoNjYuNjAwMClcbiAgICAgICAgLnRvLmVxbCAnNjYuNidcbiAgICAgICAgXG4gICAgaXQgJ2Jvb2wnIC0+IFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IGZhbHNlXG4gICAgICAgIC50by5lcWwgJ2ZhbHNlJ1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHRydWVcbiAgICAgICAgLnRvLmVxbCAndHJ1ZSdcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeShbJ2ZhbHNlJywgJ3RydWUnLCAnIGZhbHNlJywgJ3RydWUgICddKVxuICAgICAgICAudG8uZXFsIFwiXCJcIiAgICAgICAgXG4gICAgICAgIGZhbHNlXG4gICAgICAgIHRydWVcbiAgICAgICAgfCBmYWxzZXxcbiAgICAgICAgfHRydWUgIHxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdudWxsJyAtPlxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFtudWxsLCAnIG51bGwgJ11cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgbnVsbFxuICAgICAgICB8IG51bGwgfFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ3N0cmluZycgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBcImhlbGxvIHdvcmxkXCJcbiAgICAgICAgLnRvLmVxbCAnaGVsbG8gd29ybGQnXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgXCIgLiAgLi4uICB8fHwgXCJcbiAgICAgICAgLnRvLmVxbCAnfCAuICAuLi4gIHx8fCB8J1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFwiNjYuNjAwMFwiXG4gICAgICAgIC50by5lcWwgJzY2LjYwMDAnXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgXCIxXFxuMlxcbjNcIlxuICAgICAgICAudG8uZXFsICcuLi5cXG4xXFxuMlxcbjNcXG4uLi4nXG4gICAgICAgIFxuICAgIGl0ICdmbG9hdCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFswLjI0LDY2LjZdXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIDAuMjRcbiAgICAgICAgNjYuNlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ2xpc3QnIC0+XG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBbJ2EnLCAnYTEnLCAnYSAxJ11cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICBhMVxuICAgICAgICBhIDFcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAnbGlzdCBvZiBsaXN0cyAuLi4nIC0+XG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFtbMSwyXSxbNCxbNV0sW1s2XV1dLFs3XSxbXSxbWzgsWzksWzEwLDExXSwxMl1dXV1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgLlxuICAgICAgICAgICAgMVxuICAgICAgICAgICAgMlxuICAgICAgICAuXG4gICAgICAgICAgICA0XG4gICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgNVxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAuXG4gICAgICAgICAgICA3XG4gICAgICAgIC5cbiAgICAgICAgLlxuICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICAgICAgICAgIDExXG4gICAgICAgICAgICAgICAgICAgIDEyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnb2JqZWN0JyAtPlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkge2E6MSwgYjoyLCBjOjN9XG4gICAgICAgIC50by5lcWwgXCJcIlwiICAgIFxuICAgICAgICBhICAgMVxuICAgICAgICBiICAgMlxuICAgICAgICBjICAgM1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIG8gPSBhOiAxLCBiOiAyICAgIFxuICAgICAgICByID0gXCJcIlwiXG4gICAgICAgIGEgICAxXG4gICAgICAgIGIgICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgb1xuICAgICAgICAudG8uZXFsIHJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAnICAnXG4gICAgICAgIC50by5lcWwgclxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6IDJcbiAgICAgICAgLnRvLmVxbCByXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkge2tleTogXCJ2YWx1ZSAgIHdpdGggICAgc29tZSAgICBzcGFjZXMgIC5cIn1cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAga2V5ICB2YWx1ZSAgIHdpdGggICAgc29tZSAgICBzcGFjZXMgIC5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdlc2NhcGUnIC0+XG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgW1xuICAgICAgICAgICAgJycgXG4gICAgICAgICAgICAnICdcbiAgICAgICAgICAgICcgICdcbiAgICAgICAgICAgICcgLiAnIFxuICAgICAgICAgICAgJyAuLiAnXG4gICAgICAgICAgICAnIC4uLiAnXG4gICAgICAgICAgICAnIC4nIFxuICAgICAgICAgICAgJyAuLidcbiAgICAgICAgICAgICcgLi4uJ1xuICAgICAgICAgICAgJy4gJyBcbiAgICAgICAgICAgICcuLiAnXG4gICAgICAgICAgICAnLi4uICdcbiAgICAgICAgICAgICd8J1xuICAgICAgICAgICAgJ3x8J1xuICAgICAgICAgICAgJyMnXG4gICAgICAgICAgICAnIyBhJ1xuICAgICAgICBdXG4gICAgICAgIC50by5lcWwgXCJcIlwiICAgIFxuICAgICAgICB8fFxuICAgICAgICB8IHxcbiAgICAgICAgfCAgfFxuICAgICAgICB8IC4gfFxuICAgICAgICB8IC4uIHxcbiAgICAgICAgfCAuLi4gfFxuICAgICAgICB8IC58XG4gICAgICAgIHwgLi58XG4gICAgICAgIHwgLi4ufFxuICAgICAgICB8LiB8XG4gICAgICAgIHwuLiB8XG4gICAgICAgIHwuLi4gfFxuICAgICAgICB8fHxcbiAgICAgICAgfHx8fFxuICAgICAgICB8I3xcbiAgICAgICAgfCMgYXxcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkge1xuICAgICAgICAgICAgJycgICAgICAgOicnIFxuICAgICAgICAgICAgJyAnICAgICAgOicgJ1xuICAgICAgICAgICAgJyAgJyAgICAgOicgICcgXG4gICAgICAgICAgICAnIC4gJyAgICA6JyAuICcgICAgXG4gICAgICAgICAgICAnIC4uICcgICA6JyAuLiAnICAgXG4gICAgICAgICAgICAnIC4uLiAnICA6JyAufC4gJyAgICBcbiAgICAgICAgICAgICcgLicgICAgIDonIC4nICAgXG4gICAgICAgICAgICAnIC4uJyAgICA6JyAuLicgIFxuICAgICAgICAgICAgJyAuLi4nICAgOicgLnwuJyAgIFxuICAgICAgICAgICAgJy4gJyAgICAgOicuICcgICBcbiAgICAgICAgICAgICcuLiAnICAgIDonLi4gJyAgXG4gICAgICAgICAgICAnLi4uICcgICA6Jy58LiAnICAgXG4gICAgICAgICAgICAnLiAgLicgICA6J3wnXG4gICAgICAgICAgICAnLiAgIC4nICA6J3x8J1xuICAgICAgICAgICAgJyMnICAgICAgOicjJ1xuICAgICAgICAgICAgJyMgYScgICAgOicjIGInXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICAudG8uZXFsIFwiXCJcIiAgICBcbiAgICAgICAgfHwgICAgICB8fFxuICAgICAgICB8IHwgICAgIHwgfFxuICAgICAgICB8ICB8ICAgIHwgIHxcbiAgICAgICAgfCAuIHwgICB8IC4gfFxuICAgICAgICB8IC4uIHwgIHwgLi4gfFxuICAgICAgICB8IC4uLiB8ICB8IC58LiB8XG4gICAgICAgIHwgLnwgICAgfCAufFxuICAgICAgICB8IC4ufCAgIHwgLi58XG4gICAgICAgIHwgLi4ufCAgfCAufC58XG4gICAgICAgIHwuIHwgICAgfC4gfFxuICAgICAgICB8Li4gfCAgIHwuLiB8XG4gICAgICAgIHwuLi4gfCAgfC58LiB8XG4gICAgICAgIHwuICAufCAgfHx8XG4gICAgICAgIHwuICAgLnwgIHx8fHxcbiAgICAgICAgfCN8ICAgICB8I3xcbiAgICAgICAgfCMgYXwgICB8IyBifFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBcIiAxIFxcbjIgXFxuICAzXCJcbiAgICAgICAgLnRvLmVxbCAnLi4uXFxufCAxIHxcXG58MiB8XFxufCAgM3xcXG4uLi4nXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG86IFwiIDEgXFxuMiBcXG4gIDNcIlxuICAgICAgICAudG8uZXFsICdvICAgLi4uXFxufCAxIHxcXG58MiB8XFxufCAgM3xcXG4uLi4nXG4gICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgYTogW1wiYSAgYlwiLCBcIjEgICAzXCIsIFwiICAgYyAgICBkICBlICAgXCJdXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgIHxhICBifFxuICAgICAgICAgICAgfDEgICAzfFxuICAgICAgICAgICAgfCAgIGMgICAgZCAgZSAgIHxcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAndHJpbScgLT5cbiAgICAgICAgbyA9IGE6IDEsIGI6IG51bGwsIGM6IDJcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYSAgMVxuICAgICAgICBiXG4gICAgICAgIGMgIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBhbGlnbjogdHJ1ZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhICAgMVxuICAgICAgICBiXG4gICAgICAgIGMgICAyXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB7YTogYjogYzogMX0sIGFsaWduOiB0cnVlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICBjICAgMVxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkge3g6IHk6IHo6IDF9LCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgeFxuICAgICAgICAgICAgeVxuICAgICAgICAgICAgICAgIHogIDFcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAnbWF4YWxpZ24nIC0+XG4gICAgICAgIG8gPSBvOiAxLCBvb09Pb286IDJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIG1heGFsaWduOiAyXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG8gIDFcbiAgICAgICAgb29PT29vICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgbWF4YWxpZ246IDRcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgbyAgIDFcbiAgICAgICAgb29PT29vICAyXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgbWF4YWxpZ246IDhcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgbyAgICAgICAxXG4gICAgICAgIG9vT09vbyAgMlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgbWF4YWxpZ246IDE4XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIG8gICAgICAgMVxuICAgICAgICBvb09Pb28gIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICB0ID0gZm9vZm9vOiBcbiAgICAgICAgICAgICBiYXJiYXJiYXI6IDFcbiAgICAgICAgICAgICBmb286IDJcbiAgICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IHRcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgZm9vZm9vXG4gICAgICAgICAgICBiYXJiYXJiYXIgICAxXG4gICAgICAgICAgICBmb28gICAgICAgICAyXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSB0LCBpbmRlbnQ6IDNcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgZm9vZm9vXG4gICAgICAgICAgIGJhcmJhcmJhciAgIDFcbiAgICAgICAgICAgZm9vICAgICAgICAgMlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICB0ID0gXG4gICAgICAgICAgICBmb29iYXI6IFxuICAgICAgICAgICAgICAgIGJhcmZvbzogMVxuICAgICAgICAgICAgICAgIGJhcjogMlxuICAgICAgICAgICAgZm9vOiBcbiAgICAgICAgICAgICAgICBiYXI6IDFcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgdFxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBmb29iYXJcbiAgICAgICAgICAgICAgICBiYXJmb28gIDFcbiAgICAgICAgICAgICAgICBiYXIgICAgIDJcbiAgICAgICAgZm9vXG4gICAgICAgICAgICAgICAgYmFyICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAnaW5kZW50JyAtPlxuICAgICAgICBvID0gYTogYjogYzogMVxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAyLCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgIGJcbiAgICAgICAgICAgIGMgIDFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6IDQsIGFsaWduOiBmYWxzZVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgYyAgMVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGluZGVudDogOCwgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAnICAnLCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgIGJcbiAgICAgICAgICAgIGMgIDFcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBpbmRlbnQ6ICcgICAgJywgYWxpZ246IGZhbHNlXG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICBjICAxXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgbywgaW5kZW50OiAnICAgICAgICAnLCBhbGlnbjogZmFsc2VcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYVxuICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgIDFcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAnY29tbWVudCcgLT5cbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSAnIydcbiAgICAgICAgLnRvLmVxbCBcInwjfFwiXG5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5ICcjZm9vJ1xuICAgICAgICAudG8uZXFsIFwifCNmb298XCJcblxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkgWycjIyMnLCAnIycsICcgICMgJ11cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgfCMjI3xcbiAgICAgICAgfCN8XG4gICAgICAgIHwgICMgfFxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICdqc29uJyAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBleHBlY3Qgbm9vbi5zdHJpbmdpZnkge1wiYVwiOiBcImJcIn0sIGV4dDogJy5qc29uJywgaW5kZW50OiA4XG4gICAgICAgIC50by5lcWwgXCJcIlwiXG4gICAgICAgIHtcbiAgICAgICAgICAgICAgICBcImFcIjogXCJiXCJcbiAgICAgICAgfVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgXG4gICAgaXQgJ3JlZ2V4cCcgLT5cbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IFsgL15oZWxsb1xcc3dvcmxkJC9naSwgL1tcXHdcXGRdKi8gXVxuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICBeaGVsbG9cXFxcc3dvcmxkJFxuICAgICAgICBbXFxcXHdcXFxcZF0qXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICBpdCAncmVnZXhwIHZhbHVlcycgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9vbi5zdHJpbmdpZnkge2E6IC9eaGVsbG9cXHN3b3JsZCQvZ2ksIGI6IC9bXFx3XFxkXSovfVxuICAgICAgICBleHBjdGQgPSBcImEgICBeaGVsbG9cXFxcc3dvcmxkJFxcbmIgICBbXFxcXHdcXFxcZF0qXCJcbiAgICAgICAgZXhwZWN0KHJlc3VsdCkgLnRvLmVxbCBleHBjdGRcblxuIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwMDAwICAgICAgMDAwMDAgICAgICAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ3N0cmluZ2lmeSBleHQnIC0+XG5cbiAgICBvID0gYTogMSwgYjogMiAgICBcbiAgICBpdCAnc2hvdWxkIG91dHB1dCBub29uIGJ5IGRlZmF1bHQnIC0+IFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG9cbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYSAgIDFcbiAgICAgICAgYiAgIDJcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAnc2hvdWxkIG91dHB1dCBub29uJyAtPiBcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdCBub29uLnN0cmluZ2lmeSBvLCBleHQ6ICcubm9vbidcbiAgICAgICAgLnRvLmVxbCBcIlwiXCJcbiAgICAgICAgYSAgIDFcbiAgICAgICAgYiAgIDJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgIGl0ICdzaG91bGQgb3V0cHV0IGpzb24nIC0+IFxuICAgICAgICBcbiAgICAgICAgZXhwZWN0IG5vb24uc3RyaW5naWZ5IG8sIGV4dDogJy5qc29uJ1xuICAgICAgICAudG8uZXFsIFwiXCJcIlxuICAgICAgICB7XG4gICAgICAgICAgICBcImFcIjogMSxcbiAgICAgICAgICAgIFwiYlwiOiAyXG4gICAgICAgIH1cbiAgICAgICAgXCJcIlwiXG4iXX0=
//# sourceURL=test.coffee