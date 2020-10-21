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
            /*             logger.info(
                "Skip test. This test will be used after fix bug XXX-1944."
            );
            return this.skip(); */

            requests(resolve);
        });
    });
});

function requests(resolve) {
    let keyId = process.env["200_keyId1"];
    let trxAmount = parseFloat(process.env["200_trxAmount"]);
    let account1 = JSON.parse(process.env["200_account1"]);
    let account2 = JSON.parse(process.env["200_account2"]);

    async.waterfall(
        [
            done => {
                let doRequests = 10;
                let success = 0;
                let fail = 0;
                let errorCode = 112;

                logger.info(
                    "Request: perform " +
                        doRequests +
                        " async requests via same connection with same trxId. Expect errorCode to equal " +
                        errorCode
                );

                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    counterpartyAccountNumber: account2.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId
                });

                let jsonData = JSON.stringify(data);

                let transport = new sapTransport(url);

                async.times(
                    doRequests,
                    (requestNumber, trxDone) => {
                        transport.send(
                            jsonData,
                            (err, res) => {
                                if (err) {
                                    trxDone(err);
                                } else {
                                    if (res.error) {
                                        expect(res).to.be.an("object");
                                        expect(res).to.have.ownProperty("id");
                                        expect(res.id).to.equal(data.id);
                                        expect(res).to.have.ownProperty(
                                            "error"
                                        );
                                        expect(res).to.not.have.ownProperty(
                                            "body"
                                        );
                                        expect(res).to.have.ownProperty(
                                            "errorCode"
                                        );
                                        expect(res.errorCode).to.equal(
                                            errorCode
                                        );

                                        fail++;
                                    } else {
                                        success++;
                                    }
                                    // skip all except last response
                                    if (fail + success === doRequests) {
                                        expect(success).to.equal(0);
                                        expect(fail).to.equal(doRequests);
                                    }
                                    trxDone();
                                }
                            },
                            requestNumber + 1 != doRequests
                        );
                    },
                    err => done(err)
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
