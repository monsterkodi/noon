// monsterkodi/kode 0.123.0

var _k_

var parseStr, load


parseStr = function (str, p, ext)
{
    if (str.length <= 0)
    {
        return null
    }
    switch ((ext != null ? ext : require('path').extname(p)))
    {
        case '.json':
            return JSON.parse(str)

        default:
            return require('./parse')(str)
    }

}

load = function (p, ext, cb)
{
    var fs, str

    fs = require('fs')
    if ('function' === typeof(ext))
    {
        cb = ext
    }
    if ('function' === typeof(cb))
    {
        return fs.readFile(p,'utf8',function (e, str)
        {
            if ((e != null))
            {
                console.error(`error reading file: ${p}`,e)
                return cb(null)
            }
            else
            {
                return cb(parseStr(str,p,ext))
            }
        })
    }
    else
    {
        str = fs.readFileSync(p,'utf8')
        return parseStr(str,p,ext)
    }
}
module.exports = load