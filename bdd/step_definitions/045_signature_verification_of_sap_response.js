"use strict";

const {
    expect
} = require("chai");
const bankHelper = require("./../support/helpers/bank_helper.js");
const compositeHelper = require("./../support/facades/composite_helper.js");
const identityHelper = require("./../support/helpers/identity_helper.js");
const accountHelper = require("./../support/helpers/account_helper.js");
const numericUtil = require("./../../api/numericUtil");
const crypto = require("crypto");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: process.env.LOG_LEVEL
        })
    ]
});
const storage = require(__dirname + "/../../test/data/storage");

var Yadda = require("yadda");
var English = Yadda.localisation.English;

function verifySignature(iovAuth, data) {
    const iovKeyId = iovAuth.keyId;
    const nodeSignature = iovAuth.signature;
    const nodePublicKey = storage.get("IOV_PUBLIC_KEYS").find(function(el) {
        return el.keyId === iovKeyId;
    }).publicKey;
    const verifier = crypto.createVerify("SHA256");
    verifier.update(data);
    const verifyResult = verifier.verify('-----BEGIN PUBLIC KEY-----\n' + nodePublicKey + '\n-----END PUBLIC KEY-----', nodeSignature, 'base64');
    expect(verifyResult).to.equal(true);
}

module.exports = (function() {
    const variables = {};
    const balanceFrom = 1000;
    const balanceTo = 0;

    var library = English.library()

        .given("we create a new bank \\(with default data\\) and identity and 1000 and 0 accounts", function() {
            return bankHelper
                .createDefaultBank()
                .then(res => {
                    return identityHelper
                        .createDefaultIdentity(res)
                        .then(identity => {
                            return variables.identity = identity;
                        }).then(identity => {
                            return accountHelper
                                .createAccount(identity, balanceFrom, "account1")
                                .then(account => {
                                    variables.accountFrom = account;
                                    return identity;
                                });
                        })
                        .then(identity => {
                            return accountHelper
                                .createAccount(identity, balanceTo, "account2")
                                .then(account => {
                                    return variables.accountTo = account;
                                });
                        });
                });
        })

        .define("we add public key", function() {
            return identityHelper.generateQrCode(variables.identity).then(qrCode => {
                return identityHelper.addPubKey(variables.identity, qrCode, "1");
            }).then(pubKey => {
                return variables.pubKey = pubKey;
            });
        })

        .then("signature of add public key response should contains all data", function() {
            const res = variables.pubKey;

            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("id");
            expect(res).to.have.ownProperty("type");
            expect(res).to.not.have.ownProperty("errorCode");

            var data = Buffer.concat([
                new Buffer(res.authData.identity),
                new Buffer(res.authData.keyId),
                new Buffer(res.id),
                new Buffer(res.type)
            ]);

            return verifySignature(res.authData, data)
        })

        .when("we make a transaction", function() {
            return accountHelper.makeTransaction(variables.accountFrom, variables.accountTo, 0, "desc")
                .then(transaction => {
                    return variables.transaction = transaction;
                });
        })

        .then("signature of transaction response should contains all data", function() {
            const res = variables.transaction;

            var data = Buffer.concat([
                new Buffer(res.authData.identity),
                new Buffer(res.authData.keyId),
                new Buffer(res.id),
                new Buffer(res.type),
                new Buffer(numericUtil.convertDouble(res.body.currentChange)),
                new Buffer(numericUtil.convertDouble(res.body.availableChange)),
                new Buffer(numericUtil.convertDouble(res.body.currentBalance)),
                new Buffer(numericUtil.convertDouble(res.body.availableBalance)),
                new Buffer(numericUtil.convertLong(res.body.processedAt))
            ])

            return verifySignature(res.authData, data)

        })

        .when("we get balance", function() {
            return accountHelper.getBalance(variables.accountFrom)
                .then(balance => {
                    variables.balance = balance;
                    return balance;
                });
        })

        .given("we get history", function() {
            return accountHelper.getHistory(variables.accountFrom)
                .then(resp => {
                    variables.history = resp;
                    return resp;
                });
        })

        .then("signature of get balance response should contains all data", function() {
            const res = variables.balance;
            var data = Buffer.concat([
                new Buffer(res.authData.identity),
                new Buffer(res.authData.keyId),
                new Buffer(res.id),
                new Buffer(res.type),
                new Buffer(numericUtil.convertDouble(res.body.current)),
                new Buffer(numericUtil.convertDouble(res.body.available)),
                new Buffer(numericUtil.convertDouble(res.body.spendingLimit))
            ])

            return verifySignature(res.authData, data)

        })


        .then("signature of transaction history response should contains all data", function() {
            const res = variables.history;
            var buffers = res.body.entries.map(function(trx) {

                return Buffer.concat([
                    new Buffer(trx.trxId),
                    new Buffer(numericUtil.convertDouble(trx.currentChange)),
                    new Buffer(numericUtil.convertDouble(trx.availableChange)),
                    new Buffer(numericUtil.convertDouble(trx.spendingLimitChange)),
                    new Buffer(trx.counterparty),
                    new Buffer(trx.description),
                    new Buffer(trx.operation),
                    new Buffer(numericUtil.convertLong(trx.processedAt))
                ]);
            });

            var data = Buffer.concat([
                new Buffer(res.authData.identity),
                new Buffer(res.authData.keyId),
                new Buffer(res.id),
                new Buffer(res.type),
                Buffer.concat(buffers)
            ])

            return verifySignature(res.authData, data);
        })

        .given("we get the transaction status", function() {
            return accountHelper.getTransactionStatus(variables.accountFrom, variables.transaction.id)
                .then(status => {
                    variables.trxStatus = status;
                    return status;
                });
        })

        .then("signature of transaction status response should contains all data", function() {
            const res = variables.trxStatus;
            const data = Buffer.concat([
                new Buffer(res.authData.identity),
                new Buffer(res.authData.keyId),
                new Buffer(res.id),
                new Buffer(res.type),
                new Buffer(res.body.status.transactionId),
                new Buffer(numericUtil.convertDouble(res.body.status.currentChange)),
                new Buffer(numericUtil.convertDouble(res.body.status.availableChange)),
                new Buffer(numericUtil.convertDouble(res.body.status.spendingLimitChange)),
                new Buffer(numericUtil.convertDouble(res.body.status.currentBalance)),
                new Buffer(numericUtil.convertDouble(res.body.status.availableBalance)),
                new Buffer(numericUtil.convertDouble(res.body.status.spendingLimit)),
                new Buffer(res.body.status.operation),
                new Buffer(res.body.status.counterparty),
                new Buffer(res.body.status.description),
                new Buffer(numericUtil.convertLong(res.body.status.processedAt))
            ]);


            return verifySignature(res.authData, data);

        })

        .when("we remove public key", function() {
            return identityHelper.removePubKey(variables.identity, "1")
                .then(removePk => {
                    variables.removePk = removePk;
                });
        })

        .then("signature of remove public key response should contains all data", function() {
            const res = variables.removePk;
            var data = Buffer.concat([
                new Buffer(res.authData.identity),
                new Buffer(res.authData.keyId),
                new Buffer(res.id),
                new Buffer(res.type)
            ])

            return verifySignature(res.authData, data);
        })
    return library;
})();