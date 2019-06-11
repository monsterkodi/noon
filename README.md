
![icon](./img/icon.png)

![noon](./img/noon.png)

### noon

is an object notation with a focus on human readability.

Whitespace is preferred over other control characters:

- Indentation is used to express hierarchy
- Strings don't need to be escaped
    - works well in config files
    - works well in [command line arguments](https://github.com/monsterkodi/colorcat/blob/master/test/test.sh)
    - good for storing [regexp patterns](https://github.com/monsterkodi/ko/blob/master/syntax/ko.noon)
    
### example files

* [package](https://github.com/monsterkodi/noon/blob/master/package.noon)
* [language](https://github.com/monsterkodi/language-noon/blob/master/grammars/noon.noon)
* [urtil](https://github.com/monsterkodi/urtil/blob/gh-pages/examples/example)
* [font](https://github.com/monsterkodi/salter/blob/master/font.noon)
* [menu](https://github.com/monsterkodi/kaligraf/blob/master/coffee/menu.noon)

### format

#### hierarchy

is expressed by indentation with spaces

```
grandpa
    parent
        child
        sibling
    uncle
```

#### dictionaries

two or more spaces mark the end of a dictionary key, therefore ...  
keys and list items can have single spaces in them but ...  
unescaped dictionary keys can't contain consecutive spaces:

```
key 1    value 1
key 2    value 2 contains    spaces
```   

#### one key makes an object

```
this is
an   object
```

the above as json: `{"this is": null, "an": "object"}`  
while 

```
this is
not an object
``` 

is equivalent to `["this is", "not an object"]`

#### objects inside lists 

are expressed like this:
```
.
    a  1
.
    b  2
```
the above as json: `[{"a": 1}, {"b": 2}]`

### strings

#### escaping

if trimming your strings is not an option, you can escape:

```
a             |  leading spaces
b             trailing spaces  |
c             |  leading and trailing spaces  |
pipe symbol   |||
empty string  ||
```     

keys must be escaped from both ends:

```
| s  pace |  key keeps spaces
|    |       key consists of spaces
||           key is empty string
```   

#### multiline strings

```
key  ...
value is
a text with
line breaks
which stops
now
...  
```

#### comments

```coffeescript
# comments start with the hash sign
# mixing of data and comments is not allowed
therefore:
    1 # this is not a comment
    | # neither is this one
      # but this one is 
```

### inline

sometimes data needs to be encoded in a single line. 

#### dense notation

```
key  . a .. b . c
```

is equivalent to

```
key
    a
        b
    c
```

#### one line notation

**::** represents a line break  
no spaces in keys allowed, therefore ...  
no two-space-seperation necessary:

```
key . a :: b . c :: d 1 :: e 2
```

is equivalent to

```
key
    a
b
    c
d   1
e   2
```

### command line

![cli](./img/cli.png)

### module

```coffeescript
noon = require 'noon'

# usage is similar to JSON 

noon.stringify { hello: 'world' }

# hello    world

noon.parse """
hello         world
what's up?    ☺
"""

# { hello: 'world', 'what\'s up?': '☺' }

stringify_options =   # stringify's second argument, defaults are: 
    ext:      'noon'  # output format: noon json or yaml
    indent:   4       # number of spaces per indent level
    align:    true    # vertically align object values
    maxalign: 32      # maximal number of spaces when aligning
    sort:     false   # sort object keys alphabetically
    circular: false   # check for circular references (expensive!)
    colors:   false   # colorize output with ansi colors
    
```

```coffeescript
# load data from file 

data = noon.load 'file.noon' 

# or any of the other types in noon.extnames:

data = noon.load 'file.json'
data = noon.load 'file.yaml'

```

```coffeescript
# write data to file

noon.save 'file.noon', data

# or

noon.save 'file.noon', data, stringify_options
noon.save 'file.json', data  # < write as json
noon.save 'filenoext', data, ext: 'noon'

```

### caveats

- keys can't start with the pipe symbol: |
- escaped keys can't contain the pipe symbol
- empty objects are not expressible

Don't use it if you can't live with the limitations mentioned above.  

[![npm package][npm-image]][npm-url] 
[![Build Status][travis-image]][travis-url] 
[![downloads][downloads-image]][downloads-url] 
[![Dependencies Status][david-image]][david-url]
[![Coverage Status](https://coveralls.io/repos/github/monsterkodi/noon/badge.svg?branch=master)](https://coveralls.io/github/monsterkodi/noon?branch=master)

[npm-image]:https://img.shields.io/npm/v/noon.svg
[npm-url]:http://npmjs.org/package/noon
[travis-image]:https://travis-ci.org/monsterkodi/noon.svg?branch=master
[travis-url]:https://travis-ci.org/monsterkodi/noon
[david-image]:https://david-dm.org/monsterkodi/noon/status.svg
[david-url]:https://david-dm.org/monsterkodi/noon
[downloads-image]:https://img.shields.io/npm/dm/noon.svg
[downloads-url]:https://www.npmtrends.com/noon
