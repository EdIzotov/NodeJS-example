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
    let amount_non_ahg1 = parseFloat(process.env["600_amount_non_ahg8"]);
    let amount_non_ahg2 = parseFloat(process.env["600_amount_non_ahg9"]);
    let keyId = process.env["600_keyId8"];
    let trxAmount = parseFloat(process.env["600_trxAmount"]);
    let account1 = JSON.parse(process.env["600_non_ahg_account8"]);
    let account2 = JSON.parse(process.env["600_non_ahg_account9"]);
    let trxDescription = "test description " + testOperation;

    async.waterfall(
        [
            done => {
                logger.info("Request: perform transaction");

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    counterpartyAccountNumber: account2.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId,
                    description: trxDescription
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
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
                            amount_non_ahg1 - trxAmount
                        );

                        done(null, res.id);
                    }
                });
            },
            (transactionId, done) => {
                logger.info("Request: get balance");

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
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
                        expect(res.body).to.have.ownProperty("current");
                        expect(res.body.current).to.equal(
                            amount_non_ahg1 - trxAmount
                        );

                        done(null, transactionId);
                    }
                });
            },
            (transactionId, done) => {
                logger.info("Request: trxstatus");

                let data = SAP_DATA[TYPES.TRXSTATUS]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    transactionId: transactionId,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: keyId
                });

                let doRequests = 10;
                let currentRequest = 1;
                let timeToNextRequest = parseInt(
                    testsConfig.beforeTestTimeout / doRequests
                );

                (function requestRecursively() {
                    new sapTransport(url).send(
                        JSON.stringify(data),
                        (err, res) => {
                            if (err) {
                                done(err);
                            } else {
                                if (res && res.errorCode) {
                                    if (currentRequest > doRequests) {
                                        logger.error(res);
                                        expect(res).to.not.have.ownProperty(
                                            "error"
                                        );
                                        return done(null, transactionId);
                                    } else {
                                        setTimeout(
                                            requestRecursively,
                                            timeToNextRequest
                                        );
                                        currentRequest++;

                                        return false;
                                    }
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

                                setTimeout(
                                    () => done(null, transactionId),
                                    2000
                                );
                            }
                        }
                    );
                })();
            },
            (transactionId, done) => {
                logger.info("Request: history");

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    from: new Date(
                        new Date().getTime() - 60 * 60 * 24 * 7 * 1000
                    ).getTime(), // last week
                    to: new Date(
                        new Date().getTime() + 60 * 60 * 24 * 1000
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

                        logger.info("Search trxId: " + transactionId);

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
                            if (res.body.entries[i].trxId === transactionId) {
                                trx = res.body.entries[i];
                                break;
                            }
                        }

                        expect(trx).to.be.an("object");
                        expect(trx).to.have.ownProperty("counterparty");
                        expect(trx.counterparty).to.equal(
                            account2.iovSideChainId
                        );
                        expect(trx).to.have.ownProperty("description");
                        expect(trx.description).to.equal(trxDescription);

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
