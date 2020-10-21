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
            setTimeout(
                requests.bind(this, resolve),
                testsConfig.beforeTestTimeout
            );
        });
    });
});

function requests(resolve) {
    async.waterfall(
        [
            done => {
                let account1 = JSON.parse(process.env["100_account1"]);
                let account2 = JSON.parse(process.env["100_account2"]);
                let keyId = process.env["100_keyId1"];
                let amount1 = parseFloat(process.env["100_amount1"]);
                let amount2 = parseFloat(process.env["100_amount2"]);
                let trxAmount = parseFloat(process.env["100_trxAmount"]);
                let trx_id = process.env["100_trx_id"];

                logger.info("Request: SAP history identity1/account");

                let data = SAP_DATA[TYPES.HISTORY]({
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
                        expect(res.body.entries).to.have.length.above(0);

                        var trx;
                        for (let i = 0; i < res.body.entries.length; i++) {
                            if (res.body.entries[i].trxId === trx_id) {
                                trx = res.body.entries[i];
                                break;
                            }
                        }

                        expect(trx).to.be.an("object");
                        expect(trx).to.have.ownProperty("counterparty");
                        expect(trx).to.have.ownProperty("operation");
                        expect(trx).to.have.ownProperty("currentChange");
                        expect(trx).to.have.ownProperty("availableChange");
                        expect(trx).to.have.ownProperty("spendingLimitChange");
                        expect(trx).to.have.ownProperty("processedAt");
                        expect(trx.counterparty).to.equal(
                            account2.iovSideChainId
                        );
                        expect(trx.operation).to.equal("Debit");

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
