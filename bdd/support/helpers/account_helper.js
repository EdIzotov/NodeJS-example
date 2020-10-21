const world = require("../world.js");
const common = require("./common.js");
const { expect } = require("chai");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class accountHelper {
    createAccount(identity, amount, accountName) {
        const data = {
            currentBalance: amount,
            availableBalance: amount,
            spendingLimit: 0,
            identityId: identity.body.id
        };
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.createAccount;
        const cbsAuthHeader = world.getCbsAuthHeader();
        const clientToken = world.getCbsClientSessionToken();

        return request[req.method](req.path)
            .set(cbsAuthHeader, clientToken)
            .send(data)
            .then(res => {
                return common.parseJson(res, "create account");
            })
            .then(res => {
                if (typeof res === "string" && res.includes("error")) {
                    expect(res).to.equal(accountName + " is created");
                }
                expect(res).to.be.an("object");
                return res;
            });
    }

    getAccount(id) {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.getAccount;
        const path = req.path.replace("{id}", id);
        const cbsAuthHeader = world.getCbsAuthHeader();
        const clientToken = world.getCbsClientSessionToken();

        return request[req.method](path)
            .set(cbsAuthHeader, clientToken)
            .send()
            .then(res => common.parseJson(res, "get account"));
    }

    makeTransaction(account1, account2, amount, decsription) {
        const data = {
            keyId: "1",
            amount: amount,
            description: decsription,
            yourIdentityIOVAddress: account1.body.identity.iovMasterChainId,
            pubKey: world.pubKey,
            privKey: world.privKey,
            yourWalletAccountNumber: account1.body.iovSideChainId,
            counterpartyAccountNumber: account2.body.iovSideChainId,
            valuationTime: Date.now()
        };

        const transaction = world.sapOperations["trx"](data);

        const request = world.getSapConn();

        return request.sendWithPromise(JSON.stringify(transaction));
    }

    getBalance(account1) {
        const data = {
            keyId: "1",
            yourIdentityIOVAddress: account1.body.identity.iovMasterChainId,
            privKey: world.privKey,
            yourWalletAccountNumber: account1.body.iovSideChainId
        };

        const balance = world.sapOperations["balance"](data);

        const request = world.getSapConn();

        return request.sendWithPromise(JSON.stringify(balance));
    }

    getHistory(account) {
        const data = {
            keyId: "1",
            yourIdentityIOVAddress: account.body.identity.iovMasterChainId,
            privKey: world.privKey,
            yourWalletAccountNumber: account.body.iovSideChainId,
            from: new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000).getTime(), // last week
            to: new Date(new Date().getTime() + 60 * 60 * 24 * 1000).getTime()
        };

        const history = world.sapOperations["history"](data);

        const request = world.getSapConn();

        return request.sendWithPromise(JSON.stringify(history))
            .then(resp => {
                if(resp.error) {
                    throw resp;
                } else return resp;
            });;
    }

    getTransactionStatus(account, trxId) {
        const data = {
            keyId: "1",
            yourIdentityIOVAddress: account.body.identity.iovMasterChainId,
            privKey: world.privKey,
            yourWalletAccountNumber: account.body.iovSideChainId,
            transactionId: trxId
        };

        const trxStatus = world.sapOperations["trxstatus"](data);

        const request = world.getSapConn();

        return request.sendWithPromise(JSON.stringify(trxStatus))
            .then(resp => {
                if(resp.error) {
                    throw resp;
                } else return resp;
            });
    }

    getCurrentBalance(account1) {
        return this.getBalance(account1).then(balance => balance.body.current);
    }

    getCurrentBalanceFromBank(account) {
        return this.getAccount(account.body.id).then(
            account => account.body.currentBalance
        );
    }

    getBalanceFromAllNodes(account1) {
        const data = {
            keyId: "1",
            yourIdentityIOVAddress: account1.body.identity.iovMasterChainId,
            privKey: world.privKey,
            yourWalletAccountNumber: account1.body.iovSideChainId
        };

        const balance = world.sapOperations["balancereport"](data);

        const request = world.getSapConn();
        return request.sendWithPromise(JSON.stringify(balance));
    }
}

module.exports = new accountHelper();
