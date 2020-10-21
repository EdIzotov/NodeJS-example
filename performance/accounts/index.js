const async = require('async');
const readBanks = require(__dirname + '/requests/readBanks');
const createIdentity = require(__dirname + '/requests/createIdentity');
const createAccount = require(__dirname + '/requests/createAccount');
const getSecret = require(__dirname + '/requests/getSecret');
const regPubKey = require(__dirname + '/requests/regPubKey');

module.exports = function(doneIn) {
    console.log('Creating identities and accounts');
    async.waterfall([
        (done) => {
            readBanks(done);
        },
        (bank, done) => {
            createIdentity(bank, done);
        },
        (identities, done) => {
            createAccount(identities, done);
        },
        (accounts, done) => {
            getSecret(accounts, done);
        },
        (data, done) => {
            regPubKey(data, done);
        }
    ], (err, result) => {
        if (err) {
            console.error('REQUEST ERROR: ', err);
            process.exit(1);
        } else {
            console.log('  Done!');
            doneIn(null, result);
        }
    });
};
