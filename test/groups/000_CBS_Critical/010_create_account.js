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
    async.waterfall(
        [
            done => {
                let identity = JSON.parse(process.env["identity1"]);
                process.env["amount1"] = 100;

                logger.info(
                    "Create account for identity1. Account balance = " +
                        process.env["amount1"] +
                        " EUR"
                );

                let account = {
                    identityId: identity.id,
                    currentBalance: parseFloat(process.env["amount1"]),
                    availableBalance: parseFloat(process.env["amount1"]),
                    spendingLimit: 0,
                    //linkExpectationBank: "string",
                    description: "SAP autotest account"
                };

                cbsApi["Account"].createNew(account, function(err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("identity");
                        expect(res.body.identity).to.be.an("object");
                        expect(res.body.identity).to.have.ownProperty("id");
                        expect(res.body.identity.id).to.be.above(0);
                        expect(res.body.isOnChainOnly).equal(false);
                        done(null, res.body);
                    }
                });
            }
        ],
        (err, result) => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(1);
            } else {
                process.env["account1"] = JSON.stringify(result);
                resolve();
            }
        }
    );
}
