// monsterkodi/kode 0.125.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var fs, path, stringify, parse, load, save, noon, args, err, pad, ext, d, o

fs = require('fs')
path = require('path')
stringify = require('./stringify')
parse = require('./parse')
load = require('./load')
save = require('./save')
noon = require('./main')
args = require('karg')(`noon
    file        . ? the file to convert             . * . = package.json
    output      . ? output file or filetype         . = noon
    indent      . ? indentation length              . = 4
    align       . ? align values                    . = true
    maxalign    . ? max align width, 0: no limit    . = 32
    sort        . ? sort keys alphabetically        . = false
    colors      . ? output with ansi colors         . = true
    type        . ? input filetype

supported filetypes:
    ${noon.extnames.join('\n    ')}

version   ${require(`${__dirname}/../package.json`).version}`)

err = function (msg)
{
    console.log(("\n" + msg + "\n").red)
    return process.exit()
}

pad = function (s, l)
{
    while (s.length < l)
    {
        s += ' '
    }
    return s
}
if (args.file)
{
    ext = path.extname(args.file)
    try
    {
        d = load(args.file,args.type)
    }
    catch (e)
    {
        err(e.stack)
    }
    if (_k_.in(args.output,noon.extensions))
    {
        args.output = '.' + args.output
    }
    if (_k_.in(args.output,noon.extnames))
    {
        if (args.output === '.noon')
        {
            o = {align:args.align,indent:Math.max(1,args.indent),maxalign:Math.max(0,args.maxalign),colors:args.colors,sort:args.sort}
        }
        else
        {
            o = {ext:args.output,colors:args.colors,indent:pad('',args.indent)}
        }
        console.log(stringify(d,o))
    }
    else
    {
        if (path.extname(args.output) === '.noon')
        {
            o = {align:args.align,indent:Math.max(1,args.indent),maxalign:Math.max(0,args.maxalign),colors:false,sort:args.sort}
        }
        else
        {
            o = {indent:pad('',args.indent)}
        }
        save(args.output,d,o)
    }
}