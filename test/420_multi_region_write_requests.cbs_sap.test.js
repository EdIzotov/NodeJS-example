//import { setTimeout } from "timers";

require("node-env-file")(__dirname + "/../.env");

const async = require("async");
const testsConfig = require(__dirname + "/../config/tests.json");
const sapTransport = require(__dirname + "/../api/transport");
const regionsConfig = require(__dirname + "/../config/multi_region.json")[
    process.env.NODE_ENV
];
const cbsApi = require(__dirname + "/../cbs");
const fs = require("fs");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const TYPES = require(__dirname + "/../api/operationTypes");
const SAP_DATA = require(__dirname + "/../api/operations");

const privKey = fs.readFileSync(__dirname + "/data/private.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";

var testName = __filename.replace(/^.*\/test\//, "").split(".");
var testOperation = testName[0].toUpperCase();
var testHost = testName[1].toUpperCase();

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(200000);
        it("should send without error", function(resolve) {
            if (regionsConfig) {
                requests(resolve);
            } else {
                this.skip();
            }
        });
    });
});

function requests(resolve) {
    let identities = [];
    let accounts = [];
    let secretKeys = [];
    let balanceAccount = 1000;
    let keyId = "1";
    let trxAmount = 10;
    let sapUrlRegion1 = regionsConfig.regions[0].SAP[0];
    let sapUrlRegion2 = regionsConfig.regions[1].SAP[0];
    let cbsUrlRegion1 = regionsConfig.regions[0].CBS[0];
    let cbsUrlRegion2 = regionsConfig.regions[1].CBS[0];

    logger.info("Multi regions test.");
    logger.info("Create identities/account for each region.");

    async.eachLimit(
        regionsConfig.regions,
        1,
        (config, nextRegion) => {
            let sapUrl = config.SAP[0];
            cbsApi.setCbsUrl(config.CBS[0]);

            let regionIndex = regionsConfig.regions.indexOf(config);

            identities[regionIndex] = [];
            accounts[regionIndex] = [];
            secretKeys[regionIndex] = [];

            async.waterfall(
                [
                    done => {
                        logger.info(
                            `Get list of banks from CBS ( ${config.CBS[0]} `
                        );

                        cbsApi["Bank"].reads(function(err, res) {
                            if (err) {
                                done(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.instanceof(Array);
                                expect(res.body.length).to.be.above(0);
                                done(null, res.body[0]);
                            }
                        });
                    },
                    (bank, done) => {
                        logger.info("Create identities.");

                        async.timesLimit(
                            2,
                            1,
                            (n, next) => {
                                cbsApi["Identity"].createNewPrivateIdentity(
                                    {
                                        bankId: bank.id,
                                        firstName:
                                            "TestFirstName_" + Date.now(),
                                        lastName: "TestLastName_" + Date.now(),
                                        phoneNumber: "0991910757",
                                        passportNumber: "AA010101",
                                        dateOfBirth: "2017-04-13T12:57:36.232Z",
                                        nationality: "UA"
                                    },
                                    (err, res) => {
                                        if (err) {
                                            next(err);
                                        } else {
                                            expect(res).to.be.an("object");
                                            expect(res).to.have.ownProperty(
                                                "body"
                                            );
                                            expect(res.body).to.be.an("object");
                                            expect(
                                                res.body
                                            ).to.have.ownProperty("id");
                                            expect(res.body.id).to.be.above(0);

                                            identities[regionIndex].push(
                                                res.body
                                            );

                                            next();
                                        }
                                    }
                                );
                            },
                            err => {
                                done(err);
                            }
                        );
                    },
                    done => {
                        logger.info(
                            "Create account for identities. currentBalance=" +
                                balanceAccount
                        );

                        async.eachLimit(
                            identities[regionIndex],
                            1,
                            (identity, next) => {
                                cbsApi["Account"].createNew(
                                    {
                                        identityId: identity.id,
                                        currency: "EUR",
                                        currentBalance: balanceAccount,
                                        availableBalance: balanceAccount,
                                        spendingLimit: 0
                                    },
                                    (err, res) => {
                                        if (err) {
                                            next(err);
                                        } else {
                                            expect(res).to.be.an("object");
                                            expect(res).to.have.ownProperty(
                                                "body"
                                            );
                                            expect(
                                                res.body
                                            ).to.have.ownProperty("identity");
                                            expect(res.body.identity).to.be.an(
                                                "object"
                                            );
                                            expect(
                                                res.body.identity
                                            ).to.have.ownProperty("id");
                                            expect(
                                                res.body.identity.id
                                            ).to.be.above(0);

                                            accounts[regionIndex].push(
                                                res.body
                                            );
                                            next();
                                        }
                                    }
                                );
                            },
                            err => done(err)
                        );
                    },
                    done => {
                        logger.info("Get QR for identities.");

                        async.eachLimit(
                            identities[regionIndex],
                            1,
                            (identity, next) => {
                                cbsApi["Identity"].createAccountsQR(
                                    identity,
                                    (err, res) => {
                                        if (err) {
                                            next(err);
                                        } else {
                                            expect(res).to.be.an("object");
                                            expect(res).to.have.ownProperty(
                                                "body"
                                            );
                                            expect(res.body).to.be.an("object");
                                            expect(
                                                res.body
                                            ).to.have.ownProperty("secretKey");

                                            secretKeys[regionIndex].push(
                                                res.body.secretKey
                                            );

                                            next();
                                        }
                                    }
                                );
                            },
                            err => {
                                done(err);
                            }
                        );
                    }
                ],
                err => {
                    if (err) {
                        logger.error("REQUEST ERROR: ", err);
                        process.exit(1);
                    } else {
                        nextRegion();
                    }
                }
            );
        },
        err => {
            doTest();
        }
    );

    function doTest() {
        async.waterfall(
            [
                done => {
                    logger.info(
                        `Add pubkey for identities region 2 via region 1 SAP ( ${sapUrlRegion1} )`
                    );

                    let accountsRegion2 = accounts[1];
                    let account2 = accountsRegion2[0];
                    let identitiesRegion2 = identities[1];
                    let secretKeysRegion2 = secretKeys[1];

                    async.eachLimit(
                        identitiesRegion2,
                        1,
                        (identity, next) => {
                            let idx = identitiesRegion2.indexOf(identity);
                            let secretKey = secretKeysRegion2[idx];

                            let data = SAP_DATA[TYPES.PUBKEY]({
                                yourIdentityIOVAddress:
                                    identity.iovMasterChainId,
                                privKey: privKey,
                                pubKey: pubKey,
                                secret: secretKey,
                                keyId: keyId
                            });

                            new sapTransport(sapUrlRegion1).send(
                                JSON.stringify(data),
                                (err, res) => {
                                    if (err) {
                                        next(err);
                                    } else {
                                        if (res && res.error) {
                                            logger.error(res);
                                        }
                                        expect(res).to.be.an("object");
                                        expect(res).to.have.ownProperty("id");
                                        expect(res.id).to.equal(data.id);
                                        expect(res).to.have.ownProperty("type");
                                        expect(res.type).to.equal(data.type);
                                        expect(res).to.not.have.ownProperty(
                                            "error"
                                        );
                                        next();
                                    }
                                }
                            );
                        },
                        err => {
                            done(err);
                        }
                    );
                },
                done => {
                    logger.info(
                        `Perform transactions between accounts of region 2 using SAP of region 1 ( ${sapUrlRegion1} )`
                    );

                    let accountsRegion2 = accounts[1];
                    let account1 = accountsRegion2[0];
                    let account2 = accountsRegion2[1];

                    let data = SAP_DATA[TYPES.TRX]({
                        yourIdentityIOVAddress:
                            account2.identity.iovMasterChainId,
                        privKey: privKey,
                        yourWalletAccountNumber: account2.iovSideChainId,
                        counterpartyAccountNumber: account1.iovSideChainId,
                        amount: trxAmount,
                        valuationTime: Date.now(),
                        keyId: keyId
                    });

                    new sapTransport(sapUrlRegion1).send(
                        JSON.stringify(data),
                        (err, res) => {
                            if (err) {
                                done(err);
                            } else {
                                if (res && res.error) {
                                    logger.error(res);
                                }
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("id");
                                expect(res.id).to.equal(data.id);
                                expect(res).to.have.ownProperty("type");
                                expect(res.type).to.equal(data.type);
                                expect(res).to.not.have.ownProperty("error");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.have.ownProperty(
                                    "currentChange"
                                );
                                expect(res.body).to.have.ownProperty(
                                    "availableChange"
                                );
                                expect(res.body).to.have.ownProperty(
                                    "currentBalance"
                                );
                                expect(res.body).to.have.ownProperty(
                                    "availableBalance"
                                );
                                expect(res.body).to.have.ownProperty(
                                    "processedAt"
                                );

                                expect(res.body.currentBalance).to.equal(
                                    balanceAccount - trxAmount
                                );

                                done(null, res.id);
                            }
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
}
