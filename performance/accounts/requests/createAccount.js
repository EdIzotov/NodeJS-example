const cbsApi = require(__dirname + '/../../../cbs');
const async = require('async');

module.exports = function(data, done) {
    let amount1 = 1000000;
    let amount2 = 0;
    if(!data.identities) {
        return done('Identity is undefined.');
    }
    async.waterfall([
        (doneIn) => {
            cbsApi['Account'].create({
                "identity": data.identities[0],
                "currency": "EUR",
                "amount": parseFloat(amount1),
                "currentBalance": parseFloat(amount1),
                "availableBalance": parseFloat(amount1),
                "spendingLimit": 0
            }, function(err, res) {
                if(err) {
                    doneIn(err);
                } else {
                    doneIn(null, res.body);
                }
            });
        },
        (acc1, doneIn) => {
            cbsApi['Account'].create({
                "identity": data.identities[1],
                "currency": "EUR",
                "amount": parseFloat(amount2),
                "currentBalance": parseFloat(amount2),
                "availableBalance": parseFloat(amount2),
                "spendingLimit": 0
            }, function(err, res) {
                if(err) {
                    doneIn(err);
                } else {
                    data.accounts = [];
                    data.accounts.push(acc1);
                    data.accounts.push(res.body);
                    doneIn(null, data);
                }
            });
        }
    ], (err, result) => {
        if (err) {
            console.error('REQUEST ERROR: ', err);
            process.exit(1);
        } else {
            console.log('  - Creating accounts ...');
            done(null, result);
        }
    });
};
