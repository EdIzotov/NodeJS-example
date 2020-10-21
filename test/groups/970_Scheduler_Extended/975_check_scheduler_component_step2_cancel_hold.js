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
        this.timeout(60 * 1000 * 7);
        it("should send without error", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    logger.info(
        "Test scheduler component. Scheduler must cancels for expired transaction."
    );

    let schedulerTest = JSON.parse(process.env["970_schedulerTest"]);

    async.waterfall(
        [
            done => {
                let delta = Date.now() - (schedulerTest.startTime + 330 * 1000);

                if (delta >= 0) {
                    done();
                } else {
                    logger.info(`Wait ${delta * -1} msec`);
                    setTimeout(() => {
                        done();
                    }, delta * -1);
                }
            },
            done => {
                logger.info(
                    `Get (SAP)balance and check available balance increased.`
                );

                let account = schedulerTest.account;
                let keyId = schedulerTest.keyId;

                let data = SAP_DATA[TYPES.BALANCE]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
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
                        expect(res.body.current).to.equal(
                            schedulerTest.balance
                        );
                        expect(res.body.available).to.equal(
                            schedulerTest.balance
                        );

                        done();
                    }
                });
            },
            done => {
                logger.info(
                    `Get (CBS)balance and check available balance increased.`
                );

                if (fs.existsSync(__dirname + "/../../../iov_env.conf")) {
                    cbsApi.setCbsUrl("http://" + process.env.cbs_host);
                } else {
                    cbsApi.setCbsUrl(
                        cbsConfig.CBS.url[0] +
                            ":" +
                            cbsConfig.CBS.port +
                            cbsConfig.CBS.swagger
                    );
                }

                let account = schedulerTest.account;

                cbsApi["Account"].read({ id: account.id }, function(err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("currentBalance");
                        expect(res.body.currentBalance).to.equal(
                            schedulerTest.balance
                        );
                        done();
                    }
                });
            },
            done => {
                logger.info(
                    `Get history. Check hold/holdCancel preauth events`
                );

                let account = schedulerTest.account;
                let keyId = schedulerTest.keyId;

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
                    from: Date.now() - 60 * 60 * 24 * 1000, //time.start,
                    to: Date.now(), // time.end
                    keyId: keyId,
                    limit: 10
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
                        expect(res.body.entries).to.have.length.above(1);

                        logger.info(`Expect the following order 
                            - HoldCancel
                            - Hold
                            - HoldComplete
                            - Hold                            
                            ${JSON.stringify(res.body.entries, 0, 2)}
                        `);

                        let holdCancel = res.body.entries[0];
                        let hold2 = res.body.entries[1];
                        let holdComplete = res.body.entries[2];
                        let hold1 = res.body.entries[3];

                        expect(holdCancel).to.be.an("object");
                        expect(holdCancel.operation).to.equal("HoldCancel");
                        expect(holdCancel.availableChange).to.equal(
                            schedulerTest.holdAmount
                        );
                        expect(holdCancel.currentChange).to.equal(0);

                        expect(hold2).to.be.an("object");
                        expect(hold2.operation).to.equal("Hold");
                        expect(hold2.availableChange).to.equal(
                            schedulerTest.holdAmount * -1
                        );
                        expect(hold2.currentChange).to.equal(0);

                        expect(hold1).to.be.an("object");
                        expect(hold1.operation).to.equal("Hold");
                        expect(hold1.availableChange).to.equal(
                            schedulerTest.holdAmount * -1
                        );
                        expect(hold1.currentChange).to.equal(0);

                        expect(holdComplete).to.be.an("object");
                        expect(holdComplete.operation).to.equal("HoldComplete");
                        expect(holdComplete.availableChange).to.equal(
                            schedulerTest.holdAmount * -1
                        );
                        expect(holdComplete.currentChange).to.equal(
                            schedulerTest.holdAmount * -1
                        );

                        done();
                    }
                });
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
