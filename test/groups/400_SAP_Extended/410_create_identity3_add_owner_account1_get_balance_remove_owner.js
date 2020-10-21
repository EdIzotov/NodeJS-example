require("node-env-file")(__dirname + "/../../../.env");
const async = require("async");
const testsConfig = require(__dirname + "/../../../config/tests.json");
const sapTransport = require(__dirname + "/../../../api/transport");
const sapConfig = require(__dirname + "/../../../config/sap.json")[
    process.env.NODE_ENV
];
const cbsApi = require(__dirname + "/../../../cbs");
const fs = require("fs");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
var url = "";
if (fs.existsSync(__dirname + "/../../../iov_env.conf")) {
    require("node-env-file")(__dirname + "/../../../iov_env.conf");
    url = "http://" + process.env.sap_host + sapConfig.SAP.path;
    cbsApi.setCbsUrl("http://" + process.env.cbs_host);
} else {
    url =
        sapConfig.SAP.protocol +
        "://" +
        sapConfig.SAP.host +
        ":" +
        sapConfig.SAP.port +
        sapConfig.SAP.path;
}

const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const TYPES = require(__dirname + "/../../../api/operationTypes");
const storage = require(__dirname + "/../../data/storage");
const SAP_DATA = require(__dirname + "/../../../api/operations");

