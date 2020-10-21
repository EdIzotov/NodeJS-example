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
    logger.info("SAP API URL: " + url);
    logger.info("CBS API URL: " + cbsApi.getCbsUrl());
    logger.info("Test scheduler component.");

    let spendingLimit = 0;
    let balance = 100;
    let keyId;
    let holdAmount = 10;

    let schedulerTest = {
        account: null,
        balance: balance,
        startTime: null,
        keyId: null,
        holdAmount: holdAmount,
        spendingLimit: spendingLimit
    };

    const client = JSON.parse(process.env["Client"]);

    async.waterfall(
        [
            done => {
                logger.info("Create new Bank.");

                let data = {
                    name: "Bank4Test_" + Date.now(),
                    client: client
                };

                cbsApi["Bank"].сreateNew(data, (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("id");
                        expect(res.body).to.have.ownProperty("name");
                        expect(res.body).to.have.ownProperty("country");

                        storage.add("BANKS", res.body);

                        done(null, res.body);
                    }
                });
            },
            (bank, done) => {
                logger.info("Create identity.");

                cbsApi["Identity"].createNewPrivateIdentity(
                    {
                        bankId: bank.id,
                        firstName: "TestFirstName_" + Date.now(),
                        lastName: "TestLastName_" + Date.now(),
                        phoneNumber: "0991910757",
                        passportNumber: "AA010101",
                        dateOfBirth: "2017-04-13T12:57:36.232Z",
                        nationality: "UA"
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("id");
                            expect(res.body.id).to.be.above(0);

                            done(null, res.body);
                        }
                    }
                );
            },
            (identity, done) => {
                let spendingLimitInit = 0;

                logger.info("Create account");

                cbsApi["Account"].createNew(
                    {
                        identityId: identity.id,
                        currency: "EUR",
                        currentBalance: balance,
                        availableBalance: balance,
                        spendingLimit: spendingLimitInit
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("identity");
                            expect(res.body.identity).to.be.an("object");
                            expect(res.body.identity).to.have.ownProperty("id");
                            expect(res.body.identity.id).to.be.above(0);

                            schedulerTest.account = res.body;

                            done(null, res.body);
                        }
                    }
                );
            },
            (account, done) => {
                logger.info("Get QR for identity.");

                cbsApi["Secrets"].сreateSecret(
                    {
                        identityId: account.identity.id
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            //console.log('CREATE QR RESP', res.body);
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("secretKey");

                            keyId = res.body.keyId;
                            schedulerTest.keyId = res.body.keyId;

                            done(null, account, res.body.secretKey);
                        }
                    }
                );
            },
            (account, secretKey, done) => {
                logger.info("Add pubkey for identity.");

                let data = SAP_DATA[TYPES.PUBKEY]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    pubKey: pubKey,
                    secret: secretKey,
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
                        done(null, account);
                    }
                });
            },
            (account, done) => {
                let expiresAt = Date.now() + 60 * 1000;

                logger.info(
                    `Send a hold transaction: amount - ${holdAmount}$, 
                    set up expiration date = now + 30 sec. `
                );

                cbsApi["oldWorld"].holdTrx(
                    account,
                    {
                        amount: holdAmount,
                        expiresAt: Date.now() + 30 * 1000 // now + 30 sec
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
                            expect(res.body).to.have.ownProperty(
                                "iovTransactionId"
                            );
                            expect(res.body).to.have.ownProperty("processedAt");
                            expect(res.body.cbsTransactionId).to.be.above(0);

                            schedulerTest.startTime = Date.now();

                            done(
                                null,
                                account,
                                res.body.cbsTransactionId,
                                res.body.iovTransactionId
                            );
                        }
                    }
                );
            },
            (account, cbsTransactionId, iovTransactionId, done) => {
                let expiresAt = Date.now() + 60 * 1000;

                logger.info(`Hold debit trx`);

                let data = {
                    cbsTransactionId: cbsTransactionId,
                    iovTransactionId: iovTransactionId
                };

                cbsApi["oldWorld"].holdDebitTrx(data, (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty(
                            "cbsTransactionId"
                        );
                        expect(res.body.cbsTransactionId).to.be.above(0);

                        schedulerTest.startTime = Date.now();

                        schedulerTest.balance -= holdAmount;

                        done(null, account);
                    }
                });
            },
            (account, done) => {
                let expiresAt = Date.now() + 60 * 1000;

                logger.info(
                    `Send a hold transaction: amount - ${holdAmount}$, 
                    set up expiration date = now + 30 sec. `
                );

                cbsApi["oldWorld"].holdTrx(
                    account,
                    {
                        amount: holdAmount,
                        expiresAt: Date.now() + 30 * 1000 // now + 30 sec
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

                            schedulerTest.startTime = Date.now();

                            done();
                        }
                    }
                );
            },
            done => {
                logger.info(
                    `Get (SAP)balance and check available balance decreases by ${holdAmount}$.`
                );

                let account = schedulerTest.account;

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
                        //console.log("res", res);
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
                        expect(res.body.current).to.equal(
                            schedulerTest.balance
                        );
                        expect(res.body.available).to.equal(
                            schedulerTest.balance - holdAmount
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
                process.env["970_schedulerTest"] = JSON.stringify(
                    schedulerTest
                );
                resolve();
            }
        }
    );
}
