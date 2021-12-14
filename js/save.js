// monsterkodi/kode 0.123.0

var _k_

var save


save = function (p, data, strOpt, cb)
{
    var fs, path, stringify, str

    fs = require('fs')
    path = require('path')
    stringify = require('./stringify')
    if ('function' === typeof(strOpt))
    {
        cb = strOpt
        strOpt = {}
    }
    else
    {
        strOpt = (strOpt != null ? strOpt : {})
    }
    str = stringify(data,Object.assign({ext:path.extname(p),strOpt:strOpt}))
    if ('function' === typeof(cb))
    {
        return fs.writeFile(p,str,cb)
    }
    else
    {
        return fs.writeFileSync(p,str)
    }
}
module.exports = save