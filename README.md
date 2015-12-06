# noon
### 'nother ordinary object notation

![noon](https://raw.githubusercontent.com/monsterkodi/noon/master/img/noon.png)

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

stringifyDefaults =
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

### format

- only spaces are allowed for indentation.
- keys can have single spaces in them. 
- more than one space marks the end of a key.
- dictionary values and list items are always trimmed.
- dictionary values can contain longer space sequences.
- list items can't contain more than one space in a row.
- each list item is on it's own line.
- a dot is used as a placeholder for objects and lists inside of lists.

### caveats

This is in early alpha stadium and not meant to be completely foolproof.

Besides the limitations mentioned above, 
there are known issues with empty lists, empty objects and null values as 
well as potential conversions to strings when converting back and forth.

Don't expect your data to convert flawlessly!
