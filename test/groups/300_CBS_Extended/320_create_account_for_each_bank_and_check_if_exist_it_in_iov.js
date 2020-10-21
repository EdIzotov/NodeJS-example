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
const storage = require(__dirname + "/../../data/storage");

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(150000);
        it("should send without error", function(resolve) {
            return this.skip();
            requests(resolve);
        });
    });
});

function requests(resolve) {
    logger.info("Test for verify working state of all banks in current CBS.");

    async.waterfall(
        [
            done => {
                logger.info("Get list of banks from CBS " + cbsApi.getCbsUrl());

                cbsApi["Bank"].reads(function(err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.be.instanceof(Array);
                        expect(res.body.length).to.be.above(0);
                        done(null, res.body);
                    }
                });
            },
            (banks, done) => {
                if (banks.length < 2) {
                    // skip this test if banks count < 2
                    logger.info("Skip this test if banks array length < 2");
                    return done("skip");
                }

                let identities = [];

                logger.info("Create identities in each bank.");

                async.eachLimit(
                    banks,
                    1,
                    (bank, next) => {
                        logger.info(
                            `Current bankId: ${bank.id}, bankName: ${
                                bank.name
                            },`
                        );

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
                                    storage.add("IDENTITIES", res.body);
                                    next();
                                }
                            }
                        );
                    },
                    err => {
                        done(err, identities);
                    }
                );
            },
            (identities, done) => {
                if (!identities.length) {
                    return done("identities is undefined.");
                }

                let accounts = [];

                logger.info("Create account for each identity.");

                async.eachLimit(
                    identities,
                    1,
                    (identity, next) => {
                        cbsApi["Account"].createNew(
                            {
                                identityId: identity.id,
                                currency: "EUR",
                                currentBalance: 100,
                                availableBalance: 100,
                                spendingLimit: 0
                            },
                            function(err, res) {
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
                    err => {
                        done(err, accounts);
                    }
                );
            },
            (accounts, done) => {
                if (!accounts.length) {
                    return done("accounts is undefined.");
                }

                logger.info(
                    "Check existing in IOV for all created identities."
                );

                async.eachLimit(
                    accounts,
                    1,
                    (account, next) => {
                        cbsApi["Identity"].readIOV(
                            { id: account.identity.id },
                            function(err, res) {
                                if (err) {
                                    next(err);
                                } else {
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.be.instanceof(Array);
                                    expect(res.body.length).to.eql(1);
                                    expect(res.body[0]).to.have.ownProperty(
                                        "iovSideChainId"
                                    );
                                    expect(res.body[0].iovSideChainId).to.eql(
                                        account.iovSideChainId
                                    );

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
            if (err && err !== "skip") {
                // skip this test if banks count < 2
                logger.error("REQUEST ERROR: ", err);
                process.exit(0);
            } else {
                resolve();
            }
        }
    );
}
