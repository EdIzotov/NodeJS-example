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
    let trxsProcessedTime = [];
    let trxsResp = [];

    let balanceAccount = parseFloat(process.env["400_amount13"]);
    let trxAmount = parseFloat(process.env["400_trxAmount"]);
    let keyId = process.env["400_keyId13"];
    let accounts = [
        JSON.parse(process.env["400_account13"]),
        JSON.parse(process.env["400_account14"])
    ];

    logger.info("Check history pagination.");

    async.waterfall(
        [
            done => {
                logger.info("Send 15 transactions with value from 1 to 15.");

                let account1 = accounts[0];
                let account2 = accounts[1];

                async.timesLimit(
                    15,
                    1,
                    (n, nextTransaction) => {
                        let trxAmount = n + 1;
                        let data = SAP_DATA[TYPES.TRX]({
                            yourIdentityIOVAddress:
                                account1.identity.iovMasterChainId,
                            privKey: privKey,
                            yourWalletAccountNumber: account1.iovSideChainId,
                            counterpartyAccountNumber: account2.iovSideChainId,
                            amount: trxAmount,
                            valuationTime: Date.now(),
                            keyId: keyId
                        });

                        new sapTransport(url).send(
                            JSON.stringify(data),
                            (err, res) => {
                                if (err) {
                                    nextTransaction(err);
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
                                    expect(res.body.currentChange).to.equal(
                                        trxAmount * -1
                                    );
                                    expect(res.body).to.have.ownProperty(
                                        "availableChange"
                                    );
                                    expect(res.body.availableChange).to.equal(
                                        trxAmount * -1
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
                                        (balanceAccount -= trxAmount)
                                    );

                                    trxsProcessedTime.push(
                                        res.body.processedAt
                                    );
                                    trxsResp.push(res);

                                    setTimeout(nextTransaction, 1000);
                                }
                            }
                        );
                    },
                    err => {
                        setTimeout(() => {
                            done(err);
                        }, 20000);
                        trxsResp = trxsResp.reverse();
                    }
                );
            },
            done => {
                logger.info(
                    "Request to history 3 times with limit 5 trx for each. Check for all transactions exist without duplication."
                );

                let account1 = accounts[0];
                let account2 = accounts[1];
                let historyLimit = 5;

                let nextTo = null;

                async.timesLimit(
                    3,
                    1,
                    (n, nextHistoryPage) => {
                        let data = SAP_DATA[TYPES.HISTORY]({
                            yourIdentityIOVAddress:
                                account1.identity.iovMasterChainId,
                            privKey: privKey,
                            yourWalletAccountNumber: account1.iovSideChainId,
                            from: Date.now() - 60 * 60 * 24 * 1000, //time.start,
                            to: nextTo ? nextTo : Date.now() + 100000, // time.end
                            keyId: keyId,
                            limit: historyLimit
                        });

                        new sapTransport(url).send(
                            JSON.stringify(data),
                            (err, res) => {
                                if (err) {
                                    nextHistoryPage(err);
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

                                    expect(res.body.entries.length).to.equal(
                                        historyLimit
                                    );

                                    if (res.body.nextTo) {
                                        nextTo = res.body.nextTo;
                                    } else {
                                        nextTo = null;
                                    }

                                    let getFiveTrxResp = trxsResp.splice(0, 5);

                                    for (
                                        let i = res.body.entries.length - 1;
                                        i >= 0;
                                        i--
                                    ) {
                                        let trx = res.body.entries[i];
                                        let trxRes = getFiveTrxResp[i];

                                        expect(trx).to.be.an("object");
                                        expect(trx).to.have.ownProperty(
                                            "counterparty"
                                        );
                                        expect(trx).to.have.ownProperty(
                                            "trxId"
                                        );

                                        expect(trx.trxId).to.equal(trxRes.id);

                                        expect(trx.counterparty).to.equal(
                                            account2.iovSideChainId
                                        );

                                        expect(trx).to.have.ownProperty(
                                            "operation"
                                        );
                                        expect(trx).to.have.ownProperty(
                                            "currentChange"
                                        );
                                        expect(trx.currentChange).to.equal(
                                            trxRes.body.currentChange
                                        );
                                        expect(trx).to.have.ownProperty(
                                            "availableChange"
                                        );
                                        expect(trx.availableChange).to.equal(
                                            trxRes.body.availableChange
                                        );
                                        expect(trx).to.have.ownProperty(
                                            "spendingLimitChange"
                                        );
                                        expect(trx).to.have.ownProperty(
                                            "processedAt"
                                        );
                                        expect(trx.counterparty).to.equal(
                                            account2.iovSideChainId
                                        );
                                        expect(trx.operation).to.equal("Debit");
                                    }

                                    nextHistoryPage();
                                }
                            }
                        );
                    },
                    done
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
