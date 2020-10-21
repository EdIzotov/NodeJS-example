module.exports.minimal = function(arrOfObjects, key) {
    var lowest = Number.POSITIVE_INFINITY;
    var tmp;
    for (var i = arrOfObjects.length - 1; i >= 0; i--) {
        tmp = arrOfObjects[i].key;
        if (tmp < lowest) {
            lowest = tmp;
        }
    }
    return lowest;
};

module.exports.maximal = function(arrOfObjects, key) {
    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    for (var i = arrOfObjects.length - 1; i >= 0; i--) {
        tmp = arrOfObjects[i][key];
        if (tmp > highest) {
            highest = tmp;
        }
    }
    return highest;
};

module.exports.summ = function(arrOfObjects, key) {
    var summ = 0;
    var tmp;
    for (var i = arrOfObjects.length - 1; i >= 0; i--) {
        tmp = arrOfObjects[i][key];
        summ = summ + tmp;
    }
    return summ;
};
