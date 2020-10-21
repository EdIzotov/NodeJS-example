require("node-env-file")(__dirname + "/../../../.env");

// switch off check ssl certificate
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

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
    logger.info("SAP API URL: " + url);
    logger.info("CBS API URL: " + cbsApi.getCbsUrl());

    const client = JSON.parse(process.env["Client"]);

    async.waterfall(
        [
            done => {
                logger.info("Create new Bank.");

                let data = {
                    name: "Bank4Test_" + Date.now(),
                    client: client
                };

                cbsApi["Bank"].сreateNew(data, (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.ownProperty("id");
                        expect(res.body).to.have.ownProperty("name");
                        expect(res.body).to.have.ownProperty("country");
                        // expect(res.body).to.have.ownProperty("bic");

                        storage.add("BANKS", res.body);

                        done(null, res.body);
                    }
                });
            },
            (bank, done) => {
                logger.info("Create identity1");

                let identity = {
                    bankId: bank.id,
                    firstName: "TestFirstName_" + Date.now(),
                    lastName: "TestLastName_" + Date.now(),
                    phoneNumber: "0991910757",
                    passportNumber: "AA010101",
                    dateOfBirth: "2017-04-13T12:57:36.232Z",
                    nationality: "UA"
                };

                cbsApi["Identity"].createNewPrivateIdentity(
                    identity,
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("id");
                            expect(res.body.id).to.be.above(0);
                            done(null, res.body);
                        }
                    }
                );
            }
        ],
        (err, result) => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(1);
            } else {
                process.env["identity1"] = JSON.stringify(result);
                resolve();
            }
        }
    );
}
