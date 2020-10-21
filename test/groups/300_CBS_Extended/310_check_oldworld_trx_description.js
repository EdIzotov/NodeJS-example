require("node-env-file")(__dirname + "/../../../.env");

const async = require("async");
const testsConfig = require(__dirname + "/../../../config/tests.json");
const fs = require("fs");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const sapTransport = require(__dirname + "/../../../api/transport");
const sapConfig = require(__dirname + "/../../../config/sap.json")[
    process.env.NODE_ENV
];
const cbsApi = require(__dirname + "/../../../cbs");
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
const SAP_DATA = require(__dirname + "/../../../api/operations");

const privKey = fs.readFileSync(__dirname + "/../../data/private.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";
const uuidV1 = require("uuid/v1");

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);
        it("should send without error", function(resolve) {
            // skip in anticipation of release to the new version of CBS
            return this.skip();
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let keyId = process.env["300_keyId2"];
    let keyId2 = process.env["300_keyId3"];
    let trxAmount = parseFloat(process.env["300_trxAmount"]);
    let account1 = JSON.parse(process.env["300_account2"]);
    let account2 = JSON.parse(process.env["300_account3"]);

    let trxDescription =
        "OldWorld trx. Test description. Timestamp: " + Date.now();
    let trxId = uuidV1();

    async.waterfall(
        [
            done => {
                // Old World trx

                let data = {
                    amount: trxAmount,
                    description: trxDescription,
                    iovTransactionId: trxId
                };

                logger.info(
                    "Make request to CBS oldWord transaction from identity1/account to identity2"
                );

                cbsApi["oldWorld"].transferAmount(
                    account1,
                    account2,
                    data,
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            setTimeout(() => {
                                done();
                            }, testsConfig.beforeTestTimeout);
                        }
                    }
                );
            },
            done => {
                // get history for account1 and search trx by description

                logger.info(
                    "Make request to SAP history for identity1/account"
                );

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    from: new Date(
                        new Date().getTime() - 60 * 60 * 124 * 7 * 1000
                    ).getTime(), // last week
                    to: new Date(
                        new Date().getTime() + 60 * 60 * 124 * 1000
                    ).getTime(),
                    keyId: keyId
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

                        let trx;

                        for (let i = 0; i < res.body.entries.length; i++) {
                            if (
                                res.body.entries[i].description ===
                                trxDescription
                            ) {
                                trx = res.body.entries[i];
                                break;
                            }
                        }
                        expect(trx).to.be.an("object");
                        //                        expect(trx).to.have.ownProperty("counterparty");
                        //                        expect(trx.counterparty).to.equal(
                        //                            account1.iovSideChainId
                        //                        );
                        expect(trx).to.have.ownProperty("description");
                        expect(trx.description).to.equal(trxDescription);
                        expect(trx.availableChange).to.equal(trxAmount * -1);
                        expect(trx).to.have.ownProperty("operation");
                        expect(trx.operation).to.equal("Debit");

                        done();
                    }
                });
            },
            done => {
                // get trx status account1

                logger.info(
                    "Make request to SAP trx status for identity1/account"
                );

                let data = SAP_DATA[TYPES.TRXSTATUS]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    transactionId: trxId,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: keyId
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
                            "description"
                        );
                        expect(res.body.status.description).to.equal(
                            trxDescription
                        );

                        done();
                    }
                });
            },
            done => {
                // get history for account2 and search trx by description

                logger.info(
                    "Make request to SAP history for identity2/account"
                );

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: account2.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account2.iovSideChainId,
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

                        let trx;

                        for (let i = 0; i < res.body.entries.length; i++) {
                            if (
                                res.body.entries[i].description ===
                                trxDescription
                            ) {
                                trx = res.body.entries[i];
                                break;
                            }
                        }

                        expect(trx).to.be.an("object");
                        //                        expect(trx).to.have.ownProperty("counterparty");
                        //                        expect(trx.counterparty).to.equal(
                        //                            account2.iovSideChainId
                        //                        );
                        expect(trx).to.have.ownProperty("description");
                        expect(trx.description).to.equal(trxDescription);
                        expect(trx.availableChange).to.equal(trxAmount);
                        expect(trx).to.have.ownProperty("operation");
                        expect(trx.operation).to.equal("Credit");

                        done();
                    }
                });
            },
            done => {
                // get trx status account2

                logger.info(
                    "Make request to SAP trx status for identity2/account"
                );

                let data = SAP_DATA[TYPES.TRXSTATUS]({
                    yourIdentityIOVAddress: account2.identity.iovMasterChainId,
                    privKey: privKey,
                    transactionId: trxId,
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
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("status");
                        expect(res.body.status).to.be.an("object");
                        expect(res.body.status).to.have.ownProperty(
                            "description"
                        );
                        expect(res.body.status.description).to.equal(
                            trxDescription
                        );

                        done();
                    }
                });
            }
        ],
        err => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(1);
            } else {
                resolve();
            }
        }
    );
}
