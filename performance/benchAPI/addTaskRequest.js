const request = require('request');

module.exports = function(url, cookie, body, done) {
    request.post({url: url, body: body, headers: { Cookie: cookie, "Content-Type": "application/json" }}, function(error, httpResponse, res) {
        if (error) {
            console.log('Error: ' + error);
        } else {
            done(null, JSON.parse(res), cookie);
        }
    });
};
