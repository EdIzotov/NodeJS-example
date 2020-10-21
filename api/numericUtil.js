module.exports = {
 evenRound: function(num, decimalPlaces) {
    var d = decimalPlaces || 0;
    var m = Math.pow(10, d);
    var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
    var i = Math.floor(n), f = n - i;
    var e = 1e-8; // Allow for rounding errors in f
    var r = (f > 0.5 - e && f < 0.5 + e) ?
        ((i % 2 == 0) ? i : i + 1) : Math.round(n);
    return d ? r / m : r;
},

 unscaledValue: function(n, decimalPlaces) {
    var nn = this.evenRound(n, decimalPlaces);
    var value = parseInt(nn, 10);
    var nstring = (nn + ""),
        nindex  = nstring.indexOf("."),
        decimal  = (nindex > -1 ? nstring.substring(nindex + 1) : "00000");

    if(decimal.length < 5) {
        var l = 5 - decimal.length;
        for(var i = 0; i < l; i++) {
            decimal += "0";
        }
    }
    return value + decimal;
},

convertDouble: function(double) {
    return this.convertLong(this.unscaledValue(double, 5));
},

convertLong: function(long) {

    // if (long > Number.MAX_SAFE_INTEGER || long < Number.MIN_SAFE_INTEGER) {
    //    return [];
    // }

    var size = 8;

    var barr = [];
    for (var i = 0; i < size; i++) {
        var b = long & 0xff;
        barr.push(b);
        long = (long - b) / 256;
    }

    var arr = barr.map(function(el) {
        return (el > 127) ? el - 256 : el;
    });

    while(arr[arr.length-1] === 0 && (arr[arr.length-2] >= 0)){
        arr.pop();
    }

    while(arr[arr.length-1] === -1 && (arr[arr.length-2] < 0)){
        arr.pop();
    }

    return arr.reverse();
    }
};
