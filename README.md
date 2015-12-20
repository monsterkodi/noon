# noon
### 'nother ordinary object notation

![noon](https://raw.githubusercontent.com/monsterkodi/noon/master/img/noon.png)

### format

- **hierarchy is expressed by indentation with spaces**.
```coffee-script
      grandpa
          parent
              child
              sibling
          uncle
```          
- **two or more spaces mark the end of a dictionary key**, therefore ...
- **keys and list items can have single spaces in them** but ...
- **only dictionary values can contain consecutive spaces**:
```coffee-scrip
      key 1    value 1
      key 2    value 2 contains    spaces
```     
- **objects inside lists** are expressed like this:
```coffee-script
    .
        a  1
    .
        b  2
```        
- **dense notation**:
```coffee-script
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
- no need to escape characters

#### disadvantages

* non-string values and their string representation are indistinguishable 

     > e.g. the number **42** and the string **"42"** are both represented as **42**  
     > the same holds for other values, e.g. **true**, **false**, **null**, etc.
     
     > right now, the string representation is favored, but this will change in one of  
     > the next releases
  
* some limitations on keys and values

     * leading and trailing spaces are ignored:
       e.g. it is not possible to represent the string **" foo "**
     * keys can't just be a single dot
     * values can't start with a dot followed by spaces
     * empty objects are not expressible    

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
     key:     chalk.bold.gray
     null:    chalk.bold.blue
     value:   chalk.bold.magenta
     string:  chalk.bold.white
     visited: chalk.bold.red

```

### caveats

This is in alpha stadium and not meant to be completely foolproof.  
Don't use it if you can't live with the limitations mentioned above.  
Don't expect your data to convert flawlessly!
