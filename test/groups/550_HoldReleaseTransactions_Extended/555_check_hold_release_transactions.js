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
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";

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
    logger.info("Hold/Release transactions.");

    let accounts = [
        JSON.parse(process.env["550_account1"]),
        JSON.parse(process.env["550_account2"]),
        JSON.parse(process.env["550_account3"]),
        JSON.parse(process.env["550_account4"])
    ];
    let spendingLimit = 1000;

    let balance = parseFloat(process.env["550_amount1"]);
    let keyIds = [
        process.env["550_keyId1"],
        process.env["550_keyId2"],
        process.env["550_keyId3"],
        process.env["550_keyId4"]
    ];

    let holdAmount = 10;

    async.waterfall(
        [
            done => {
                logger.info(
                    `Request: CBS hold transaction: amount - ${holdAmount}$, 
                    set up expiration date = now + 1 hour. `
                );

                let account = accounts[0];

                cbsApi["oldWorld"].holdTrx(
                    account,
                    {
                        amount: holdAmount,
                        expiresAt: Date.now() + 60 * 60 * 1000 // now + 1h
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            // logger.info(JSON.stringify(res.body, 0, 2));
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            //expect(res.body).to.have.ownProperty("amount");
                            //expect(res.body.amount).to.be.equal(holdAmount);
                            expect(res.body).to.have.ownProperty(
                                "cbsTransactionId"
                            );
                            expect(res.body.cbsTransactionId).to.be.above(0);
                            expect(res.body).to.have.ownProperty(
                                "iovTransactionId"
                            );
                            expect(res.body).to.have.ownProperty("processedAt");

                            cbsTransactionId = res.body.cbsTransactionId;

                            done(null, cbsTransactionId);
                        }
                    }
                );
            },
            (cbsTransactionId, done) => {
                logger.info(
                    `Request: SAP balance and check available balance decreases by ${holdAmount}$.`
                );

                let account = accounts[0];
                let keyId = keyIds[0];

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
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
                        expect(res.body).to.have.ownProperty("available");
                        expect(res.body).to.have.ownProperty("spendingLimit");
                        expect(res.body.current).to.equal(balance);
                        expect(res.body.available).to.equal(
                            balance - holdAmount
                        );

                        done(null, cbsTransactionId);
                    }
                });
            },
            (cbsTransactionId, done) => {
                logger.info(
                    `Request: CBS balance and check available balance decreases by ${holdAmount}$.`
                );

                let account = accounts[0];

                cbsApi["Account"].read({ id: account.id }, (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body.currentBalance).to.equal(balance);
                        expect(res.body.availableBalance).to.equal(
                            balance - holdAmount
                        );
                        setTimeout(() => {
                            done(null, cbsTransactionId);
                        }, 5500);
                    }
                });
            },
            (cbsTransactionId, done) => {
                logger.info(`Request: CBS hold cancel`);

                let account = accounts[0];

                cbsApi["oldWorld"].holdCancelTrx(
                    {
                        cbsTransactionId: cbsTransactionId
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty(
                                "cbsTransactionId"
                            );
                            /*                             expect(res.body.cbsTransactionId).to.equal(
                                cbsTransactionId
                            ); */

                            done(null, cbsTransactionId);
                        }
                    }
                );
            },
            (cbsTransactionId, done) => {
                logger.info(
                    `Request: CBS repeate request hold cancel. Expect error TrxNotFound`
                );

                let account = accounts[0];

                cbsApi["oldWorld"].holdCancelTrx(
                    {
                        cbsTransactionId: cbsTransactionId
                    },
                    (err, res) => {
                        if (err) {
                            try {
                                res = JSON.parse(err);
                            } catch (e) {
                                return done("Cant parse CBS response");
                            }
                        } else {
                            logger.error(
                                "Operation should not be success.",
                                res
                            );
                        }

                        expect(res).to.be.an("object");
                        expect(res.header).to.have.ownProperty("response_code");
                        expect(res.header.response_code).to.not.equal(0);
                        expect(res.header).to.have.ownProperty("error_message");
                        // TODO: add AHG error code instead. after impl. in CBS
                        /*                         expect(res.header.error_message).to.match(
                            /TrxNotFound/i
                        ); */

                        done();
                    }
                );
            },
            done => {
                logger.info(
                    `Request: SAP balance and check available balance increased by ${holdAmount}$.`
                );

                let account = accounts[0];
                let keyId = keyIds[0];

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
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
                        expect(res.body).to.have.ownProperty("available");
                        expect(res.body).to.have.ownProperty("spendingLimit");
                        expect(res.body.current).to.equal(balance);
                        expect(res.body.available).to.equal(balance);

                        done();
                    }
                });
            },
            done => {
                logger.info(
                    `Request: CBS balance and check available balance increased by ${holdAmount}$.`
                );

                let account = accounts[0];

                cbsApi["Account"].read({ id: account.id }, (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body.currentBalance).to.equal(balance);
                        expect(res.body.availableBalance).to.equal(balance);
                        done();
                    }
                });
            },
            done => {
                logger.info("Request: CBS blockAccount.");

                let account = accounts[1];

                cbsApi["Account"].blockAccount(account, function(err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body.isBlocked).to.equal(true);

                        done();
                    }
                });
            },
            done => {
                logger.info(`Request: CBS hold request for blocked account`);

                let account = accounts[1];

                cbsApi["oldWorld"].holdTrx(
                    account,
                    {
                        amount: holdAmount,
                        expiresAt: Date.now() + 60 * 60 * 1000 // now + 1h
                    },
                    (err, res) => {
                        if (err) {
                            try {
                                res = JSON.parse(err);
                            } catch (e) {
                                return done("Cant parse CBS response");
                            }
                        } else {
                            logger.error(
                                "Operation should not be success.",
                                res
                            );
                        }

                        expect(res).to.be.an("object");
                        expect(res.header).to.have.ownProperty("response_code");
                        expect(res.header.response_code).to.not.equal(0);
                        expect(res.header).to.have.ownProperty("error_message");
                        // TODO: add AHG error code instead. after impl. in CBS
                        /*                         expect(res.header.error_message).to.match(
                            /is blocked/i
                        ); */

                        done();
                    }
                );
            },
            done => {
                logger.info(`Request: CBS hold transaction: ${holdAmount}$`);

                let account = accounts[2];

                cbsApi["oldWorld"].holdTrx(
                    account,
                    {
                        amount: holdAmount,
                        expiresAt: Date.now() + 60 * 60 * 1000 // now + 1h
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            // expect(res.body).to.have.ownProperty("amount");
                            // expect(res.body.amount).to.be.equal(holdAmount);
                            expect(res.body).to.have.ownProperty(
                                "cbsTransactionId"
                            );
                            expect(res.body.cbsTransactionId).to.be.above(0);

                            done();
                        }
                    }
                );
            },
            done => {
                logger.info(
                    `Request: SAP trx amount ${balance}$. Account currentBalance = ${balance}$ and hold = ${holdAmount}$.
                    Expect error: TransactionRejectedInsufficientFunds`
                );

                let account = accounts[2];
                let keyId = keyIds[2];

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
                    counterpartyAccountNumber: account.iovSideChainId,
                    amount: balance,
                    valuationTime: Date.now(),
                    keyId: keyId
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(101);

                        done();
                    }
                });
            },
            done => {
                logger.info(
                    `Request: CBS oldWord transaction amount ${balance}$. Account currentBalance = ${balance}$ and hold = ${holdAmount}$.
                     Expect error: TransactionRejectedInsufficientFunds`
                );

                let account1 = accounts[2];
                let account2 = accounts[3];

                let data = {
                    amount: balance,
                    description: "test trx hold"
                };

                cbsApi["oldWorld"].transferAmount(
                    account1,
                    account2,
                    data,
                    (err, res) => {
                        if (err) {
                            try {
                                res = JSON.parse(err);
                            } catch (e) {
                                return done("Cant parse CBS response");
                            }
                        } else {
                            logger.error(
                                "Operation should not be success.",
                                res
                            );
                        }

                        expect(res).to.be.an("object");
                        expect(res.header).to.have.ownProperty("response_code");
                        expect(res.header.response_code).to.not.equal(0);
                        expect(res.header).to.have.ownProperty("error_message");
                        expect(res.header.error_message).to.match(
                            /Insufficient Funds/i
                        );

                        done();
                    }
                );
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
