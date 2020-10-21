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

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(TIMEOUT);
        it("operations should not be successful", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let bank1OwnIdentity = JSON.parse(process.env["bank1OwnIdentity"]);
    let bank2OwnIdentity = JSON.parse(process.env["bank2OwnIdentity"]);
    let bank3OwnIdentity = JSON.parse(process.env["bank3OwnIdentity"]);

    let bank1Nostro = JSON.parse(process.env["bank1Nostro"]);
    let bank1Vostro = JSON.parse(process.env["bank1Vostro"]);
    let bank2Nostro = JSON.parse(process.env["bank2Nostro"]);
    let bank2Vostro = JSON.parse(process.env["bank2Vostro"]);
    let account = JSON.parse(process.env["500_account1"]);
    let keyId = process.env["500_keyId1"];
    let trxAmount = 1;
    let initBalanceNostroVostro = 1000;

    async.waterfall(
        [
            done => {
                logger.info(
                    "Request: trx from simple account to nostro. Expect TransactionRejectedNostroAccountOperationAttempt"
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
                    counterpartyAccountNumber: bank1Nostro.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId,
                    description:
                        "Test try direct trx from simple account to nostro"
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(108);

                        done();
                    }
                });
            },
            // TODO: direct trx from nostro to vostro via SAP
            // пока нет возможности добавить приватный ключ для bank own identity
            //        (done) => { // get secretKey for account from bank1
            //
            //            cbsApi['Identity'].createAccountsQR(bank1Nostro.identity, function (err, res) {
            //                if (err) {
            //                    done(err);
            //                } else {
            //                    //logger.log('CREATE QR RESP', res.body);
            //                    expect(res).to.be.an('object');
            //                    expect(res).to.have.ownProperty('body');
            //                    expect(res.body).to.be.an('object');
            //                    expect(res.body).to.have.ownProperty('secretKey');
            //
            //                    done(null, res.body.secretKey);
            //                }
            //            });
            //        },
            //        (secretKey, done) => { // Add pubkey for account from bank1
            //
            //            let data = SAP_DATA[TYPES.PUBKEY]({
            //                yourIdentityIOVAddress: bank1Nostro.identity.iovMasterChainId,
            //                privKey: privKey,
            //                pubKey:  pubKey,
            //                secret:  secretKey,
            //                keyId: '1'
            //            });
            //
            //            (new sapTransport(url)).send(JSON.stringify(data), (err, res) => {
            //                if (err) {
            //                    done(err);
            //                } else {
            //                    if(res && res.errorCode) {
            //                        logger.error(res);
            //                    }
            //                    expect(res).to.be.an('object');
            //                    expect(res).to.have.ownProperty('id');
            //                    expect(res.id).to.equal(data.id);
            //                    expect(res).to.have.ownProperty('type');
            //                    expect(res.type).to.equal(data.type);
            //                    expect(res).to.not.have.ownProperty('error');
            //                    done();
            //                }
            //            });
            //        },
            //        (done) => { // Try direct trx from nostro to vostro
            //
            //            let data = SAP_DATA[TYPES.TRX]({
            //                yourIdentityIOVAddress: bank1Nostro.identity.iovMasterChainId,
            //                privKey: privKey,
            //                yourWalletAccountNumber: bank1Nostro.iovSideChainId,
            //                counterpartyAccountNumber: bank2Vostro.iovSideChainId,
            //                amount: trxAmount,
            //                valuationTime: Date.now(),
            //                keyId: '1',
            //                description: 'Test try direct trx from nostro to vostro'
            //            });
            //
            //            (new sapTransport(url)).send(JSON.stringify(data), (err, res) => {
            //                if (err) {
            //                    done(err);
            //                } else {
            //                    logger.error(res);
            //                    expect(res).to.be.an('object');
            //                    expect(res).to.have.ownProperty('error');
            //                    expect(res).to.not.have.ownProperty('body');
            //
            //                    done();
            //                }
            //            });
            //        },

            done => {
                logger.info(
                    "Try already linked bank#1 Nostro Account to bank#2 Vostro Account"
                );

                cbsApi["Account"].linkAccount(
                    bank2Vostro,
                    bank1Nostro,
                    function(err, res) {
                        if (err) {
                            try {
                                res = JSON.parse(err);
                            } catch (e) {
                                return done("Cant parse CBS response");
                            }
                        } else {
                            logger.error(
                                "Try already linked bank#1 Nostro Account to bank#2 Vostro Account",
                                res
                            );
                        }

                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("header");
                        expect(res.header).to.be.an("object");
                        expect(res.header).to.have.ownProperty("response_code");
                        expect(res.header.response_code).to.not.equal(0);
                        expect(res.header).to.have.ownProperty("error_message");

                        done();
                    }
                );
            },
            done => {
                logger.info(
                    "Try already linked bank#2 Nostro Account to bank#1 Vostro Account"
                );

                cbsApi["Account"].linkAccount(
                    bank2Nostro,
                    bank1Nostro,
                    function(err, res) {
                        if (err) {
                            try {
                                res = JSON.parse(err);
                            } catch (e) {
                                return done("Cant parse CBS response");
                            }
                        } else {
                            logger.error(
                                "Try already linked bank#2 Nostro Account to bank#1 Vostro Account",
                                res
                            );
                        }

                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("header");
                        expect(res.header).to.be.an("object");
                        expect(res.header).to.have.ownProperty("response_code");
                        expect(res.header.response_code).to.not.equal(0);
                        expect(res.header).to.have.ownProperty("error_message");

                        done();
                    }
                );
            },
            done => {
                logger.info("create new bank2 own account");

                cbsApi["Account"].createNew(
                    {
                        identityId: bank2OwnIdentity.id,
                        linkExpectationBank: bank1OwnIdentity.bank.bankIdentity,
                        currentBalance: initBalanceNostroVostro,
                        availableBalance: initBalanceNostroVostro,
                        spendingLimit: initBalanceNostroVostro
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

                            done(null, res.body);
                        }
                    }
                );
            },
            (bank2Vostro2, done) => {
                logger.info(
                    "bank1Nostro already linked. Try link it to new bank2Vostro2"
                );

                cbsApi["Account"].linkAccount(
                    bank1Nostro,
                    bank2Vostro2,
                    function(err, res) {
                        if (err) {
                            try {
                                res = JSON.parse(err);
                            } catch (e) {
                                return done("Cant parse CBS response");
                            }
                        } else {
                            logger.error(
                                "bank1Nostro already linked. Try link it to new bank2Vostro2",
                                res
                            );
                        }

                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("header");
                        expect(res.header).to.be.an("object");
                        expect(res.header).to.have.ownProperty("response_code");
                        expect(res.header.response_code).to.not.equal(0);
                        expect(res.header).to.have.ownProperty("error_message");

                        done();
                    }
                );
            },
            done => {
                logger.info("Create 2 accounts in bank #1");

                let accounts = [];

                async.timesLimit(
                    2,
                    1,
                    function(n, nextAccount) {
                        cbsApi["Account"].createNew(
                            {
                                identityId: bank1OwnIdentity.id,
                                linkExpectationBank:
                                    bank2OwnIdentity.bank.bankIdentity,
                                currentBalance: initBalanceNostroVostro,
                                availableBalance: initBalanceNostroVostro,
                                spendingLimit: initBalanceNostroVostro
                            },
                            function(err, res) {
                                if (err) {
                                    nextAccount(err);
                                } else {
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.have.ownProperty(
                                        "identity"
                                    );
                                    expect(res.body.identity).to.be.an(
                                        "object"
                                    );
                                    expect(
                                        res.body.identity
                                    ).to.have.ownProperty("id");
                                    expect(res.body.identity.id).to.be.above(0);

                                    accounts.push(res.body);

                                    nextAccount();
                                }
                            }
                        );
                    },
                    err => done(err, accounts)
                );
            },
            (accountsBank1, done) => {
                logger.info("Try link nostro vostro in same bank");

                let nostro = accountsBank1[0];
                let vostro = accountsBank1[1];

                cbsApi["Account"].linkAccount(nostro, vostro, function(
                    err,
                    res
                ) {
                    if (err) {
                        try {
                            res = JSON.parse(err);
                        } catch (e) {
                            return done("Cant parse CBS response");
                        }
                    } else {
                        logger.error(
                            "Success linked nostro vostro in same bank",
                            res
                        );
                    }

                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("header");
                    expect(res.header).to.be.an("object");
                    expect(res.header).to.have.ownProperty("response_code");
                    expect(res.header.response_code).to.not.equal(0);
                    expect(res.header).to.have.ownProperty("error_message");

                    done();
                });
            },
            done => {
                logger.info(
                    "Vostro and nostro accounts can't be created by same bank"
                );

                cbsApi["Account"].createNew(
                    {
                        identityId: bank1OwnIdentity.id,
                        linkExpectationBank: bank1OwnIdentity.bank.bankIdentity,
                        currentBalance: initBalanceNostroVostro,
                        availableBalance: initBalanceNostroVostro,
                        spendingLimit: initBalanceNostroVostro
                    },
                    function(err, res) {
                        if (err) {
                            try {
                                res = JSON.parse(err);
                            } catch (e) {
                                return done("Cant parse CBS response");
                            }
                        } else {
                            logger.error(
                                " - Success vostro and nostro accounts can't be created by same bank",
                                res
                            );
                        }

                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("header");
                        expect(res.header).to.be.an("object");
                        expect(res.header).to.have.ownProperty("response_code");
                        expect(res.header.response_code).to.not.equal(0);
                        expect(res.header).to.have.ownProperty("error_message");

                        done();
                    }
                );
            },
            done => {
                logger.info(
                    "Vostro created by bank A with expected bank B, nostro created by bank B with expected bank C, " +
                        " user can't link nostro(from perspetcive of bank B) to vostro, because expected bank " +
                        " of nostro is C and expected bank ov created vostro is A"
                );

                async.waterfall(
                    [
                        next => {
                            logger.info(" - Create account for bank1");
                            cbsApi["Account"].createNew(
                                // create bank own account
                                {
                                    identityId: bank1OwnIdentity.id,
                                    linkExpectationBank:
                                        bank2OwnIdentity.bank.bankIdentity,
                                    currentBalance: initBalanceNostroVostro,
                                    availableBalance: initBalanceNostroVostro,
                                    spendingLimit: initBalanceNostroVostro
                                },
                                function(err, res) {
                                    if (err) {
                                        next(err);
                                    } else {
                                        expect(res).to.be.an("object");
                                        expect(res).to.have.ownProperty("body");
                                        expect(res.body).to.have.ownProperty(
                                            "identity"
                                        );
                                        expect(res.body.identity).to.be.an(
                                            "object"
                                        );
                                        expect(
                                            res.body.identity
                                        ).to.have.ownProperty("id");
                                        expect(
                                            res.body.identity.id
                                        ).to.be.above(0);
                                        next(null, res.body);
                                    }
                                }
                            );
                        },
                        (accountBank1, next) => {
                            logger.info(" - Create account for bank2");
                            cbsApi["Account"].createNew(
                                // create bank own account
                                {
                                    identityId: bank2OwnIdentity.id,
                                    linkExpectationBank:
                                        bank3OwnIdentity.bank.bankIdentity,
                                    currentBalance: initBalanceNostroVostro,
                                    availableBalance: initBalanceNostroVostro,
                                    spendingLimit: initBalanceNostroVostro
                                },
                                function(err, res) {
                                    if (err) {
                                        next(err);
                                    } else {
                                        expect(res).to.be.an("object");
                                        expect(res).to.have.ownProperty("body");
                                        expect(res.body).to.have.ownProperty(
                                            "identity"
                                        );
                                        expect(res.body.identity).to.be.an(
                                            "object"
                                        );
                                        expect(
                                            res.body.identity
                                        ).to.have.ownProperty("id");
                                        expect(
                                            res.body.identity.id
                                        ).to.be.above(0);
                                        next(null, accountBank1, res.body);
                                    }
                                }
                            );
                        },
                        (accountBank1, accountBank2, next) => {
                            logger.info(
                                " - link account from bank1 to account from bank2"
                            );

                            cbsApi["Account"].linkAccount(
                                accountBank1,
                                accountBank2,
                                function(err, res) {
                                    if (err) {
                                        try {
                                            res = JSON.parse(err);
                                        } catch (e) {
                                            return next(
                                                "Cant parse CBS response"
                                            );
                                        }
                                    } else {
                                        logger.error(
                                            " - Success linked nostro to vostro despite of that Expectation Bank was other.",
                                            res
                                        );
                                    }

                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("header");
                                    expect(res.header).to.be.an("object");
                                    expect(res.header).to.have.ownProperty(
                                        "response_code"
                                    );
                                    expect(
                                        res.header.response_code
                                    ).to.not.equal(0);
                                    expect(res.header).to.have.ownProperty(
                                        "error_message"
                                    );

                                    next();
                                }
                            );
                        }
                    ],
                    err => done(err)
                );
            }
        ],
        err => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(0);
            } else {
                resolve();
            }
        }
    );
}
