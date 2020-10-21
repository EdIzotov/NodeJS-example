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
        this.timeout(200000);
        it("should send without error", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let balanceAccount1 = parseFloat(process.env["400_amount11"]);
    let balanceAccount2 = parseFloat(process.env["400_amount12"]);
    let numberOfTransactions = 50;

    let trxAmount = parseFloat(process.env["400_trxAmount"]);
    let keyId1 = process.env["400_keyId11"];
    let keyId2 = process.env["400_keyId12"];
    let accounts = [
        JSON.parse(process.env["400_account11"]),
        JSON.parse(process.env["400_account12"])
    ];

    logger.info(
        "Info: Perform " +
            numberOfTransactions +
            " transactions and check balance via SAP balancereport."
    );

    async.waterfall(
        [
            done => {
                logger.info(
                    "Request: Perform transactions from account1(" +
                        accounts[0].iovSideChainId +
                        ") to account2(" +
                        accounts[1].iovSideChainId +
                        ")"
                );

                async.timesLimit(
                    numberOfTransactions,
                    1,
                    (n, next) => {
                        let data = SAP_DATA[TYPES.TRX]({
                            yourIdentityIOVAddress:
                                accounts[0].identity.iovMasterChainId,
                            privKey: privKey,
                            yourWalletAccountNumber: accounts[0].iovSideChainId,
                            counterpartyAccountNumber:
                                accounts[1].iovSideChainId,
                            amount: trxAmount,
                            valuationTime: Date.now(),
                            keyId: keyId1
                        });

                        new sapTransport(url).send(
                            JSON.stringify(data),
                            (err, res) => {
                                if (err) {
                                    next(err);
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
                                        balanceAccount1 - trxAmount
                                    );

                                    balanceAccount1 =
                                        balanceAccount1 - trxAmount;
                                    balanceAccount2 =
                                        balanceAccount2 + trxAmount;
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
                logger.info("Request: SAP balance for account1");

                let account = accounts[0];

                let data = SAP_DATA[TYPES.BALANCEREPORT]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
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
                        expect(res.body).to.have.ownProperty("entries");
                        expect(res.body.entries).to.be.instanceof(Array);
                        expect(res.body.entries.length).to.be.above(0);

                        for (let i = 0; i < res.body.entries.length; i++) {
                            expect(res.body.entries[i]).to.be.an("object");
                            expect(res.body.entries[i]).to.have.ownProperty(
                                "nodeId"
                            );
                            logger.info(
                                " - check node " + res.body.entries[i].nodeId
                            );
                            expect(res.body.entries[i]).to.have.ownProperty(
                                "current"
                            );
                            expect(res.body.entries[i]).to.have.ownProperty(
                                "available"
                            );
                            expect(res.body.entries[i].current).to.equal(
                                balanceAccount1
                            );
                            expect(res.body.entries[i].available).to.equal(
                                balanceAccount1
                            );
                        }

                        done();
                    }
                });
            },
            done => {
                logger.info("Request: SAP balance for account2");

                let account = accounts[1];

                let data = SAP_DATA[TYPES.BALANCEREPORT]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
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
                        expect(res.body).to.have.ownProperty("entries");
                        expect(res.body.entries).to.be.instanceof(Array);
                        expect(res.body.entries.length).to.be.above(0);

                        for (let i = 0; i < res.body.entries.length; i++) {
                            expect(res.body.entries[i]).to.be.an("object");
                            expect(res.body.entries[i]).to.have.ownProperty(
                                "nodeId"
                            );
                            logger.info(
                                " - check node " + res.body.entries[i].nodeId
                            );
                            expect(res.body.entries[i]).to.have.ownProperty(
                                "current"
                            );
                            expect(res.body.entries[i]).to.have.ownProperty(
                                "available"
                            );
                            expect(res.body.entries[i].current).to.equal(
                                balanceAccount2
                            );
                            expect(res.body.entries[i].available).to.equal(
                                balanceAccount2
                            );
                        }

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
