// koffee 0.43.0

/*
000   000   0000000    0000000   000   000
0000  000  000   000  000   000  0000  000
000 0 000  000   000  000   000  000 0 000
000  0000  000   000  000   000  000  0000
000   000   0000000    0000000   000   000
 */
var args, colors, d, e, err, ext, fs, load, noon, o, pad, parse, path, ref, save, stringify,
    indexOf = [].indexOf;

fs = require('fs');

path = require('path');

colors = require('colors');

pad = require('lodash.pad');

stringify = require('./stringify');

parse = require('./parse');

load = require('./load');

save = require('./save');

noon = require('./main');


/*
 0000000   00000000    0000000    0000000
000   000  000   000  000        000     
000000000  0000000    000  0000  0000000 
000   000  000   000  000   000       000
000   000  000   000   0000000   0000000
 */

args = require('karg')("noon\n    file        . ? the file to convert             . * . = package.json\n    output      . ? output file or filetype         . = .noon\n    indent      . ? indentation length              . = 4\n    align       . ? align values                    . = true\n    maxalign    . ? max align width, 0: no limit    . = 32\n    sort        . ? sort keys alphabetically        . = false\n    colors      . ? output with ansi colors         . = true\n    type        . ? input filetype\n    \nsupported filetypes:\n    " + (noon.extnames.join('\n    ')) + "\n\nversion   " + (require(__dirname + "/../package.json").version));

err = function(msg) {
    console.log(("\n" + msg + "\n").red);
    return process.exit();
};

