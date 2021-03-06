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
const privKey2 = fs.readFileSync(__dirname + "/../../data/private2.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";
const uuidV1 = require("uuid/v1");

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);
        it("operations should not be successful", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let keyId = process.env["200_keyId1"];
    let trxAmount = 1;
    let account1 = JSON.parse(process.env["200_account1"]);
    let account2 = JSON.parse(process.env["200_account2"]);

    async.waterfall(
        [
            done => {
                logger.info("Request: transaction with old uuid timestamp");

                let uuid = "f64f2940-fae4-11e7-8c5f-ef356f279131";

                let data = SAP_DATA[TYPES.TRX]({
                    id: uuid,
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    counterpartyAccountNumber: account2.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && !res.errorCode) {
                            logger.error(res);
                        }

                        expect(res).to.be.an("object");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(304);

                        done();
                    }
                });
            },
            done => {
                logger.info("Request: balance with old uuid timestamp");

                let uuid = "f64f2940-fae4-11e7-8c5f-ef356f279131";

                let data = SAP_DATA[TYPES.BALANCE]({
                    id: uuid,
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
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
                        expect(res.errorCode).to.equal(304);

                        done();
                    }
                });
            },
            done => {
                logger.info("Request: history with old uuid timestamp");

                let uuid = "f64f2940-fae4-11e7-8c5f-ef356f279131";

                let data = SAP_DATA[TYPES.HISTORY]({
                    id: uuid,
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
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
                        expect(res.errorCode).to.equal(304);

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
