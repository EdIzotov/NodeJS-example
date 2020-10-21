const crypto = require('crypto');
const fs = require('fs');
const privKey = fs.readFileSync(__dirname + '/../../test/data/private.key');
const uuidV1 = require('uuid/v1');
const sapConfig = require(__dirname + '/../../config/sap.json')[process.env.NODE_ENV];
const sapURL = sapConfig.SAP.protocol + '://' + sapConfig.SAP.host + ':' + sapConfig.SAP.port + sapConfig.SAP.path;
const cbsConfig = require(__dirname + '/../../config/cbs.json')[process.env.NODE_ENV];
const cbsURL = cbsConfig.CBS.url[0] + ':' + cbsConfig.CBS.port;

function signatureRsa(data, privateKey) {
    let signRsaSha256 = crypto.createSign('RSA-SHA256');
    signRsaSha256.write(data);
    signRsaSha256.end();
    return signRsaSha256.sign(privateKey, 'base64');  // 'latin1', 'hex' or 'base64'
}

function addSlashes(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

module.exports = function(accounts, test) {
    let data;
    if (test.type !== 'trx') {
        let bodyData = {
            id: uuidV1(),
            type: test.type,
            body: {
                authData: {
                    identity: accounts.identities[0].iovMasterChainId,
                    signature: signatureRsa(accounts.identities[0].iovMasterChainId, privKey),
                    keyId: '1'
                },
                iovAddress: accounts.accounts[0].iovSideChainId
            }
        };
        if (test.type === 'history') {
            let dateTo = new Date();
            bodyData.body.from = dateTo - 2592000000;
            bodyData.body.to = Math.round(dateTo.getTime());
            bodyData.body.limit = 10;
        }
        data = {
            tool: 'webSocket',
            requests: test.requestsPerWorker,
            keep_alive: test.keep_alive,
            displayErrors: true,
            displayFirst: true,
            concurrency: test.concurrency,
            server: sapURL,
            newUuid: true,
            type: test.type,
            data: addSlashes(JSON.stringify(bodyData))
        };
        return JSON.stringify(data).replace(/\\\\\\/g, '\\');
    } else {
        data = {
            tool: 'trxGen',
            requests: 1,
            warm_up_transactions: test.warm_up_transactions,
            identities: test.identities,
            keep_alive: test.keep_alive,
            accounts: test.accounts,
            transactions: test.transactions,
            cbsUrl: cbsURL,
            sapUrl: sapURL,
            concurrencySap: test.concurrencySAP,
            concurrencyCbs: test.concurrencyCBS,
            turn_on_cbs_north_api_mock_mode: test.turn_on_cbs_north_api_mock_mode
        };
        return JSON.stringify(data);
    }
};