if (args.file) {
    ext = path.extname(args.file);
    try {
        d = load(args.file, args.type);
    } catch (error) {
        e = error;
        err(e.stack);
    }
    if (ref = args.output, indexOf.call(noon.extnames, ref) >= 0) {
        if (args.output === '.noon') {
            o = {
                align: args.align,
                indent: Math.max(1, args.indent),
                maxalign: Math.max(0, args.maxalign),
                colors: args.colors,
                sort: args.sort
            };
        } else {
            o = {
                ext: args.output,
                indent: pad('', args.indent)
            };
        }
        console.log(stringify(d, o));
    } else {
        if (path.extname(args.output) === '.noon') {
            o = {
                align: args.align,
                indent: Math.max(1, args.indent),
                maxalign: Math.max(0, args.maxalign),
                colors: false,
                sort: args.sort
            };
        } else {
            o = {
                indent: pad('', args.indent)
            };
        }
        save(args.output, d, o);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUZBQUE7SUFBQTs7QUFRQSxFQUFBLEdBQVksT0FBQSxDQUFRLElBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztBQUNaLE1BQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7QUFDWixHQUFBLEdBQVksT0FBQSxDQUFRLFlBQVI7O0FBQ1osU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSOztBQUNaLEtBQUEsR0FBWSxPQUFBLENBQVEsU0FBUjs7QUFDWixJQUFBLEdBQVksT0FBQSxDQUFRLFFBQVI7O0FBQ1osSUFBQSxHQUFZLE9BQUEsQ0FBUSxRQUFSOztBQUNaLElBQUEsR0FBWSxPQUFBLENBQVEsUUFBUjs7O0FBRVo7Ozs7Ozs7O0FBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQUEsQ0FBZ0IsdWdCQUFBLEdBWWxCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFkLENBQW1CLFFBQW5CLENBQUQsQ0Faa0IsR0FZVyxnQkFaWCxHQWNaLENBQUMsT0FBQSxDQUFXLFNBQUQsR0FBVyxrQkFBckIsQ0FBdUMsQ0FBQyxPQUF6QyxDQWRKOztBQWlCUCxHQUFBLEdBQU0sU0FBQyxHQUFEO0lBQ0gsT0FBQSxDQUFDLEdBQUQsQ0FBSyxDQUFDLElBQUEsR0FBSyxHQUFMLEdBQVMsSUFBVixDQUFlLENBQUMsR0FBckI7V0FDQyxPQUFPLENBQUMsSUFBUixDQUFBO0FBRkU7O0FBSU4sSUFBRyxJQUFJLENBQUMsSUFBUjtJQUVJLEdBQUEsR0FBTSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQUksQ0FBQyxJQUFsQjtBQUVOO1FBQ0ksQ0FBQSxHQUFJLElBQUEsQ0FBSyxJQUFJLENBQUMsSUFBVixFQUFnQixJQUFJLENBQUMsSUFBckIsRUFEUjtLQUFBLGFBQUE7UUFFTTtRQUNGLEdBQUEsQ0FBSSxDQUFDLENBQUMsS0FBTixFQUhKOztJQUtBLFVBQUcsSUFBSSxDQUFDLE1BQUwsRUFBQSxhQUFlLElBQUksQ0FBQyxRQUFwQixFQUFBLEdBQUEsTUFBSDtRQUNJLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxPQUFsQjtZQUNJLENBQUEsR0FDSTtnQkFBQSxLQUFBLEVBQU8sSUFBSSxDQUFDLEtBQVo7Z0JBQ0EsTUFBQSxFQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLElBQUksQ0FBQyxNQUFqQixDQURSO2dCQUVBLFFBQUEsRUFBVSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxJQUFJLENBQUMsUUFBakIsQ0FGVjtnQkFHQSxNQUFBLEVBQVEsSUFBSSxDQUFDLE1BSGI7Z0JBSUEsSUFBQSxFQUFNLElBQUksQ0FBQyxJQUpYO2NBRlI7U0FBQSxNQUFBO1lBUUksQ0FBQSxHQUNJO2dCQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsTUFBVjtnQkFDQSxNQUFBLEVBQVEsR0FBQSxDQUFJLEVBQUosRUFBUSxJQUFJLENBQUMsTUFBYixDQURSO2NBVFI7O1FBV0EsT0FBQSxDQUFBLEdBQUEsQ0FBSSxTQUFBLENBQVUsQ0FBVixFQUFhLENBQWIsQ0FBSixFQVpKO0tBQUEsTUFBQTtRQWNJLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFJLENBQUMsTUFBbEIsQ0FBQSxLQUE2QixPQUFoQztZQUNJLENBQUEsR0FDSTtnQkFBQSxLQUFBLEVBQU8sSUFBSSxDQUFDLEtBQVo7Z0JBQ0EsTUFBQSxFQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLElBQUksQ0FBQyxNQUFqQixDQURSO2dCQUVBLFFBQUEsRUFBVSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxJQUFJLENBQUMsUUFBakIsQ0FGVjtnQkFHQSxNQUFBLEVBQVEsS0FIUjtnQkFJQSxJQUFBLEVBQU0sSUFBSSxDQUFDLElBSlg7Y0FGUjtTQUFBLE1BQUE7WUFRSSxDQUFBLEdBQ0k7Z0JBQUEsTUFBQSxFQUFRLEdBQUEsQ0FBSSxFQUFKLEVBQVEsSUFBSSxDQUFDLE1BQWIsQ0FBUjtjQVRSOztRQVVBLElBQUEsQ0FBSyxJQUFJLENBQUMsTUFBVixFQUFrQixDQUFsQixFQUFxQixDQUFyQixFQXhCSjtLQVRKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbmZzICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCAgICAgID0gcmVxdWlyZSAncGF0aCdcbmNvbG9ycyAgICA9IHJlcXVpcmUgJ2NvbG9ycydcbnBhZCAgICAgICA9IHJlcXVpcmUgJ2xvZGFzaC5wYWQnXG5zdHJpbmdpZnkgPSByZXF1aXJlICcuL3N0cmluZ2lmeSdcbnBhcnNlICAgICA9IHJlcXVpcmUgJy4vcGFyc2UnXG5sb2FkICAgICAgPSByZXF1aXJlICcuL2xvYWQnXG5zYXZlICAgICAgPSByZXF1aXJlICcuL3NhdmUnXG5ub29uICAgICAgPSByZXF1aXJlICcuL21haW4nXG5cbiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4jIyNcblxuYXJncyA9IHJlcXVpcmUoJ2thcmcnKSBcIlwiXCJcbm5vb25cbiAgICBmaWxlICAgICAgICAuID8gdGhlIGZpbGUgdG8gY29udmVydCAgICAgICAgICAgICAuICogLiA9IHBhY2thZ2UuanNvblxuICAgIG91dHB1dCAgICAgIC4gPyBvdXRwdXQgZmlsZSBvciBmaWxldHlwZSAgICAgICAgIC4gPSAubm9vblxuICAgIGluZGVudCAgICAgIC4gPyBpbmRlbnRhdGlvbiBsZW5ndGggICAgICAgICAgICAgIC4gPSA0XG4gICAgYWxpZ24gICAgICAgLiA/IGFsaWduIHZhbHVlcyAgICAgICAgICAgICAgICAgICAgLiA9IHRydWVcbiAgICBtYXhhbGlnbiAgICAuID8gbWF4IGFsaWduIHdpZHRoLCAwOiBubyBsaW1pdCAgICAuID0gMzJcbiAgICBzb3J0ICAgICAgICAuID8gc29ydCBrZXlzIGFscGhhYmV0aWNhbGx5ICAgICAgICAuID0gZmFsc2VcbiAgICBjb2xvcnMgICAgICAuID8gb3V0cHV0IHdpdGggYW5zaSBjb2xvcnMgICAgICAgICAuID0gdHJ1ZVxuICAgIHR5cGUgICAgICAgIC4gPyBpbnB1dCBmaWxldHlwZVxuICAgIFxuc3VwcG9ydGVkIGZpbGV0eXBlczpcbiAgICAje25vb24uZXh0bmFtZXMuam9pbiAnXFxuICAgICd9XG5cbnZlcnNpb24gICAje3JlcXVpcmUoXCIje19fZGlybmFtZX0vLi4vcGFja2FnZS5qc29uXCIpLnZlcnNpb259XG5cIlwiXCJcblxuZXJyID0gKG1zZykgLT5cbiAgICBsb2cgKFwiXFxuXCIrbXNnK1wiXFxuXCIpLnJlZFxuICAgIHByb2Nlc3MuZXhpdCgpXG5cbmlmIGFyZ3MuZmlsZVxuXG4gICAgZXh0ID0gcGF0aC5leHRuYW1lIGFyZ3MuZmlsZVxuXG4gICAgdHJ5XG4gICAgICAgIGQgPSBsb2FkIGFyZ3MuZmlsZSwgYXJncy50eXBlXG4gICAgY2F0Y2ggZVxuICAgICAgICBlcnIgZS5zdGFja1xuXG4gICAgaWYgYXJncy5vdXRwdXQgaW4gbm9vbi5leHRuYW1lc1xuICAgICAgICBpZiBhcmdzLm91dHB1dCA9PSAnLm5vb24nXG4gICAgICAgICAgICBvPSBcbiAgICAgICAgICAgICAgICBhbGlnbjogYXJncy5hbGlnblxuICAgICAgICAgICAgICAgIGluZGVudDogTWF0aC5tYXggMSwgYXJncy5pbmRlbnRcbiAgICAgICAgICAgICAgICBtYXhhbGlnbjogTWF0aC5tYXggMCwgYXJncy5tYXhhbGlnblxuICAgICAgICAgICAgICAgIGNvbG9yczogYXJncy5jb2xvcnNcbiAgICAgICAgICAgICAgICBzb3J0OiBhcmdzLnNvcnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbyA9IFxuICAgICAgICAgICAgICAgIGV4dDogYXJncy5vdXRwdXRcbiAgICAgICAgICAgICAgICBpbmRlbnQ6IHBhZCAnJywgYXJncy5pbmRlbnRcbiAgICAgICAgbG9nIHN0cmluZ2lmeSBkLCBvXG4gICAgZWxzZVxuICAgICAgICBpZiBwYXRoLmV4dG5hbWUoYXJncy5vdXRwdXQpID09ICcubm9vbidcbiAgICAgICAgICAgIG8gPSBcbiAgICAgICAgICAgICAgICBhbGlnbjogYXJncy5hbGlnblxuICAgICAgICAgICAgICAgIGluZGVudDogTWF0aC5tYXggMSwgYXJncy5pbmRlbnRcbiAgICAgICAgICAgICAgICBtYXhhbGlnbjogTWF0aC5tYXggMCwgYXJncy5tYXhhbGlnblxuICAgICAgICAgICAgICAgIGNvbG9yczogZmFsc2VcbiAgICAgICAgICAgICAgICBzb3J0OiBhcmdzLnNvcnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbyA9IFxuICAgICAgICAgICAgICAgIGluZGVudDogcGFkICcnLCBhcmdzLmluZGVudFxuICAgICAgICBzYXZlIGFyZ3Mub3V0cHV0LCBkLCBvIFxuIl19
//# sourceURL=../coffee/noon.coffee