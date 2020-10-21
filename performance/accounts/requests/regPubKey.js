require('node-env-file')(__dirname + '/../../../.env');

const async = require('async');
const fs = require('fs');
const sapTransport = require(__dirname + '/../../../api/transport');
const sapConfig = require(__dirname + '/../../../config/sap.json')[process.env.NODE_ENV];
const SAP_DATA = require(__dirname + '/../../../api/operations');
const TYPES = require(__dirname + '/../../../api/operationTypes');
const privKey = fs.readFileSync(__dirname + '/../../../api/private.key');
const pubKey  = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==';

module.exports = function(data, done) {
    if(!data.identities || !data.accounts || !data.keys) {
        return done('Identity or account is undefined.');
    }
    const url = sapConfig.SAP.protocol + '://' + sapConfig.SAP.host + ':' + sapConfig.SAP.port + sapConfig.SAP.path;

    async.waterfall([
        (doneIn) => {
            let identity = data.identities[0];
            let account = data.accounts[0];
            let secretKey = data.keys[0];
            let keyId = 1;
            let acc = SAP_DATA[TYPES.PUBKEY]({
                yourIdentityIOVAddress: account.identity.iovMasterChainId,
                privKey: privKey,
                pubKey:  pubKey,
                secret:  secretKey,
                keyId: keyId
            });

            (new sapTransport(url)).send(JSON.stringify(acc), (err, res) => {
                if (err) {
                    doneIn(err);
                } else {
                    if(res && res.error) {
                        console.error(res);
                    }
                    doneIn();
                }
            });
        },
        (doneIn) => {
            let identity = data.identities[1];
            let account = data.accounts[1];
            let secretKey = data.keys[1];
            let keyId = 1;
            let acc = SAP_DATA[TYPES.PUBKEY]({
                yourIdentityIOVAddress: account.identity.iovMasterChainId,
                privKey: privKey,
                pubKey:  pubKey,
                secret:  secretKey,
                keyId: keyId
            });

            (new sapTransport(url)).send(JSON.stringify(acc), (err, res) => {
                if (err) {
                    doneIn(err);
                } else {
                    if(res && res.error) {
                        console.error(res);
                    }
                    doneIn();
                }
            });
        }
    ], (err, result) => {
        if (err) {
            console.error('REQUEST ERROR: ', err);
            process.exit(1);
        } else {
            console.log('  - Registering public keys ...');
            done(null, data);
        }
    });
};
