require("node-env-file")(__dirname + "/../../../.env");

const async = require("async");
const testsConfig = require(__dirname + "/../../../config/tests.json");
const fs = require("fs");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const sapTransport = require(__dirname + "/../../../api/transport");
const sapConfig = require(__dirname + "/../../../config/sap.json")[
    process.env.NODE_ENV
];
const cbsApi = require(__dirname + "/../../../cbs");
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
    let trxAmount = parseFloat(process.env["400_trxAmount"]);
    let trxDescription = "test description " + testOperation;
    let keyId = process.env["400_keyId7"];
    let account1 = JSON.parse(process.env["400_account7"]);
    let account2 = JSON.parse(process.env["400_account8"]);
    let amount = parseFloat(process.env["400_amount7"]);

    async.waterfall(
        [
            done => {
                logger.info(
                    "Make request to SAP trx from identity1/account to identity2/account"
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    counterpartyAccountNumber: account2.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId,
                    description: trxDescription
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res) {
                            if (res.error) {
                                logger.error(res);
                            } else {
                                amount = amount - trxAmount;
                                process.env["amount1"] = amount;
                            }
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

                        setTimeout(() => {
                            done(null, res.id, res.body.processedAt);
                        }, testsConfig.beforeTestTimeout);
                    }
                });
            },
            (transactionId, processedAt, done) => {
                logger.info(
                    "Make 20 requests to SAP history for identity1/account"
                );

                async.timesLimit(
                    20,
                    1,
                    (n, nextRequest) => {
                        let data = SAP_DATA[TYPES.HISTORY]({
                            yourIdentityIOVAddress:
                                account1.identity.iovMasterChainId,
                            privKey: privKey,
                            yourWalletAccountNumber: account1.iovSideChainId,
                            from: processedAt - 10,
                            to: new Date(
                                new Date().getTime() + 60 * 60 * 24 * 1000
                            ).getTime(),
                            keyId: keyId,
                            limit: 20
                        });

                        new sapTransport(url).send(
                            JSON.stringify(data),
                            (err, res) => {
                                if (err) {
                                    nextRequest(err);
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
                                        "entries"
                                    );
                                    expect(res.body.entries).to.be.instanceof(
                                        Array
                                    );
                                    expect(
                                        res.body.entries
                                    ).to.have.length.above(0);

                                    let trx;

                                    for (
                                        let i = 0;
                                        i < res.body.entries.length;
                                        i++
                                    ) {
                                        if (
                                            res.body.entries[i].trxId ===
                                            transactionId
                                        ) {
                                            trx = res.body.entries[i];
                                            break;
                                        }
                                    }

                                    expect(trx).to.be.an("object");
                                    expect(trx).to.have.ownProperty(
                                        "counterparty"
                                    );
                                    expect(trx.counterparty).to.equal(
                                        account2.iovSideChainId
                                    );
                                    expect(trx).to.have.ownProperty(
                                        "description"
                                    );
                                    expect(trx.description).to.equal(
                                        trxDescription
                                    );

                                    nextRequest();
                                }
                            }
                        );
                    },
                    err => done(err, transactionId)
                );
            },
            (transactionId, done) => {
                logger.info(
                    "Make 20 requests to SAP trxstatus for identity1/account"
                );

                async.timesLimit(
                    20,
                    1,
                    (n, nextRequest) => {
                        let data = SAP_DATA[TYPES.TRXSTATUS]({
                            yourIdentityIOVAddress:
                                account1.identity.iovMasterChainId,
                            privKey: privKey,
                            transactionId: transactionId,
                            yourWalletAccountNumber: account1.iovSideChainId,
                            keyId: keyId
                        });

                        new sapTransport(url).send(
                            JSON.stringify(data),
                            (err, res) => {
                                if (err) {
                                    nextRequest(err);
                                } else {
                                    if (res && res.errorCode) {
                                        logger.error(res);
                                    }
                                    //console.log('STEP', n, res);
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("id");
                                    expect(res.id).to.equal(data.id);
                                    expect(res).to.have.ownProperty("type");
                                    expect(res.type).to.equal(data.type);
                                    expect(res).to.not.have.ownProperty(
                                        "error"
                                    );
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.be.an("object");
                                    expect(res.body).to.have.ownProperty(
                                        "status"
                                    );
                                    expect(res.body.status).to.be.an("object");
                                    expect(res.body.status).to.have.ownProperty(
                                        "description"
                                    );
                                    expect(
                                        res.body.status.description
                                    ).to.equal(trxDescription);
                                    expect(res.body.status).to.have.ownProperty(
                                        "processedAt"
                                    );

                                    nextRequest();
                                }
                            }
                        );
                    },
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
