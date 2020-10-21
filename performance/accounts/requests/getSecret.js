const cbsApi = require(__dirname + '/../../../cbs');
const async = require('async');

module.exports = function(data, done) {
    if(!data.identities || !data.accounts) {
        return done('Identity or account is undefined.');
    }
    async.waterfall([
        (doneIn) => {
            cbsApi['Identity'].createAccountsQR(data.accounts[0].identity, function (err, res) {
                if(err) {
                    doneIn(err);
                } else {
                    doneIn(null, res.body.secretKey);
                }
            });
        },
        (key1, doneIn) => {
            cbsApi['Identity'].createAccountsQR(data.accounts[1].identity, function (err, res) {
                if(err) {
                    doneIn(err);
                } else {
                    data.keys = [];
                    data.keys.push(key1);
                    data.keys.push(res.body.secretKey);
                    doneIn(null, data);
                }
            });
        }
    ], (err, result) => {
        if (err) {
            console.error('REQUEST ERROR: ', err);
            process.exit(1);
        } else {
            console.log('  - Getting secrets ...');
            done(null, result);
        }
    });
};
