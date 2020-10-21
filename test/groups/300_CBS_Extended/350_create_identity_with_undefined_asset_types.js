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
const privKeyWrong = fs.readFileSync(__dirname + "/../../data/private2.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";
const pubKeyWrong =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALDFdVlq9s7Tq6LDm5FwgW2fzHMtPz/ILLnNIouqAunqyTlJgLy6PRjExm2p78zmsJysrkXSC4zO8i60NhSlHNcCAwEAAQ==";

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
    let account = JSON.parse(process.env["300_account6"]);
    let bank = JSON.parse(process.env["300_bank"]);

    async.waterfall(
        [
            done => {
                const undefinedAssetTypes = [7, 8, -1];
                const identity = account.identity;

                logger.info(
                    `Request: create accounts with undefined assetTypes ${undefinedAssetTypes}`
                );

                async.eachLimit(
                    undefinedAssetTypes,
                    1,
                    (assetType, next) => {
                        let identity = {
                            bankId: bank.id,
                            firstName: "TestFirstName_" + Date.now(),
                            lastName: "TestLastName_" + Date.now(),
                            phoneNumber: "0991910757",
                            passportNumber: "AA010101",
                            dateOfBirth: "2017-04-13T12:57:36.232Z",
                            nationality: "UA",
                            assetType: assetType,
                            assetSubType: 1
                        };

                        cbsApi["Identity"].createNewPrivateIdentity(
                            identity,
                            (err, res) => {
                                if (res) {
                                    logger.error(
                                        `*** Success, but we expected a failure *** \n ${JSON.stringify(
                                            res
                                        )}`
                                    );
                                    expect(res.header).to.have.ownProperty(
                                        "response_code"
                                    );
                                    expect(
                                        res.header.response_code
                                    ).to.not.equal(0);
                                    return next();
                                }

                                try {
                                    res = JSON.parse(err);
                                } catch (e) {
                                    return done("Cant parse CBS response");
                                }
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("header");
                                expect(res.header).to.be.an("object");
                                expect(res.header).to.have.ownProperty(
                                    "response_code"
                                );
                                expect(res.header.response_code).to.not.equal(
                                    0
                                );
                                expect(res.header).to.have.ownProperty(
                                    "error_message"
                                );
                                next();
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
                process.exit(1);
            } else {
                resolve();
            }
        }
    );
}
