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
const uuidV1 = require("uuid/v1");

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
    let trxId = uuidV1();
    let keyId = process.env["300_keyId4"];
    let keyId2 = process.env["300_keyId5"];
    let trxAmount = parseFloat(process.env["300_trxAmount"]);
    let account1 = JSON.parse(process.env["300_account4"]);
    let account2 = JSON.parse(process.env["300_account5"]);
    let trxDescription =
        "OldWorld trx. Test unique trx_id. Timestamp: " + Date.now();

    logger.info(
        "Requests: CBS oldWord transaction with same iovTransactionId. The first request must be success, second must be fail because not unique iovTransactionId."
    );

    async.timesLimit(
        2,
        1,
        (n, nextTrx) => {
            let data = {
                amount: trxAmount,
                description: trxDescription,
                fromAccountIovTransactionId: trxId
            };

            cbsApi["oldWorld"].transferAmount(
                account1,
                account2,
                data,
                (err, res) => {
                    if (err && !n) {
                        // first request must be success
                        nextTrx(err);
                    } else {
                        if (n === 0) {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("array");
                            nextTrx();
                        } else {
                            // second request must be unsuccess
                            expect(res).to.be.undefined;
                            expect(err).to.be.an("string");
                            nextTrx();
                        }
                    }
                }
            );
        },
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
