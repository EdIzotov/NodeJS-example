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
    let amount1 = parseFloat(process.env["600_amount_non_ahg10"]);
    let amount2 = parseFloat(process.env["600_amount_non_ahg11"]);
    let keyId = process.env["600_keyId10"];
    let trxAmount = parseFloat(process.env["600_trxAmount"]);
    let account1 = JSON.parse(process.env["600_non_ahg_account10"]);
    let account2 = JSON.parse(process.env["600_non_ahg_account11"]);

    async.waterfall(
        [
            done => {
                let data = {
                    amount: trxAmount,
                    description: "test descr",
                    iovTransactionId: uuidV1()
                };

                logger.info(
                    `Request: old-world transation, must be unsuccessful. ${JSON.stringify(
                        data
                    )}`
                );

                cbsApi["oldWorld"].transferAmount(
                    account1,
                    account2,
                    data,
                    function(err, res) {
                        if (res) {
                            logger.error(res);
                        }
                        expect(res).to.be.undefined;
                        expect(err).to.be.a("string");
                        done();
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
