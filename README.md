# noon
### 'nother ordinary object notation

![noon](https://raw.githubusercontent.com/monsterkodi/noon/master/img/noon.png)

### format

- **hierarchy is expressed by indentation with spaces**.
```
grandpa
    parent
        child
        sibling
    uncle
```          
- **two or more spaces mark the end of a dictionary key**, therefore ...
- **keys and list items can have single spaces in them** but ...
- **only dictionary values can contain consecutive spaces**:
```
key 1    value 1
key 2    value 2 contains    spaces
```     
- **if trimming your strings is not an option**, you can escape:
```
a             |  leading spaces
b             trailing spaces  |
c             |  leading and trailing spaces  |
pipe symbol   |||
empty string  ||
```     
- **keys must be escaped from both ends**:
```
| s  pace |  key keeps spaces
|    |       key consists of spaces
||           key is empty string
```     
- **objects inside lists** are expressed like this:
```
.
    a  1
.
    b  2
```        
- **dense notation**:
```
key  . a .. b . c
```
  is equivalent to
```coffee-script
key
    a
        b
    c
```

#### advantages

- easy to read
- easy to write
- fast to parse 
- normally no need to escape characters

#### disadvantages
  
- keys can't start with the pipe symbol: |
- escaped keys can't contain the pipe symbol
- empty objects are not expressible

#### example files

* [language](https://github.com/monsterkodi/language-noon/blob/master/grammars/noon.noon)
* [urtil](https://github.com/monsterkodi/urtil/blob/gh-pages/examples/example)
* [font](https://github.com/monsterkodi/salter/blob/master/font.noon)
* [package](https://github.com/monsterkodi/noon/blob/master/package.noon)

### module

```coffee-script
noon = require 'noon'

# usage is similar to JSON 

noon.stringify { hello: 'world' }

# hello    world

noon.parse """
hello         world
what's up?    ☺
"""

# { hello: 'world', 'what\'s up?': '☺' }

stringify_options =  # stringify's second argument, defaults are: 
    indent:   4      # number of spaces per indent level
    align:    true   # vertically align object values
    maxalign: 32     # maximal number of spaces when aligning
    sort:     false  # sort object keys alphabetically
    circular: false  # check for circular references (expensive!)
    colors:   false  # colorize output with ansi colors
                     # custom dictionary or true for default colors:

defaultColors =
     key:     colors.bold.gray
     null:    colors.bold.blue
     value:   colors.bold.magenta
     string:  colors.bold.white
     visited: colors.bold.red

```

### caveats

This is in alpha stadium and not meant to be completely foolproof.  
Don't use it if you can't live with the limitations mentioned above.  
Don't expect your data to convert flawlessly!
