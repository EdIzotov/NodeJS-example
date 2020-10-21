require("node-env-file")(__dirname + "/../../../.env");

const async = require("async");
const testsConfig = require(__dirname + "/../../../config/tests.json");
const sapTransport = require(__dirname + "/../../../api/transport");
const sapConfig = require(__dirname + "/../../../config/sap.json")[
    process.env.NODE_ENV
];
const cbsConfig = require(__dirname + "/../../../config/cbs.json")[
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
if (fs.existsSync(__dirname + "/../iov_env.conf")) {
    require("node-env-file")(__dirname + "/../iov_env.conf");
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
        it("should send with error", function(resolve) {
            logger.info("Skip until XXX-2433 is fixed.");
            return this.skip();

            if (cbsConfig.CBS.url.length > 1 && !process.env.cbs_host) {
                requests(resolve);
            } else {
                logger.info("Skip test. On this environment only one CBS.");
                this.skip();
            }
        });
    });
});

function requests(resolve) {
    logger.info(`Check transaction rollback if accounts store in different CBS.
    Account A(CBS1) and Account B(CBS2) exist in IOV, but account B deleted in CBS`);

    let accounts = [];

    async.waterfall(
        [
            next => {
                createAccountInEachCbs(next, accounts);
            },
            next => {
                deleteAccountsInCbs(next, accounts);
            },
            next => {
                performSapTransactionFromAccountInCbs1ToOther(next, accounts);
            },
            next => {
                checkBalanceIOV(next, accounts);
            },
            next => {
                checkBalanceCbs(next, accounts);
            }
        ],
        err => {
            cbsApi.setCbsUrl(cbsConfig.CBS.url[0] + ":" + cbsConfig.CBS.port);
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(1);
            }
            resolve();
        }
    );
}

function checkBalanceCbs(next, accounts) {
    let account = accounts[0];
    let amount = 100;
    let keyId = "1";

    logger.info("Check CBS balance.");

    cbsApi.setCbsUrl(cbsConfig.CBS.url[0] + ":" + cbsConfig.CBS.port);

    cbsApi["Account"].read({ id: account.id }, function(err, res) {
        if (err) {
            next(err);
        } else {
            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("body");
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.ownProperty("currentBalance");
            expect(res.body.currentBalance).to.equal(amount);
            next();
        }
    });
}

function checkBalanceIOV(next, accounts) {
    async.eachLimit(
        accounts,
        1,
        (account, nextBalance) => {
            let amount = 100;
            let keyId = "1";

            logger.info("Check balance.");

            let data = SAP_DATA[TYPES.BALANCE]({
                yourIdentityIOVAddress: account.identity.iovMasterChainId,
                privKey: privKey,
                yourWalletAccountNumber: account.iovSideChainId,
                keyId: keyId
            });

            new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                if (err) {
                    nextBalance(err);
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
                    expect(res.body.current).to.equal(amount);

                    nextBalance();
                }
            });
        },
        err => next(err)
    );
}

function performSapTransactionFromAccountInCbs1ToOther(next, accounts) {
    logger.info(
        `Perform SAP transaction from account(CBS1) to accounts from other CBSs.`
    );

    let account1 = accounts[1];
    let dataset = [];
    let trxAmount = 1;
    let keyId = "1";

    async.eachLimit(
        accounts.slice(1),
        1,
        (account2, nextTrx) => {
            let data = SAP_DATA[TYPES.TRX]({
                yourIdentityIOVAddress: account2.identity.iovMasterChainId,
                privKey: privKey,
                yourWalletAccountNumber: account2.iovSideChainId,
                counterpartyAccountNumber: account1.iovSideChainId,
                amount: trxAmount,
                valuationTime: Date.now(),
                keyId: keyId
            });

            new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                if (err) {
                    nextTrx(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("id");
                    expect(res.id).to.equal(data.id);
                    expect(res).to.have.ownProperty("type");
                    expect(res.type).to.equal(data.type);
                    expect(res).to.have.ownProperty("errorCode");
                    expect(res).to.have.ownProperty("errorCode");
                    expect(res.errorCode).to.equal(104);

                    nextTrx();
                }
            });
        },
        next
    );
}