const privKey = fs.readFileSync(__dirname + "/../../data/private.key");
const privKey2 = fs.readFileSync(__dirname + "/../../data/private2.key");
const pubKey2 =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALDFdVlq9s7Tq6LDm5FwgW2fzHMtPz/ILLnNIouqAunqyTlJgLy6PRjExm2p78zmsJysrkXSC4zO8i60NhSlHNcCAwEAAQ==";

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);
        it("should send without error", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let account1 = JSON.parse(process.env["400_account2"]);
    let account2 = JSON.parse(process.env["400_account3"]);
    let identityNewOwner = account2.identity;

    let keyId1 = process.env["400_keyId2"];
    let keyId2 = process.env["400_keyId3"];

    let amount1 = parseFloat(process.env["400_amount2"]);
    let amount2 = parseFloat(process.env["400_amount3"]);
    let trxAmount = parseFloat(process.env["400_trxAmount"]);

    async.waterfall(
        [
            done => {
                logger.info("Request: CBS add new account owner");

                cbsApi["Account"].addAccountOwner(
                    account1,
                    identityNewOwner,
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");

                            done();
                        }
                    }
                );
            },
            done => {
                logger.info("Request: SAP balance via new owner identity3");

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: identityNewOwner.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: keyId2
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && res.errorCode) {
                            logger.error(res);
                        }
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("id");
                        expect(res.id).to.equal(data.id);
                        expect(res).to.have.ownProperty("type");
                        expect(res.type).to.equal(data.type);
                        expect(res).to.not.have.ownProperty("errorCode");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("current");
                        expect(res.body).to.have.ownProperty("available");
                        expect(res.body).to.have.ownProperty("spendingLimit");
                        expect(res.body.current).to.equal(amount1);

                        done();
                    }
                });
            },
            done => {
                logger.info("Request: SAP trx from new account owner");

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: identityNewOwner.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    counterpartyAccountNumber: account2.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId2
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && res.errorCode) {
                            logger.error(res);
                        }
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("id");
                        expect(res.id).to.equal(data.id);
                        expect(res).to.have.ownProperty("type");
                        expect(res.type).to.equal(data.type);
                        expect(res).to.not.have.ownProperty("errorCode");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("currentChange");
                        expect(res.body).to.have.ownProperty("availableChange");
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body).to.have.ownProperty(
                            "availableBalance"
                        );
                        expect(res.body).to.have.ownProperty("processedAt");

                        expect(res.body.currentBalance).to.equal(
                            amount1 - trxAmount
                        );

                        amount1 -= trxAmount;
                        amount2 += trxAmount;

                        setTimeout(
                            () => done(null, res.id),
                            testsConfig.beforeTestTimeout
                        );
                    }
                });
            },
            (trxId, done) => {
                logger.info("Request: SAP trxstatus from new owner");

                let data = SAP_DATA[TYPES.TRXSTATUS]({
                    yourIdentityIOVAddress: identityNewOwner.iovMasterChainId,
                    privKey: privKey,
                    transactionId: trxId,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: keyId2
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && res.errorCode) {
                            logger.error(res);
                        }

                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("id");
                        expect(res.id).to.equal(data.id);
                        expect(res).to.have.ownProperty("type");
                        expect(res.type).to.equal(data.type);
                        expect(res).to.not.have.ownProperty("errorCode");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("status");
                        expect(res.body.status).to.be.an("object");
                        expect(res.body.status).to.have.ownProperty(
                            "transactionId"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "currentChange"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "availableChange"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "spendingLimitChange"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "currentBalance"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "availableBalance"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "spendingLimit"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "processedAt"
                        );
                        expect(res.body.status).to.have.ownProperty(
                            "operation"
                        );
                        expect(res.body.status.transactionId).to.equal(trxId);
                        expect(res.body.status.currentBalance).to.equal(
                            amount1
                        );
                        expect(res.body.status.operation).to.equal("Debit");

                        done(null, trxId);
                    }
                });
            },
            (trxId, done) => {
                logger.info("Request: SAP history via new account owner");

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: identityNewOwner.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    from: new Date(
                        new Date().getTime() - 60 * 60 * 24 * 7 * 1000
                    ).getTime(), // last week
                    to: new Date(
                        new Date().getTime() + 60 * 60 * 24 * 1000
                    ).getTime(),
                    keyId: keyId2
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && res.errorCode) {
                            logger.error(res);
                        }

                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("id");
                        expect(res.id).to.equal(data.id);
                        expect(res).to.have.ownProperty("type");
                        expect(res.type).to.equal(data.type);
                        expect(res).to.not.have.ownProperty("errorCode");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("entries");
                        expect(res.body.entries).to.be.instanceof(Array);
                        expect(res.body.entries).to.have.length.above(0);

                        var trx;
                        for (let i = 0; i < res.body.entries.length; i++) {
                            if (res.body.entries[i].trxId === trxId) {
                                trx = res.body.entries[i];
                                break;
                            }
                        }

                        expect(trx).to.be.an("object");
                        expect(trx).to.have.ownProperty("counterparty");
                        expect(trx).to.have.ownProperty("operation");
                        expect(trx).to.have.ownProperty("currentChange");
                        expect(trx).to.have.ownProperty("availableChange");
                        expect(trx).to.have.ownProperty("spendingLimitChange");
                        expect(trx).to.have.ownProperty("processedAt");
                        expect(trx.counterparty).to.equal(
                            account2.iovSideChainId
                        );
                        expect(trx.operation).to.equal("Debit");
                        expect(trx.currentChange).to.equal(trxAmount * -1);

                        done();
                    }
                });
            },
            done => {
                logger.info("Request: SAP balance for old account owner");

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: keyId1
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && res.errorCode) {
                            logger.error(res);
                        }
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("id");
                        expect(res.id).to.equal(data.id);
                        expect(res).to.have.ownProperty("type");
                        expect(res.type).to.equal(data.type);
                        expect(res).to.not.have.ownProperty("errorCode");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("current");
                        expect(res.body.current).to.equal(amount1);

                        done();
                    }
                });
            },
            done => {
                logger.info("Request: SAP balance for own account new owner");

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account2.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account2.iovSideChainId,
                    keyId: keyId2
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && res.errorCode) {
                            logger.error(res);
                        }
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("id");
                        expect(res.id).to.equal(data.id);
                        expect(res).to.have.ownProperty("type");
                        expect(res.type).to.equal(data.type);
                        expect(res).to.not.have.ownProperty("errorCode");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("current");
                        expect(res.body.current).to.equal(amount2);

                        done();
                    }
                });
            },
            done => {
                logger.info(
                    "Request: remove identity3 from owners identity1/account"
                );

                cbsApi["Account"].removeAccountOwner(
                    account2,
                    identityNewOwner,
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");

                            done(null);
                        }
                    }
                );
            },
            done => {
                logger.info(
                    "Request: SAP balance, attempt to get balance through identity that has already been removed from the owners."
                );

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: identityNewOwner.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account2.iovSideChainId,
                    keyId: keyId2
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");

                        done();
                    }
                });
            }
        ],
        (err, result) => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(0);
            } else {
                resolve();
            }
        }
    );
}
