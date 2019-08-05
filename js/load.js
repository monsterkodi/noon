// koffee 1.3.0

/*
000       0000000    0000000   0000000
000      000   000  000   000  000   000
000      000   000  000000000  000   000
000      000   000  000   000  000   000
0000000   0000000   000   000  0000000
 */
var load, parseStr;

parseStr = function(str, p, ext) {
    var extname;
    if (str.length <= 0) {
        return null;
    }
    extname = ext != null ? ext : require('path').extname(p);
    switch (extname) {
        case '.json':
            return JSON.parse(str);
        default:
            return require('./parse')(str);
    }
};

load = function(p, ext, cb) {
    var fs, str;
    fs = require('fs');
    if ('function' === typeof ext) {
        cb = ext;
    }
    if ('function' === typeof cb) {
        return fs.readFile(p, 'utf8', function(e, str) {
            if (e != null) {
                console.error("error reading file: " + p, e);
                return cb(null);
            } else {
                return cb(parseStr(str, p, ext));
            }
        });
    } else {
        str = fs.readFileSync(p, 'utf8');
        return parseStr(str, p, ext);
    }
};

module.exports = load;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsUUFBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxHQUFUO0FBRVAsUUFBQTtJQUFBLElBQUcsR0FBRyxDQUFDLE1BQUosSUFBYyxDQUFqQjtBQUNJLGVBQU8sS0FEWDs7SUFHQSxPQUFBLGlCQUFVLE1BQU0sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLE9BQWhCLENBQXdCLENBQXhCO0FBQ2hCLFlBQU8sT0FBUDtBQUFBLGFBQ1MsT0FEVDttQkFDc0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYO0FBRHRCO21CQUdRLE9BQUEsQ0FBUSxTQUFSLENBQUEsQ0FBbUIsR0FBbkI7QUFIUjtBQU5POztBQVdYLElBQUEsR0FBTyxTQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsRUFBVDtBQUVILFFBQUE7SUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7SUFFTCxJQUFZLFVBQUEsS0FBYyxPQUFPLEdBQWpDO1FBQUEsRUFBQSxHQUFLLElBQUw7O0lBRUEsSUFBRyxVQUFBLEtBQWMsT0FBTyxFQUF4QjtlQUVJLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixFQUFlLE1BQWYsRUFBdUIsU0FBQyxDQUFELEVBQUksR0FBSjtZQUNuQixJQUFHLFNBQUg7Z0JBQ0csT0FBQSxDQUFDLEtBQUQsQ0FBTyxzQkFBQSxHQUF1QixDQUE5QixFQUFtQyxDQUFuQzt1QkFDQyxFQUFBLENBQUcsSUFBSCxFQUZKO2FBQUEsTUFBQTt1QkFJSSxFQUFBLENBQUcsUUFBQSxDQUFTLEdBQVQsRUFBYyxDQUFkLEVBQWlCLEdBQWpCLENBQUgsRUFKSjs7UUFEbUIsQ0FBdkIsRUFGSjtLQUFBLE1BQUE7UUFTSSxHQUFBLEdBQU0sRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkI7ZUFFTixRQUFBLENBQVMsR0FBVCxFQUFjLENBQWQsRUFBaUIsR0FBakIsRUFYSjs7QUFORzs7QUFtQlAsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4wMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuIyMjXG5cbnBhcnNlU3RyID0gKHN0ciwgcCwgZXh0KSAtPlxuXG4gICAgaWYgc3RyLmxlbmd0aCA8PSAwXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICBleHRuYW1lID0gZXh0ID8gcmVxdWlyZSgncGF0aCcpLmV4dG5hbWUgcFxuICAgIHN3aXRjaCBleHRuYW1lXG4gICAgICAgIHdoZW4gJy5qc29uJyB0aGVuIEpTT04ucGFyc2Ugc3RyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlcXVpcmUoJy4vcGFyc2UnKSBzdHJcblxubG9hZCA9IChwLCBleHQsIGNiKSAtPlxuXG4gICAgZnMgPSByZXF1aXJlICdmcydcblxuICAgIGNiID0gZXh0IGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGV4dFxuXG4gICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcblxuICAgICAgICBmcy5yZWFkRmlsZSBwLCAndXRmOCcsIChlLCBzdHIpIC0+XG4gICAgICAgICAgICBpZiBlP1xuICAgICAgICAgICAgICAgIGVycm9yIFwiZXJyb3IgcmVhZGluZyBmaWxlOiAje3B9XCIsIGVcbiAgICAgICAgICAgICAgICBjYiBudWxsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2IgcGFyc2VTdHIgc3RyLCBwLCBleHRcbiAgICBlbHNlXG4gICAgICAgIHN0ciA9IGZzLnJlYWRGaWxlU3luYyBwLCAndXRmOCdcblxuICAgICAgICBwYXJzZVN0ciBzdHIsIHAsIGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IGxvYWRcbiJdfQ==
//# sourceURL=../coffee/load.coffee