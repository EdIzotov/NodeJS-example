"use strict";

const path = require("path");
const fs = require("fs");
const async = require("async");
const cbsApi = require(path.resolve("./cbs"));
const sapTransport = require(path.resolve("./api/transport"));
const SAP_DATA = require(path.resolve("./api/operations"));
const TYPES = require(path.resolve("./api/operationTypes"));
const privKey = fs.readFileSync(path.resolve("./test/data/private.key"));
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";
const uuidV1 = require("uuid/v1");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const winston = require("winston");
const storage = require(path.resolve("./test/data/storage"));
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const sapConfig = require(path.resolve("./config/sap.json"))[
    process.env.NODE_ENV
];
let url = "";
if (fs.existsSync(path.resolve("./iov_env.conf"))) {
    require("node-env-file")(path.resolve("./iov_env.conf"));
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
let ws;
let newUUIDv1;
let bank;
let identity1;
let account1;
let ammount1 = 10000;
let secretKey1;
let identity2;
let account2;
let ammount2 = 10000;
let secretKey2;
let amountPerTransaction = 5;

describe("Checking RollBack - IOV-695", function() {
    before(function(done) {
        async.waterfall(
            [
                next => {
                    logger.info("SAP API URL: " + url);
                    logger.info("CBS API URL: " + cbsApi.getCbsUrl());
                    let data = {
                        name: "Bank-Ed-17_" + Date.now(),
                        isIovBank: false
                    };
                    logger.info("Create bank");
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
                            expect(res.body).to.have.ownProperty("assetHost");
                            expect(res.body).to.have.ownProperty("blackBox");
                            bank = res.body;
                            next(null);
                        }
                    });
                },
                next => {
                    logger.info("Create identity1");
                    let identity = {
                        bankId: bank.id,
                        firstName: "Identity1-Test_" + Date.now(),
                        lastName: "Identity1-Test_" + Date.now(),
                        phoneNumber: "0991000001",
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
                                identity1 = res.body;
                                next(null);
                            }
                        }
                    );
                },
                next => {
                    logger.info("Create account for identity1");
                    let account = {
                        identityId: identity1.id,
                        currentBalance: parseFloat(ammount1),
                        availableBalance: parseFloat(ammount1),
                        spendingLimit: 0,
                        description: "SAP autotest account"
                    };
                    cbsApi["Account"].createNew(account, function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("identity");
                            expect(res.body.identity).to.be.an("object");
                            expect(res.body.identity).to.have.ownProperty("id");
                            expect(res.body.identity.id).to.be.above(0);
                            account1 = res.body;
                            next(null);
                        }
                    });
                },
                next => {
                    logger.info(
                        "Make request to CBS for check existing identity1 in IOV"
                    );
                    cbsApi["Identity"].readIOV(
                        { id: account1.identity.id },
                        function(err, res) {
                            if (err) {
                                done(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.instanceof(Array);
                                expect(res.body.length).to.eql(1);
                                next(null);
                            }
                        }
                    );
                },
                next => {
                    logger.info("Create identity2");
                    let identity = {
                        bankId: bank.id,
                        firstName: "Identity2-Test_" + Date.now(),
                        lastName: "Identity2-Test_" + Date.now(),
                        phoneNumber: "0991000002",
                        passportNumber: "AA010102",
                        dateOfBirth: "2017-04-11T12:57:36.232Z",
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
                                identity2 = res.body;
                                next(null);
                            }
                        }
                    );
                },
                next => {
                    logger.info("Create account for identity2");
                    let account = {
                        identityId: identity2.id,
                        currentBalance: parseFloat(ammount2),
                        availableBalance: parseFloat(ammount2),
                        spendingLimit: 0,
                        //linkExpectationBank: "string",
                        description: "SAP autotest account"
                    };
                    cbsApi["Account"].createNew(account, function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("identity");
                            expect(res.body.identity).to.be.an("object");
                            expect(res.body.identity).to.have.ownProperty("id");
                            expect(res.body.identity.id).to.be.above(0);
                            account2 = res.body;
                            next(null);
                        }
                    });
                },
                next => {
                    logger.info(
                        "Make request to CBS for check existing identity2 in IOV"
                    );
                    cbsApi["Identity"].readIOV(
                        { id: account2.identity.id },
                        function(err, res) {
                            if (err) {
                                done(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.instanceof(Array);
                                expect(res.body.length).to.eql(1);
                                next(null);
                            }
                        }
                    );
                },
                next => {
                    logger.info("Create QR for identity1");
                    cbsApi["Identity"].createAccountsQR(
                        identity1,
                        (err, res) => {
                            if (err) {
                                logger.error(err);
                                done(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.an("object");
                                expect(res.body).to.have.ownProperty(
                                    "secretKey"
                                );
                                secretKey1 = res.body.secretKey;
                                next(null);
                            }
                        }
                    );
                },
                next => {
                    logger.info("Create QR for identity2");
                    cbsApi["Identity"].createAccountsQR(
                        identity2,
                        (err, res) => {
                            if (err) {
                                logger.error(err);
                                done(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.an("object");
                                expect(res.body).to.have.ownProperty(
                                    "secretKey"
                                );
                                secretKey2 = res.body.secretKey;
                                next(null);
                            }
                        }
                    );
                },
                next => {
                    logger.info("Add pubkey for account/identity1");
                    let data = SAP_DATA[TYPES.PUBKEY]({
                        yourIdentityIOVAddress:
                            account1.identity.iovMasterChainId,
                        privKey: privKey,
                        pubKey: pubKey,
                        secret: secretKey1,
                        keyId: 1
                    });
                    new sapTransport(url).send(
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
                                next(null);
                            }
                        }
                    );
                },
                next => {
                    logger.info("Add pubkey for account/identity2");
                    let data2 = SAP_DATA[TYPES.PUBKEY]({
                        yourIdentityIOVAddress:
                            account2.identity.iovMasterChainId,
                        privKey: privKey,
                        pubKey: pubKey,
                        secret: secretKey2,
                        keyId: 1
                    });
                    new sapTransport(url).send(
                        JSON.stringify(data2),
                        (err, res) => {
                            if (err) {
                                done(err);
                            } else {
                                if (res && res.error) {
                                    logger.error(res);
                                }
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("id");
                                expect(res.id).to.equal(data2.id);
                                expect(res).to.have.ownProperty("type");
                                expect(res.type).to.equal(data2.type);
                                expect(res).to.not.have.ownProperty("error");
                                next(null);
                            }
                        }
                    );
                }
            ],
            err => {
                if (err) {
                    logger.error("REQUEST ERROR: ", err);
                    process.exit(0);
                } else {
                    done();
                }
            }
        );
    });
    it("Check correct transaction from account1 to account2", function(done) {
        let trxAmount = parseFloat(amountPerTransaction);
        let data3 = SAP_DATA[TYPES.TRX]({
            yourIdentityIOVAddress: account1.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account1.iovSideChainId,
            counterpartyAccountNumber: account2.iovSideChainId,
            amount: trxAmount,
            valuationTime: Date.now(),
            keyId: 1
        });
        logger.info(
            "Transaction of amount - " +
                trxAmount +
                " from account1 to account2 without description"
        );
        new sapTransport(url).send(JSON.stringify(data3), (err, res) => {
            if (err) {
                done(err);
            } else {
                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("id");
                expect(res.id).to.equal(data3.id);
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.equal(data3.type);
                expect(res).to.not.have.ownProperty("error");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("currentChange");
                expect(res.body).to.have.ownProperty("availableChange");
                expect(res.body).to.have.ownProperty("currentBalance");
                expect(res.body).to.have.ownProperty("availableBalance");
                expect(res.body).to.have.ownProperty("processedAt");
                ammount1 = ammount1 - amountPerTransaction;
                ammount2 = ammount2 + amountPerTransaction;
                expect(res.body.currentBalance).to.equal(ammount1);
                logger.info(
                    "Check balance of account1 after correct transaction without description"
                );
                let data4 = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: 1
                });
                new sapTransport(url).send(
                    JSON.stringify(data4),
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            if (res && res.error) {
                                logger.error(res);
                            }
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("id");
                            expect(res.id).to.equal(data4.id);
                            expect(res).to.have.ownProperty("type");
                            expect(res.type).to.equal(data4.type);
                            expect(res).to.not.have.ownProperty("error");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("current");
                            expect(res.body.current).to.equal(ammount1);
                            logger.info(
                                "Check balance of account2 after correct transaction without description"
                            );
                            let data5 = SAP_DATA[TYPES.BALANCE]({
                                yourIdentityIOVAddress:
                                    account2.identity.iovMasterChainId,
                                privKey: privKey,
                                yourWalletAccountNumber:
                                    account2.iovSideChainId,
                                keyId: 1
                            });
                            new sapTransport(url).send(
                                JSON.stringify(data5),
                                (err, res) => {
                                    if (err) {
                                        done(err);
                                    } else {
                                        if (res && res.error) {
                                            logger.error(res);
                                        }
                                        expect(res).to.be.an("object");
                                        expect(res).to.have.ownProperty("id");
                                        expect(res.id).to.equal(data5.id);
                                        expect(res).to.have.ownProperty("type");
                                        expect(res.type).to.equal(data5.type);
                                        expect(res).to.not.have.ownProperty(
                                            "error"
                                        );
                                        expect(res).to.have.ownProperty("body");
                                        expect(res.body).to.have.ownProperty(
                                            "current"
                                        );
                                        expect(res.body.current).to.equal(
                                            ammount2
                                        );
                                        done();
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    });
    it("Check correct transaction from account1 to account2 with common description", function(done) {
        let trxAmount = parseFloat(amountPerTransaction);
        let data = SAP_DATA[TYPES.TRX]({
            yourIdentityIOVAddress: account1.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account1.iovSideChainId,
            counterpartyAccountNumber: account2.iovSideChainId,
            amount: trxAmount,
            valuationTime: Date.now(),
            description: "Some description",
            keyId: 1
        });
        logger.info(
            "Transaction of amount - " +
                trxAmount +
                " from account1 to account2 with common description"
        );
        new sapTransport(url).send(JSON.stringify(data), (err, res) => {
            if (err) {
                done(err);
            } else {
                if (res && res.error) {
                    logger.error(res);
                    done(err);
                }
                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("id");
                expect(res.id).to.equal(data.id);
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.equal(data.type);
                expect(res).to.not.have.ownProperty("error");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("currentChange");
                expect(res.body).to.have.ownProperty("availableChange");
                expect(res.body).to.have.ownProperty("currentBalance");
                expect(res.body).to.have.ownProperty("availableBalance");
                expect(res.body).to.have.ownProperty("processedAt");
                ammount1 = ammount1 - amountPerTransaction;
                ammount2 = ammount2 + amountPerTransaction;
                expect(res.body.currentBalance).to.equal(ammount1);
                logger.info(
                    "Check balance of account1 after correct transaction with common description"
                );
                let data6 = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: 1
                });
                new sapTransport(url).send(
                    JSON.stringify(data6),
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            if (res && res.error) {
                                logger.error(res);
                            }
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("id");
                            expect(res.id).to.equal(data6.id);
                            expect(res).to.have.ownProperty("type");
                            expect(res.type).to.equal(data6.type);
                            expect(res).to.not.have.ownProperty("error");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("current");
                            expect(res.body.current).to.equal(ammount1);
                            logger.info(
                                "Check balance of account2 after correct transaction with common description"
                            );
                            let data7 = SAP_DATA[TYPES.BALANCE]({
                                yourIdentityIOVAddress:
                                    account2.identity.iovMasterChainId,
                                privKey: privKey,
                                yourWalletAccountNumber:
                                    account2.iovSideChainId,
                                keyId: 1
                            });
                            new sapTransport(url).send(
                                JSON.stringify(data7),
                                (err, res) => {
                                    if (err) {
                                        done(err);
                                    } else {
                                        if (res && res.error) {
                                            logger.error(res);
                                        }
                                        expect(res).to.be.an("object");
                                        expect(res).to.have.ownProperty("id");
                                        expect(res.id).to.equal(data7.id);
                                        expect(res).to.have.ownProperty("type");
                                        expect(res.type).to.equal(data7.type);
                                        expect(res).to.not.have.ownProperty(
                                            "error"
                                        );
                                        expect(res).to.have.ownProperty("body");
                                        expect(res.body).to.have.ownProperty(
                                            "current"
                                        );
                                        expect(res.body.current).to.equal(
                                            ammount2
                                        );
                                        done();
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    });
    it("Check correct transaction from account1 to account2 with special description", function(done) {
        this.timeout(300000);
        let trxAmount = parseFloat(amountPerTransaction);
        let data = SAP_DATA[TYPES.TRX]({
            yourIdentityIOVAddress: account1.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account1.iovSideChainId,
            counterpartyAccountNumber: account2.iovSideChainId,
            amount: trxAmount,
            valuationTime: Date.now(),
            description: "test description: drop master transaction",
            keyId: 1
        });
        logger.info(
            "Transaction of amount - " +
                trxAmount +
                " from account1 to account2 with special description"
        );
        new sapTransport(url).send(JSON.stringify(data), (err, res) => {
            if (err) {
                done(err);
            } else {
                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("id");
                expect(res.id).to.equal(data.id);
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.equal(data.type);
                expect(res).to.have.ownProperty("error");
                expect(res.error).to.be.an("object");
                expect(res.error).to.have.ownProperty("status");
                expect(res.error).to.have.ownProperty("message");
                expect(res).to.have.ownProperty("errorCode");
                expect(res.errorCode).to.equal(301);
                logger.info(
                    "Check balance of account1 after dropped transaction with special description"
                );
                let data8 = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    keyId: 1
                });
                new sapTransport(url).send(
                    JSON.stringify(data8),
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            if (res && res.error) {
                                logger.error(res);
                            }
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("id");
                            expect(res.id).to.equal(data8.id);
                            expect(res).to.have.ownProperty("type");
                            expect(res.type).to.equal(data8.type);
                            expect(res).to.not.have.ownProperty("error");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.have.ownProperty("current");
                            expect(res.body.current).to.equal(ammount1);
                            logger.info(
                                "Check balance of account2 after dropped transaction with special description"
                            );
                            let data9 = SAP_DATA[TYPES.BALANCE]({
                                yourIdentityIOVAddress:
                                    account2.identity.iovMasterChainId,
                                privKey: privKey,
                                yourWalletAccountNumber:
                                    account2.iovSideChainId,
                                keyId: 1
                            });
                            new sapTransport(url).send(
                                JSON.stringify(data9),
                                (err, res) => {
                                    if (err) {
                                        done(err);
                                    } else {
                                        if (res && res.error) {
                                            logger.error(res);
                                        }
                                        expect(res).to.be.an("object");
                                        expect(res).to.have.ownProperty("id");
                                        expect(res.id).to.equal(data9.id);
                                        expect(res).to.have.ownProperty("type");
                                        expect(res.type).to.equal(data9.type);
                                        expect(res).to.not.have.ownProperty(
                                            "error"
                                        );
                                        expect(res).to.have.ownProperty("body");
                                        expect(res.body).to.have.ownProperty(
                                            "current"
                                        );
                                        expect(res.body.current).to.equal(
                                            ammount2
                                        );
                                        logger.info(
                                            "Check balance of account1 after dropped transaction with special description - all nodes"
                                        );
                                        let data10 = SAP_DATA[
                                            TYPES.BALANCEREPORT
                                        ]({
                                            yourIdentityIOVAddress:
                                                account1.identity
                                                    .iovMasterChainId,
                                            privKey: privKey,
                                            yourWalletAccountNumber:
                                                account1.iovSideChainId,
                                            keyId: 1
                                        });
                                        new sapTransport(url).send(
                                            JSON.stringify(data10),
                                            (err, res) => {
                                                if (err) {
                                                    done(err);
                                                } else {
                                                    expect(res).to.be.an(
                                                        "object"
                                                    );
                                                    expect(
                                                        res
                                                    ).to.have.ownProperty("id");
                                                    expect(res.id).to.equal(
                                                        data10.id
                                                    );
                                                    expect(
                                                        res
                                                    ).to.have.ownProperty(
                                                        "type"
                                                    );
                                                    expect(res.type).to.equal(
                                                        data10.type
                                                    );
                                                    expect(
                                                        res
                                                    ).to.not.have.ownProperty(
                                                        "error"
                                                    );
                                                    expect(
                                                        res
                                                    ).to.have.ownProperty(
                                                        "body"
                                                    );
                                                    expect(
                                                        res.body
                                                    ).to.have.ownProperty(
                                                        "entries"
                                                    );
                                                    expect(
                                                        res.body.entries
                                                    ).to.be.an("array");
                                                    for (
                                                        let i = 0;
                                                        i <
                                                        res.body.entries.length;
                                                        i++
                                                    ) {
                                                        expect(
                                                            res.body.entries[i]
                                                                .current
                                                        ).to.be.equal(ammount1);
                                                    }
                                                    logger.info(
                                                        "Check balance of account2 after dropped transaction with special description - all nodes"
                                                    );
                                                    let data11 = SAP_DATA[
                                                        TYPES.BALANCEREPORT
                                                    ]({
                                                        yourIdentityIOVAddress:
                                                            account2.identity
                                                                .iovMasterChainId,
                                                        privKey: privKey,
                                                        yourWalletAccountNumber:
                                                            account2.iovSideChainId,
                                                        keyId: 1
                                                    });
                                                    new sapTransport(url).send(
                                                        JSON.stringify(data11),
                                                        (err, res) => {
                                                            if (err) {
                                                                done(err);
                                                            } else {
                                                                expect(
                                                                    res
                                                                ).to.be.an(
                                                                    "object"
                                                                );
                                                                expect(
                                                                    res
                                                                ).to.have.ownProperty(
                                                                    "id"
                                                                );
                                                                expect(
                                                                    res.id
                                                                ).to.equal(
                                                                    data11.id
                                                                );
                                                                expect(
                                                                    res
                                                                ).to.have.ownProperty(
                                                                    "type"
                                                                );
                                                                expect(
                                                                    res.type
                                                                ).to.equal(
                                                                    data11.type
                                                                );
                                                                expect(
                                                                    res
                                                                ).to.not.have.ownProperty(
                                                                    "error"
                                                                );
                                                                expect(
                                                                    res
                                                                ).to.have.ownProperty(
                                                                    "body"
                                                                );
                                                                expect(
                                                                    res.body
                                                                ).to.have.ownProperty(
                                                                    "entries"
                                                                );
                                                                expect(
                                                                    res.body
                                                                        .entries
                                                                ).to.be.an(
                                                                    "array"
                                                                );
                                                                for (
                                                                    let i = 0;
                                                                    i <
                                                                    res.body
                                                                        .entries
                                                                        .length;
                                                                    i++
                                                                ) {
                                                                    expect(
                                                                        res.body
                                                                            .entries[
                                                                            i
                                                                        ]
                                                                            .current
                                                                    ).to.be.equal(
                                                                        ammount2
                                                                    );
                                                                }
                                                                done();
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    });
});
