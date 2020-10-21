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
const storage = require(__dirname + "/../../data/storage");
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
        it("operations should be successful", function(resolve) {
            requests(resolve);
        });
    });
});

function requests(resolve) {
    logger.info("SAP API URL: " + url);
    logger.info("CBS API URL: " + cbsApi.getCbsUrl());

    let identities = [];
    let accounts = [];
    let secretKeys = [];
    let balanceAccount = 1000;
    let keyId = "1";
    const client = JSON.parse(process.env["Client"]);

    async.waterfall(
        [
            done => {
                logger.info("Request: create new bank");

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

                        storage.add("BANKS", res.body);

                        done(null, res.body);
                    }
                });
            },
            (bank, done) => {
                logger.info("Request: create identities");

                async.timesLimit(
                    4,
                    1,
                    (n, next) => {
                        cbsApi["Identity"].createNewPrivateIdentity(
                            {
                                bankId: bank.id,
                                firstName: "TestFirstName_" + Date.now(),
                                lastName: "TestLastName_" + Date.now(),
                                phoneNumber: "0991910757",
                                passportNumber: "AA010101",
                                dateOfBirth: "2017-04-13T12:57:36.232Z",
                                nationality: "UA"
                            },
                            (err, res) => {
                                if (err) {
                                    next(err);
                                } else {
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.be.an("object");
                                    expect(res.body).to.have.ownProperty("id");
                                    expect(res.body.id).to.be.above(0);

                                    identities.push(res.body);
                                    next();
                                }
                            }
                        );
                    },
                    err => {
                        done(err);
                    }
                );
            },
            done => {
                logger.info(
                    "Request: create account for identities. currentBalance=" +
                        balanceAccount
                );

                async.eachLimit(
                    identities,
                    1,
                    (identity, next) => {
                        cbsApi["Account"].createNew(
                            {
                                identityId: identity.id,
                                currency: "EUR",
                                currentBalance: balanceAccount,
                                availableBalance: balanceAccount,
                                spendingLimit: 0
                            },
                            (err, res) => {
                                if (err) {
                                    next(err);
                                } else {
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.have.ownProperty(
                                        "identity"
                                    );
                                    expect(res.body.identity).to.be.an(
                                        "object"
                                    );
                                    expect(
                                        res.body.identity
                                    ).to.have.ownProperty("id");
                                    expect(res.body.identity.id).to.be.above(0);

                                    accounts.push(res.body);
                                    next();
                                }
                            }
                        );
                    },
                    err => done(err)
                );
            },
            done => {
                logger.info("Request: get QR for identities");

                async.eachLimit(
                    identities,
                    1,
                    (identity, next) => {
                        cbsApi["Secrets"].сreateSecret(
                            {
                                identityId: identity.id
                            },
                            (err, res) => {
                                if (err) {
                                    next(err);
                                } else {
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.be.an("object");
                                    expect(res.body).to.have.ownProperty(
                                        "secretKey"
                                    );

                                    secretKeys.push(res.body);
                                    next();
                                }
                            }
                        );
                    },
                    err => {
                        done(err);
                    }
                );
            }
        ],
        err => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(0);
            } else {
                process.env["100_trxAmount"] = 10; // amount for all transactions in group

                accounts.forEach((account, n) => {
                    process.env["100_account" + (n + 1)] = JSON.stringify(
                        account
                    );

                    process.env["100_secretKey" + (n + 1)] =
                        secretKeys[n].secretKey;
                    process.env["100_amount" + (n + 1)] = balanceAccount;
                    process.env["100_keyId" + (n + 1)] = secretKeys[n].keyId;
                });

                resolve();
            }
        }
    );
}
