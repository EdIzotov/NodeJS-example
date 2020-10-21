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
            //            setTimeout(requests.bind(this, resolve), testsConfig.beforeTestTimeout);
        });
    });
});

function requests(resolve) {
    let account = JSON.parse(process.env["100_account1"]);
    let secretKey = process.env["100_secretKey1"];
    let keyId = process.env["100_keyId1"];
    let amount = parseFloat(process.env["100_amount1"]);
    let trxAmount = parseFloat(process.env["100_trxAmount"]);
    let trx_id = process.env["100_trx_id"];

    async.waterfall(
        [
            done => {
                // Check trx status from SAP

                logger.info("Request: SAP transaction status");

                let data = SAP_DATA[TYPES.TRXSTATUS]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    transactionId: trx_id,
                    yourWalletAccountNumber: account.iovSideChainId,
                    keyId: keyId
                });

                let doRequests = 10;
                let currentRequest = 1;
                let timeToNextRequest = 3000;

                (function requestRecursively() {
                    new sapTransport(url).send(
                        JSON.stringify(data),
                        (err, res) => {
                            if (err) {
                                done(err);
                            } else {
                                if (res && res.errorCode) {
                                    if (currentRequest > doRequests) {
                                        logger.error(res);
                                        expect(res).to.not.have.ownProperty(
                                            "error"
                                        );
                                        return done();
                                    } else {
                                        setTimeout(
                                            requestRecursively,
                                            timeToNextRequest
                                        );
                                        currentRequest++;

                                        return false;
                                    }
                                }

                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("id");
                                expect(res.id).to.equal(data.id);
                                expect(res).to.have.ownProperty("type");
                                expect(res.type).to.equal(data.type);
                                expect(res).to.not.have.ownProperty(
                                    "errorCode"
                                );
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.an("object");
                                expect(res.body).to.have.ownProperty("status");
                                expect(res.body.status).to.be.an("object");
                                expect(res.body.status).to.have.ownProperty(
                                    "transactionId"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "currentChange"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "availableChange"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "spendingLimitChange"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "currentBalance"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "availableBalance"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "spendingLimit"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "processedAt"
                                );
                                expect(res.body.status).to.have.ownProperty(
                                    "operation"
                                );

                                expect(res.body.status.transactionId).to.equal(
                                    trx_id
                                );
                                expect(res.body.status.currentBalance).to.equal(
                                    amount
                                );
                                expect(res.body.status.currentChange).to.equal(
                                    trxAmount * -1
                                );
                                expect(res.body.status.operation).to.equal(
                                    "Debit"
                                );

                                done();
                            }
                        }
                    );
                })();
            },
            done => {
                logger.info("Request: CBS transaction status");

                cbsApi["Transaction"].getOneIovTransaction(
                    account.id,
                    trx_id,
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty(
                                "extTransactionId"
                            );
                            expect(res.body.extTransactionId).to.equal(trx_id);
                            expect(res.body).to.have.ownProperty("trxType");
                            expect(res.body.trxType).to.equal("Debit");
                            expect(res.body).to.have.ownProperty("trxStatus");
                            expect(res.body.trxStatus).to.equal("Success");
                            expect(res.body).to.have.ownProperty("trxSource");
                            expect(res.body.trxSource).to.equal("Iov");

                            done();
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
