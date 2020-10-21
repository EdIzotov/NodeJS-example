const { expect } = require("chai");

class Async {
    eventually(callAsync, expected, interval = 500, expireAt = 3000) {
        return new Promise(function(resolve, reject) {
            try {
                expect(interval).to.be.at.least(100, "eventually interval, ms");
            } catch (error) {
                reject(error);
            }
            var failResult = expected;
            function next(ms) {
                //console.log("ms", ms, ", time: ", Date.now());
                if (ms >= expireAt) {
                    try {
                        expect(expected).to.equal(failResult);
                    } catch (error) {
                        reject(error);
                    }
                    return;
                }

                callAsync().then(res => {
                    if (res === expected) {
                        //console.log("RESOLVED. expected", res);
                        resolve(expected);
                    } else {
                        failResult = res;
                        setTimeout(() => next(ms + interval), interval);
                    }
                });
            }
            next(0);
        });
    }
}

module.exports = new Async();
