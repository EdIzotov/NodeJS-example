require("node-env-file")(__dirname + "/../../.env");
process.chdir(__dirname);
const async = require("async");
const fs = require("fs");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const failoverConfig = require(__dirname + "/../../config/failover.json")[
    process.env.NODE_ENV
];
const sapTransport = require(__dirname + "/../../api/transport");
const cbsApi = require(__dirname + "/../../cbs");

const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const TYPES = require(__dirname + "/../../api/operationTypes");
const storage = require(__dirname + "/../data/storage");
const SAP_DATA = require(__dirname + "/../../api/operations");

const privKey = fs.readFileSync(__dirname + "/../data/private.key");
const privKey2 = fs.readFileSync(__dirname + "/../data/private2.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";
const uuidV1 = require("uuid/v1");

let testName = __filename
    .replace(/.*[\/|\\]+/gi, "")
    .replace(/.js$/i, "")
    .replace(/_/gi, " ")
    .toUpperCase();

describe(testName, function() {
    this.timeout(100000);
    it("operations should be successful", function(resolve) {
        requests(resolve);
    });
});

function requests(resolve) {
    let identities = [];
    let accounts = [];
    let secretKeys = [];
    let balanceAccount = 200;
    let keyId = "1";
    let bank = null;
    let sapUrl =
        failoverConfig.sap.api.proto +
        failoverConfig.sap.hosts[0] +
        ":" +
        failoverConfig.sap.api.port +
        failoverConfig.sap.api.path;
    let cbsUrl =
        failoverConfig.cbs.api.proto +
        failoverConfig.cbs.hosts[0] +
        ":" +
        failoverConfig.cbs.api.port;

    cbsApi.setCbsUrl(cbsUrl);

    async.waterfall(
        [
            done => {
                logger.info("Create new Bank.");

                let data = {
                    name: "Bank4Test_" + Date.now(),
                    isIovBank: false
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
                        expect(res.body).to.have.ownProperty("bic");
                        expect(res.body).to.have.ownProperty("sap");
                        expect(res.body).to.have.ownProperty("assetHost");
                        expect(res.body).to.have.ownProperty("blackBox");

                        bank = res.body;

                        storage.add("BANKS", bank);

                        done(null, bank);
                    }
                });
            },
            (bank, done) => {
                let createIdentities = 2;
                logger.info(`Create ${createIdentities} identities.`);

                async.timesLimit(
                    createIdentities,
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
                    "Create account for identities. Current balance=" +
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
                logger.info("Get QR for identities.");

                async.eachLimit(
                    identities,
                    1,
                    (identity, next) => {
                        cbsApi["Identity"].createAccountsQR(
                            identity,
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

                                    secretKeys.push(res.body.secretKey);
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
                logger.info("Add pubkey for identities.");

                async.timesLimit(
                    identities.length,
                    1,
                    (n, next) => {
                        let data = SAP_DATA[TYPES.PUBKEY]({
                            yourIdentityIOVAddress:
                                identities[n].iovMasterChainId,
                            privKey: privKey,
                            pubKey: pubKey,
                            secret: secretKeys[n],
                            keyId: keyId
                        });

                        new sapTransport(sapUrl).send(
                            JSON.stringify(data),
                            (err, res) => {
                                if (err) {
                                    next(err);
                                } else {
                                    if (res && res.error) {
                                        logger.error(res);
                                    }
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("id");
                                    expect(res.id).to.equal(data.id);
                                    expect(res).to.have.ownProperty("type");
                                    expect(res.type).to.equal(data.type);
                                    expect(res).to.not.have.ownProperty(
                                        "error"
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
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(1);
            } else {
                process.env["bank"] = JSON.stringify(bank);

                accounts.forEach((account, n) => {
                    process.env["account" + (n + 1)] = JSON.stringify(account);
                    process.env["secretKey" + (n + 1)] = secretKeys[n];
                    process.env["balanceAccount" + (n + 1)] = balanceAccount;
                });

                resolve();
            }
        }
    );
}
