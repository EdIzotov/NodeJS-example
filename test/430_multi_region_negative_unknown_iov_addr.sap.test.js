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
        this.timeout(testsConfig.testTimeout);
        it("operations should not be successful", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let trxAmount = 1;
    let balanceAccount = 100;
    let keyId = "1";
    let sapUrlRegion1 = regionsConfig.regions[0].SAP[0];
    let cbsUrlRegion1 = regionsConfig.regions[0].CBS[0];
    cbsApi.setCbsUrl(cbsUrlRegion1);

    let fakeIdentityIOVAddress =
        "CgQIAxAAEix5c3VtR05rR2dlZ3Bla09uN0dzektTbkdZK0daajRhMysxTjJ3WS9rSzhZPRgBIAE=";
    let fakeAccountIOVAddress =
        "CgQIAxAAEixhR0ltYlBqTWFlVk9kT285bWF2MDBTT25HZWw2MUk4TEgza0w4ZXZOVmtzPRgBIAE=";

    async.waterfall(
        [
            done => {
                logger.info(`Get list of banks from CBS ( ${cbsUrlRegion1} `);

                cbsApi["Bank"].reads((err, res) => {
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
                logger.info(
                    `Create account for identities. Current balance ${
                        balanceAccount
                    }`
                );

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
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("identity");
                            expect(res.body.identity).to.be.an("object");
                            expect(res.body.identity).to.have.ownProperty("id");
                            expect(res.body.identity.id).to.be.above(0);

                            done(null, res.body);
                        }
                    }
                );
            },
            (account, done) => {
                logger.info("Get QR for identities.");

                cbsApi["Identity"].createAccountsQR(
                    account.identity,
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("secretKey");

                            done(null, account, res.body.secretKey);
                        }
                    }
                );
            },
            (account, secretKey, done) => {
                logger.info(
                    `Add pubkey for identities. SAP ( ${sapUrlRegion1} )`
                );

                let data = SAP_DATA[TYPES.PUBKEY]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    pubKey: pubKey,
                    secret: secretKey,
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
                            done(null, account);
                        }
                    }
                );
            },
            (account, done) => {
                logger.info(
                    "Get balance for UNKNOWN identity. Expect NotAuthenticated"
                );

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: fakeIdentityIOVAddress,
                    privKey: privKey,
                    yourWalletAccountNumber: fakeAccountIOVAddress,
                    keyId: keyId
                });

                new sapTransport(sapUrlRegion1).send(
                    JSON.stringify(data),
                    (err, res) => {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("error");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(4);

                        done(err, account);
                    }
                );
            },
            (account, done) => {
                logger.info(
                    "Get balance for existing identity but UNKNOWN account. Expect NotAuthorized"
                );

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: fakeAccountIOVAddress,
                    keyId: keyId
                });

                new sapTransport(sapUrlRegion1).send(
                    JSON.stringify(data),
                    (err, res) => {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("error");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(3);

                        done(err, account);
                    }
                );
            },
            (account, done) => {
                logger.info(
                    "Transaction from existing account to UNKNOWN. Expect AccountNotFound"
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
                    counterpartyAccountNumber: fakeAccountIOVAddress,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId
                });

                new sapTransport(sapUrlRegion1).send(
                    JSON.stringify(data),
                    (err, res) => {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("error");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(2);

                        done(err, account);
                    }
                );
            },
            (account, done) => {
                logger.info(
                    "Transaction from UNKNOWN identity/account to existing. Expect NotAuthenticated"
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: fakeIdentityIOVAddress,
                    privKey: privKey,
                    yourWalletAccountNumber: fakeAccountIOVAddress,
                    counterpartyAccountNumber: account.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId
                });

                new sapTransport(sapUrlRegion1).send(
                    JSON.stringify(data),
                    (err, res) => {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("error");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(4);

                        done(err, account);
                    }
                );
            },
            (account, done) => {
                logger.info(
                    "Get history for UNKNOWN identity. Expect NotAuthenticated"
                );

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: fakeIdentityIOVAddress,
                    privKey: privKey,
                    yourWalletAccountNumber: fakeAccountIOVAddress,
                    from: new Date(
                        new Date().getTime() - 60 * 60 * 24 * 7 * 1000
                    ).getTime(), // last week
                    to: new Date(
                        new Date().getTime() + 60 * 60 * 24 * 1000
                    ).getTime(),
                    keyId: keyId
                });

                new sapTransport(sapUrlRegion1).send(
                    JSON.stringify(data),
                    (err, res) => {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("error");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(4);

                        done(err, account);
                    }
                );
            },
            (account, done) => {
                logger.info(
                    "Get history for existing identity but UNKNOWN account. Expect NotAuthorized"
                );

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: fakeAccountIOVAddress,
                    from: new Date(
                        new Date().getTime() - 60 * 60 * 24 * 7 * 1000
                    ).getTime(), // last week
                    to: new Date(
                        new Date().getTime() + 60 * 60 * 24 * 1000
                    ).getTime(),
                    keyId: keyId
                });

                new sapTransport(sapUrlRegion1).send(
                    JSON.stringify(data),
                    (err, res) => {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("error");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(3);

                        done(err);
                    }
                );
            }
        ],
        err => {
            resolve();
        }
    );
}
