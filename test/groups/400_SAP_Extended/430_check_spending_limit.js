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
    logger.info("Spending limit tests.");

    let trxAmount = parseFloat(process.env["400_trxAmount"]);
    let keyId = process.env["400_keyId9"];
    let accounts = [
        JSON.parse(process.env["400_account9"]),
        JSON.parse(process.env["400_account10"])
    ];
    let spendingLimit = 1000;
    let balance = parseFloat(process.env["400_amount9"]);

    async.waterfall(
        [
            done => {
                logger.info(
                    "Request: SAP transaction on payment amount " +
                        trxAmount +
                        "EUR and check current balance"
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress:
                        accounts[0].identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: accounts[0].iovSideChainId,
                    counterpartyAccountNumber: accounts[1].iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
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
                        expect(res.body).to.have.ownProperty("currentChange");
                        expect(res.body).to.have.ownProperty("availableChange");
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body).to.have.ownProperty(
                            "availableBalance"
                        );
                        expect(res.body).to.have.ownProperty("processedAt");

                        expect(res.body.currentBalance).to.equal(
                            balance - trxAmount
                        );

                        balance = balance - trxAmount;
                        done();
                    }
                });
            },
            done => {
                logger.info(
                    "Request: CBS set spending limit = " +
                        spendingLimit +
                        " and check currentBalance,availableBalance (expect availableBalance = currentBalance + spendingLimit)"
                );

                cbsApi["oldWorld"].changeAccountSpendingLimit(
                    accounts[0],
                    {
                        spendingLimit: spendingLimit
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty(
                                "currentBalance"
                            );
                            expect(res.body).to.have.ownProperty(
                                "availableBalance"
                            );
                            expect(res.body).to.have.ownProperty(
                                "spendingLimit"
                            );
                            expect(res.body.currentBalance).to.equal(balance);
                            expect(res.body.availableBalance).to.equal(
                                balance + spendingLimit
                            );
                            expect(res.body.spendingLimit).to.equal(
                                spendingLimit
                            );

                            done();
                        }
                    }
                );
            },
            done => {
                logger.info(
                    "Request: SAP transaction on payment amount = currentBalance + spendingLimit = " +
                        (balance + spendingLimit)
                );

                let trxAmount = balance + spendingLimit;
                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress:
                        accounts[0].identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: accounts[0].iovSideChainId,
                    counterpartyAccountNumber: accounts[1].iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
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
                        expect(res.body).to.have.ownProperty("currentChange");
                        expect(res.body.currentChange).to.equal(trxAmount * -1);
                        expect(res.body).to.have.ownProperty("availableChange");
                        expect(res.body.availableChange).to.equal(
                            trxAmount * -1
                        );
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body).to.have.ownProperty(
                            "availableBalance"
                        );
                        expect(res.body).to.have.ownProperty(
                            "availableBalance"
                        );
                        expect(res.body).to.have.ownProperty("processedAt");

                        expect(res.body.currentBalance).to.equal(
                            spendingLimit * -1
                        );
                        balance = 0;
                        expect(res.body.availableBalance).to.equal(balance);
                        done();
                    }
                });
            },
            done => {
                logger.info(
                    "Request: SAP balance and check availableChange, currentBalance, spendingLimit. "
                );

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress:
                        accounts[0].identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: accounts[0].iovSideChainId,
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
                        expect(res.body.current).to.equal(spendingLimit * -1);
                        expect(res.body.available).to.equal(balance);
                        expect(res.body.spendingLimit).to.equal(spendingLimit);

                        done();
                    }
                });
            },
            done => {
                logger.info(
                    "Request: SAP transaction. Account available balance = " +
                        balance
                );

                let trxAmount = 0.01;
                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress:
                        accounts[0].identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: accounts[0].iovSideChainId,
                    counterpartyAccountNumber: accounts[1].iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId
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
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");

                        done();
                    }
                });
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
