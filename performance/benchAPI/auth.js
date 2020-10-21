const request = require('request');

module.exports = function(url, body, callback) {
    request.post({url: url, form: body}, function(err, httpResponse, body) {
        if (err) {
            console.log('Error: ' + error);
        } else {
            let cookie = httpResponse.headers['set-cookie'][0].split(';')[0];
            callback(null, cookie);
        }
    });
};
