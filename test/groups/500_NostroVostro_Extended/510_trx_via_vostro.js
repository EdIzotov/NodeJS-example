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
const SAP_DATA = require(__dirname + "/../../../api/operations");
const TIMEOUT = 100000;
const privKey = fs.readFileSync(__dirname + "/../../data/private.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

var accounts = {
    accountBank1: null,
    accountBank2: null
};

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);
        it("should send without error", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let bank1 = JSON.parse(process.env["bank1"]);
    let bank2 = JSON.parse(process.env["bank2"]);
    let bank1Nostro = JSON.parse(process.env["bank1Nostro"]);
    let bank2Vostro = JSON.parse(process.env["bank2Vostro"]);
    let initBalanceNostroVostro = parseFloat(
        process.env["initBalanceNostroVostro"]
    );

    let initBalance = 100;
    let trxAmount = 10;

    let keyId1;
    let keyId2;

    async.waterfall(
        [
            done => {
                // Create Identity in bank#1

                logger.info("Create new identity in bank1");

                let identity = {
                    bankId: bank1.id,
                    firstName: "TestFirstName_" + Date.now(),
                    lastName: "TestLastName_" + Date.now(),
                    phoneNumber: "0991910757",
                    passportNumber: "AA010101",
                    dateOfBirth: "2017-04-13T12:57:36.232Z",
                    nationality: "UA"
                };

                cbsApi["Identity"].createNewPrivateIdentity(
                    identity,
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
                // Create Account in bank#1

                logger.info("Create new account in bank1");

                cbsApi["Account"].createNew(
                    {
                        identityId: identity.id,
                        currency: "EUR",
                        currentBalance: initBalance,
                        availableBalance: initBalance,
                        spendingLimit: 0
                    },
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("identity");
                            expect(res.body.identity).to.be.an("object");
                            expect(res.body.identity).to.have.ownProperty("id");
                            expect(res.body.identity.id).to.be.above(0);
                            accounts.accountBank1 = res.body;

                            done();
                        }
                    }
                );
            },
            done => {
                // get secretKey for account from bank1

                logger.info("Get QR for new identity");

                cbsApi["Secrets"].сreateSecret(
                    {
                        identityId: accounts.accountBank1.identity.id
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("secretKey");

                            keyId1 = res.body.keyId;

                            done(null, res.body.secretKey, res.body.keyId);
                        }
                    }
                );
            },
            (secretKey, keyId, done) => {
                // Add pubkey for account from bank1

                logger.info("Add pubkey for new identity");

                let data = SAP_DATA[TYPES.PUBKEY]({
                    yourIdentityIOVAddress:
                        accounts.accountBank1.identity.iovMasterChainId,
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
                        done();
                    }
                });
            },
            done => {
                logger.info("Create new Identity in bank2 ");

                let identity = {
                    bankId: bank2.id,
                    firstName: "TestFirstName_" + Date.now(),
                    lastName: "TestLastName_" + Date.now(),
                    phoneNumber: "0991910757",
                    passportNumber: "AA010101",
                    dateOfBirth: "2017-04-13T12:57:36.232Z",
                    nationality: "UA"
                };

                cbsApi["Identity"].createNewPrivateIdentity(
                    identity,
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
                // Create Account in bank#2

                logger.info("Create new account in bank2");

                cbsApi["Account"].createNew(
                    {
                        identityId: identity.id,
                        currency: "EUR",
                        currentBalance: initBalance,
                        availableBalance: initBalance,
                        spendingLimit: 0
                    },
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("identity");
                            expect(res.body.identity).to.be.an("object");
                            expect(res.body.identity).to.have.ownProperty("id");
                            expect(res.body.identity.id).to.be.above(0);
                            accounts.accountBank2 = res.body;
                            done();
                        }
                    }
                );
            },
            done => {
                // get secretKey for account from bank2

                logger.info("Get QR for new identity(bank2)");

                cbsApi["Secrets"].сreateSecret(
                    {
                        identityId: accounts.accountBank2.identity.id
                    },
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("secretKey");

                            keyId2 = res.body.keyId;

                            done(null, res.body.secretKey, res.body.keyId);
                        }
                    }
                );
            },
            (secretKey, keyId, done) => {
                // Add pubkey for account from bank2

                logger.info("Add pubkey for new identity");

                let data = SAP_DATA[TYPES.PUBKEY]({
                    yourIdentityIOVAddress:
                        accounts.accountBank2.identity.iovMasterChainId,
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
                        done();
                    }
                });
            },
            done => {
                // Trx from account(bank1) to account(bank2) via nostro account(bank1)

                logger.info(
                    "Make transaction from account1(bank1) to account2(bank2) through the correspondent account (bank2 vostro)"
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress:
                        accounts.accountBank1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber:
                        accounts.accountBank1.iovSideChainId,
                    counterpartyAccountNumber:
                        accounts.accountBank2.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId1,
                    description: "Test trx via nostro",
                    correspondentAccountNumber: bank2Vostro.iovSideChainId
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
                            initBalance - trxAmount
                        );

                        done();
                    }
                });
            },
            done => {
                // Check balance account from bank1

                logger.info("Check balance for account from bank1");

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress:
                        accounts.accountBank1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber:
                        accounts.accountBank1.iovSideChainId,
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
                        expect(res.body.current).to.equal(
                            initBalance - trxAmount
                        );

                        done();
                    }
                });
            },
            done => {
                // Check balance account from bank2

                logger.info("Check balance for account from bank2");

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress:
                        accounts.accountBank2.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber:
                        accounts.accountBank2.iovSideChainId,
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
                        expect(res.body.current).to.equal(
                            initBalance + trxAmount
                        );

                        done();
                    }
                });
            },
            done => {
                // Check balance account(bank#1)

                logger.info("Check balance via CBS for account from bank1");

                cbsApi["Account"].read(
                    { id: accounts.accountBank1.id },
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty(
                                "currentBalance"
                            );
                            expect(res.body.currentBalance).to.equal(
                                initBalance - trxAmount
                            );
                            done();
                        }
                    }
                );
            },
            done => {
                // Check balance account(bank#2)

                logger.info("Check balance via CBS for account from bank2");

                cbsApi["Account"].read(
                    { id: accounts.accountBank2.id },
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty(
                                "currentBalance"
                            );
                            expect(res.body.currentBalance).to.equal(
                                initBalance + trxAmount
                            );
                            done();
                        }
                    }
                );
            },
            done => {
                // Check balance nostro bank#1

                logger.info("Check balance for nostro account from bank1");

                cbsApi["Account"].read({ id: bank1Nostro.id }, function(
                    err,
                    res
                ) {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body.currentBalance).to.equal(
                            initBalanceNostroVostro - trxAmount
                        );
                        done();
                    }
                });
            },
            done => {
                // Check balance vostro bank#2

                logger.info("Check balance for vostro account from bank2");

                cbsApi["Account"].read({ id: bank2Vostro.id }, function(
                    err,
                    res
                ) {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body.currentBalance).to.equal(
                            initBalanceNostroVostro + trxAmount
                        );
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
