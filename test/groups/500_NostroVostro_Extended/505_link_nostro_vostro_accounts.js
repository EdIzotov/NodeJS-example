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
            requests(resolve);
        });
    });
});

function requests(resolve) {
    let initBalanceNostroVostro = 1000;
    process.env["initBalanceNostroVostro"] = initBalanceNostroVostro;
    const client = JSON.parse(process.env["Client"]);

    async.waterfall(
        [
            done => {
                logger.info("Request: create new banks");

                let createBanks = 3;
                let banks = [];

                async.timesLimit(
                    createBanks,
                    1,
                    (n, next) => {
                        let data = {
                            name: "Bank4Test_" + Date.now(),
                            client: client
                        };

                        cbsApi["Bank"].сreateNew(data, (err, res) => {
                            if (err) {
                                next(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.an("object");
                                expect(res.body).to.have.ownProperty("id");
                                expect(res.body).to.have.ownProperty("name");
                                expect(res.body).to.have.ownProperty("country");

                                storage.add("BANKS", res.body);
                                banks.push(res.body);

                                next();
                            }
                        });
                    },
                    err => {
                        done(err, banks);
                    }
                );
            },
            (banks, done) => {
                // Get own bank identity

                logger.info("Request: CBS get bank own identities");

                async.eachLimit(
                    banks,
                    1,
                    (bank, nextBank) => {
                        process.env[
                            "bank" + (banks.indexOf(bank) + 1)
                        ] = JSON.stringify(bank);

                        cbsApi["Identity"].getBankIdentity(bank.id, function(
                            err,
                            res
                        ) {
                            if (err) {
                                nextBank(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.an("object");

                                let name =
                                    "bank" +
                                    (banks.indexOf(bank) + 1) +
                                    "OwnIdentity";

                                process.env[name] = JSON.stringify(res.body);
                                nextBank();
                            }
                        });
                    },
                    err => done(err)
                );
            },
            done => {
                // Create 2 accounts bank #1

                let bank1OwnIdentity = JSON.parse(
                    process.env["bank1OwnIdentity"]
                );
                let bank2OwnIdentity = JSON.parse(
                    process.env["bank2OwnIdentity"]
                );

                logger.info(
                    "Request: CBS create bank1Nostro in bank2 and bank2Vostro in bank1"
                );

                async.timesLimit(
                    2,
                    1,
                    function(n, nextAccount) {
                        let isFirst = function(n, first, second) {
                            if (n == 0) {
                                return first();
                            } else if (n == 1) {
                                return second();
                            }
                        };

                        let data = {
                            identityId: isFirst(
                                n,
                                function() {
                                    return bank1OwnIdentity.id;
                                },
                                function() {
                                    return bank2OwnIdentity.id;
                                }
                            ),
                            linkExpectationBank: isFirst(
                                n,
                                function() {
                                    return bank2OwnIdentity.bank.bankIdentity;
                                },
                                function() {
                                    return bank1OwnIdentity.bank.bankIdentity;
                                }
                            ),
                            currentBalance: initBalanceNostroVostro,
                            availableBalance: initBalanceNostroVostro,
                            spendingLimit: initBalanceNostroVostro,
                            description: "SAP autotest account"
                        };

                        logger.info("data", data);

                        cbsApi["Account"].createNew(data, function(err, res) {
                            if (err) {
                                nextAccount(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.have.ownProperty(
                                    "identity"
                                );
                                expect(res.body.identity).to.be.an("object");
                                expect(res.body.identity).to.have.ownProperty(
                                    "id"
                                );
                                expect(res.body.identity.id).to.be.above(0);

                                isFirst(
                                    n,
                                    function() {
                                        process.env[
                                            "bank2Vostro"
                                        ] = JSON.stringify(res.body);
                                    },
                                    function() {
                                        process.env[
                                            "bank1Nostro"
                                        ] = JSON.stringify(res.body);
                                    }
                                );

                                // if(n == 0) {
                                //     process.env['bank1Nostro'] = JSON.stringify(res.body);
                                // } else if(n == 1) {
                                //     process.env['bank1Vostro'] = JSON.stringify(res.body);
                                // }

                                nextAccount();
                            }
                        });
                    },
                    err => done(err)
                );
            },
            done => {
                // Create 2 accounts bank #2

                let bank1OwnIdentity = JSON.parse(
                    process.env["bank1OwnIdentity"]
                );
                let bank2OwnIdentity = JSON.parse(
                    process.env["bank2OwnIdentity"]
                );

                logger.info(
                    "Request: CBS create bank2Nostro in bank1 and bank1Vostro in bank2 accounts"
                );

                async.timesLimit(
                    2,
                    1,
                    function(n, nextAccount) {
                        let isFirst = function(n, first, second) {
                            if (n == 0) {
                                return first();
                            } else if (n == 1) {
                                return second();
                            }
                        };

                        cbsApi["Account"].createNew(
                            {
                                identityId: isFirst(
                                    n,
                                    function() {
                                        return bank2OwnIdentity.id;
                                    },
                                    function() {
                                        return bank1OwnIdentity.id;
                                    }
                                ),
                                linkExpectationBank: isFirst(
                                    n,
                                    function() {
                                        return bank1OwnIdentity.bank
                                            .bankIdentity;
                                    },
                                    function() {
                                        return bank2OwnIdentity.bank
                                            .bankIdentity;
                                    }
                                ),
                                currentBalance: initBalanceNostroVostro,
                                availableBalance: initBalanceNostroVostro,
                                spendingLimit: initBalanceNostroVostro,
                                description: "SAP autotest account"
                            },
                            function(err, res) {
                                if (err) {
                                    nextAccount(err);
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

                                    isFirst(
                                        n,
                                        function() {
                                            process.env[
                                                "bank1Vostro"
                                            ] = JSON.stringify(res.body);
                                        },
                                        function() {
                                            process.env[
                                                "bank2Nostro"
                                            ] = JSON.stringify(res.body);
                                        }
                                    );

                                    // if(n == 0) {
                                    //     process.env['bank2Nostro'] = JSON.stringify(res.body);
                                    // } else if(n == 1) {
                                    //     process.env['bank2Vostro'] = JSON.stringify(res.body);
                                    // }

                                    nextAccount();
                                }
                            }
                        );
                    },
                    err => done(err)
                );
            },
            done => {
                // link bank#1 Nostro Account to bank#2 Vostro Account
                let bank1Nostro = JSON.parse(process.env["bank1Nostro"]);
                let bank2Vostro = JSON.parse(process.env["bank2Vostro"]);
                let bank2OwnIdentity = JSON.parse(
                    process.env["bank2OwnIdentity"]
                );

                logger.info("Link bank1 nostro to bank2 vostro");

                cbsApi["Account"].linkAccount(
                    bank2Vostro,
                    bank1Nostro,
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("id");
                            expect(res.body.id).to.be.above(0);

                            done();
                        }
                    }
                );
            },
            done => {
                // link bank#2 Nostro Account to bank#1 Vostro Account
                let bank2Nostro = JSON.parse(process.env["bank2Nostro"]);
                let bank1Vostro = JSON.parse(process.env["bank1Vostro"]);
                let bank1OwnIdentity = JSON.parse(
                    process.env["bank1OwnIdentity"]
                );

                logger.info("Link bank2 nostro to bank1 vostro");

                cbsApi["Account"].linkAccount(
                    bank1Vostro,
                    bank2Nostro,
                    function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("id");
                            expect(res.body.id).to.be.above(0);

                            done();
                        }
                    }
                );
            }
        ],
        err => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(0);
            } else {
                resolve();
            }
        }
    );
}
