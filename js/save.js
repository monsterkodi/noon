// monsterkodi/kode 0.223.0

var _k_

var save


save = function (p, data, strOpt, cb)
{
    var fs, path, str, stringify

    fs = require('fs')
    path = require('path')
    stringify = require('./stringify')
    if (typeof(strOpt) === 'function')
    {
        cb = strOpt
        strOpt = {}
    }
    else
    {
        strOpt = (strOpt != null ? strOpt : {})
    }
    str = stringify(data,Object.assign({ext:path.extname(p),strOpt:strOpt}))
    if (typeof(cb) === 'function')
    {
        return fs.writeFile(p,str,cb)
    }
    else
    {
        return fs.writeFileSync(p,str)
    }
}
module.exports = save