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
    let amount = parseFloat(process.env["200_amount1"]);
    let keyId = process.env["200_keyId1"];
    let trxAmount = parseFloat(process.env["200_trxAmount"]);
    let account = JSON.parse(process.env["200_account1"]);

    async.waterfall(
        [
            done => {
                logger.info("Request: CBS blockAccount.");

                cbsApi["Account"].blockAccount(account, function(err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body.isBlocked).to.equal(true);

                        done(null);
                    }
                });
            },
            done => {
                logger.info(
                    "Request: SAP balance."
                );

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
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(1);                        

                        done();
                    }
                });
            },
            done => {
                logger.info(
                    "Request: SAP trx."
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
                    counterpartyAccountNumber: account.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(1);                         

                        setTimeout(() => {
                            done();
                        }, testsConfig.beforeTestTimeout);
                    }
                });
            },
            done => {
                logger.info(
                    "Request: SAP history."
                );

                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
                    from: new Date(
                        new Date().getTime() - 60 * 60 * 24 * 7 * 1000
                    ).getTime(), // last week
                    to: new Date(
                        new Date().getTime() + 60 * 60 * 24 * 1000
                    ).getTime(),
                    keyId: keyId
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(1);                         

                        done();
                    }
                });
            }
        ],
        (err, result) => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(1);
            } else {
                resolve();
            }
        }
    );
}
