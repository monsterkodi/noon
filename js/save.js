// koffee 0.52.0

/*
 0000000   0000000   000   000  00000000
000       000   000  000   000  000     
0000000   000000000   000 000   0000000 
     000  000   000     000     000     
0000000   000   000      0      00000000
 */
var save;

save = function(p, data, strOpt, cb) {
    var defaults, fs, path, str, stringify;
    fs = require('fs');
    path = require('path');
    defaults = require('lodash.defaults');
    stringify = require('./stringify');
    if ('function' === typeof strOpt) {
        cb = strOpt;
        strOpt = {};
    } else {
        if (strOpt != null) {
            strOpt;
        } else {
            strOpt = {};
        }
    }
    str = stringify(data, defaults({
        ext: path.extname(p)
    }, strOpt));
    if ('function' === typeof cb) {
        return fs.writeFile(p, str, cb);
    } else {
        return fs.writeFileSync(p, str);
    }
};

module.exports = save;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFPLFNBQUMsQ0FBRCxFQUFJLElBQUosRUFBVSxNQUFWLEVBQWtCLEVBQWxCO0FBRUgsUUFBQTtJQUFBLEVBQUEsR0FBYSxPQUFBLENBQVEsSUFBUjtJQUNiLElBQUEsR0FBYSxPQUFBLENBQVEsTUFBUjtJQUNiLFFBQUEsR0FBYSxPQUFBLENBQVEsaUJBQVI7SUFDYixTQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVI7SUFFYixJQUFHLFVBQUEsS0FBYyxPQUFPLE1BQXhCO1FBQ0ksRUFBQSxHQUFLO1FBQ0wsTUFBQSxHQUFTLEdBRmI7S0FBQSxNQUFBOztZQUlJOztZQUFBLFNBQVU7U0FKZDs7SUFNQSxHQUFBLEdBQU0sU0FBQSxDQUFVLElBQVYsRUFBZ0IsUUFBQSxDQUFTO1FBQUEsR0FBQSxFQUFJLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixDQUFKO0tBQVQsRUFBOEIsTUFBOUIsQ0FBaEI7SUFFTixJQUFHLFVBQUEsS0FBYyxPQUFPLEVBQXhCO2VBRUksRUFBRSxDQUFDLFNBQUgsQ0FBYSxDQUFiLEVBQWdCLEdBQWhCLEVBQXFCLEVBQXJCLEVBRko7S0FBQSxNQUFBO2VBTUksRUFBRSxDQUFDLGFBQUgsQ0FBaUIsQ0FBakIsRUFBb0IsR0FBcEIsRUFOSjs7QUFmRzs7QUF1QlAsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbjAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCBcbiAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDBcbiMjI1xuXG5zYXZlID0gKHAsIGRhdGEsIHN0ck9wdCwgY2IpIC0+XG5cbiAgICBmcyAgICAgICAgID0gcmVxdWlyZSAnZnMnXG4gICAgcGF0aCAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgZGVmYXVsdHMgICA9IHJlcXVpcmUgJ2xvZGFzaC5kZWZhdWx0cydcbiAgICBzdHJpbmdpZnkgID0gcmVxdWlyZSAnLi9zdHJpbmdpZnknXG4gICAgXG4gICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygc3RyT3B0XG4gICAgICAgIGNiID0gc3RyT3B0IFxuICAgICAgICBzdHJPcHQgPSB7fVxuICAgIGVsc2VcbiAgICAgICAgc3RyT3B0ID89IHt9XG4gICAgXG4gICAgc3RyID0gc3RyaW5naWZ5IGRhdGEsIGRlZmF1bHRzIGV4dDpwYXRoLmV4dG5hbWUocCksIHN0ck9wdFxuICAgICAgICBcbiAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICBcbiAgICAgICAgZnMud3JpdGVGaWxlIHAsIHN0ciwgY2JcbiAgICAgICAgXG4gICAgZWxzZVxuICAgIFxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHAsIHN0clxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhdmVcbiJdfQ==
//# sourceURL=../coffee/save.coffee