function deleteAccountsInCbs(next, accounts) {
    logger.info(`Delete accounts in CBSs except first CBS.`);

    async.eachLimit(
        cbsConfig.CBS.url,
        1,
        (cbsUrl, nextCbs) => {
            let idx = cbsConfig.CBS.url.indexOf(cbsUrl);

            // skip first cbs
            if (!idx) {
                return nextCbs();
            }
            cbsApi.setCbsUrl(cbsUrl + ":" + cbsConfig.CBS.port);
            cbsApi["Account"].delete(accounts[idx], (err, res) => {
                if (err) {
                    nextCbs(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("body");

                    nextCbs();
                }
            });
        },
        next
    );
}

function createAccountInEachCbs(next, accounts) {
    let accountInitAmount = 100;

    async.eachLimit(
        cbsConfig.CBS.url,
        1,
        (cbsUrl, nextCbs) => {
            cbsApi.setCbsUrl(cbsUrl + ":" + cbsConfig.CBS.port);
            async.waterfall(
                [
                    done => {
                        logger.info("Create new Bank.");

                        let data = {
                            name: "Bank4Test_" + Date.now(),
                            isIovBank: false
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
                                expect(res.body).to.have.ownProperty("bic");
                                expect(res.body).to.have.ownProperty("sap");
                                expect(res.body).to.have.ownProperty(
                                    "assetHost"
                                );
                                expect(res.body).to.have.ownProperty(
                                    "blackBox"
                                );

                                //storage.add("BANKS", res.body);

                                done(null, res.body);
                            }
                        });
                    },
                    (bank, done) => {
                        logger.info("Create identity in CBS " + cbsUrl);

                        let identity = {
                            bankId: bank.id,
                            firstName: "TestFirstName_" + Date.now(),
                            lastName: "TestLastName_" + Date.now(),
                            phoneNumber: "0991910757",
                            passportNumber: "AA010101",
                            dateOfBirth: "2017-04-13T12:57:36.232Z",
                            nationality: "UA"
                        };

                        cbsApi["Identity"].createNewPrivateIdentity(
                            identity,
                            function(err, res) {
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
                        logger.info("Create account for identity.");

                        cbsApi["Account"].createNew(
                            {
                                identityId: identity.id,
                                currency: "EUR",
                                currentBalance: accountInitAmount,
                                availableBalance: accountInitAmount,
                                spendingLimit: 0
                            },
                            (err, res) => {
                                if (err) {
                                    done(err);
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
                                    done(null, res.body);
                                }
                            }
                        );
                    },
                    (account, done) => {
                        logger.info("Request to CBS. Create account QR.");

                        cbsApi["Identity"].createAccountsQR(
                            account.identity,
                            function(err, res) {
                                if (err) {
                                    done(err);
                                } else {
                                    //console.log('CREATE QR RESP', res.body);
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.be.an("object");
                                    expect(res.body).to.have.ownProperty(
                                        "secretKey"
                                    );

                                    done(null, account, res.body.secretKey);
                                }
                            }
                        );
                    },
                    (account, secretKey, done) => {
                        let data = SAP_DATA[TYPES.PUBKEY]({
                            yourIdentityIOVAddress:
                                account.identity.iovMasterChainId,
                            privKey: privKey,
                            pubKey: pubKey,
                            secret: secretKey,
                            keyId: "1"
                        });

                        logger.info("Request to SAP. Add pubkey.");

                        new sapTransport(url).send(
                            JSON.stringify(data),
                            (err, res) => {
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
                                    expect(res).to.not.have.ownProperty(
                                        "error"
                                    );
                                    done();
                                }
                            }
                        );
                    }
                ],
                err => nextCbs(err)
            );
        },
        err => next(err)
    );
}
