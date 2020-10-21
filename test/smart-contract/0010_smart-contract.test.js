//require("node-env-file")(__dirname + "/../.env");
const fs = require("fs");
const supertest = require("supertest");
const expect = require("chai").expect;
const TIMEOUT = 50000;
const uuidV1 = require("uuid/v1");
const async = require("async");
const cbsApi = require(__dirname + "/../../cbs");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const sapTransport = require(__dirname + "/../../api/transport");
const SAP_DATA = require(__dirname + "/../../api/operations");
const TYPES = require(__dirname + "/../../api/operationTypes");
const privKey = fs.readFileSync(__dirname + "/../data/private.key");
const privKey2 = fs.readFileSync(__dirname + "/../data/private2.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";
const sapConfig = require(__dirname + "/../../config/sap.json")[
    process.env.NODE_ENV
];
const smartContractConfig = require(__dirname +
    "/../../config/smart_contract.json")[process.env.NODE_ENV];

var sapUrl = "";
var oracleGwUrl = "";

if (fs.existsSync(__dirname + "/../../iov_env.conf")) {
    require("node-env-file")(__dirname + "/../../iov_env.conf");
    sapUrl = "http://" + process.env.sap_host + sapConfig.SAP.path;
    oracleGatewayUrl = process.env.oracle_gw;
    cbsApi.setCbsUrl("http://" + process.env.cbs_host);
} else {
    sapUrl =
        sapConfig.SAP.protocol +
        "://" +
        sapConfig.SAP.host +
        ":" +
        sapConfig.SAP.port +
        sapConfig.SAP.path;

    oracleGatewayUrl = smartContractConfig.oracleGateway.url;
}

const request = supertest.agent(oracleGatewayUrl);

describe("Smart contract test", function() {
    this.timeout(TIMEOUT);

    let templateId = null;
    let contractId = null;
    let identities = [];
    let accounts = [];
    let secretKeys = [];
    let balanceAccount = 100;
    let keyId = "1";

    it("Create required entities", function(resolve) {
        async.waterfall(
            [
                done => {
                    logger.info("Get bank from CBS ");

                    cbsApi["Bank"].reads(function(err, res) {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.instanceof(Array);
                            expect(res.body.length).to.be.above(0);
                            done(null, res.body[0]);
                        }
                    });
                },
                (bank, done) => {
                    logger.info("Create identities. ");
                    async.timesLimit(
                        2,
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
                                        expect(res.body).to.have.ownProperty(
                                            "id"
                                        );
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
                        "Create account for identities. currentBalance=" +
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
                                        expect(
                                            res.body.identity.id
                                        ).to.be.above(0);

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
                    resolve();
                }
            }
        );
    });

    it("Get templateID", function(resolve) {
        let json = {
            auth: {
                serviceProviderId: "75ed99a3-f9d5-451d-8ee4-9635a4f39eb8",
                key: "superflybambuk"
            },
            contractType: "simple",
            iovAddress: identities[0].iovMasterChainId,
            version: "1.00a"
        };

        request
            .post("/ogw/upload")
            .set("Content-Type", "multipart/form-data")
            .field("json", JSON.stringify(json))
            .attach("file", __dirname + "/data/sc-examples-handler_7.jar")
            //.expect("Content-type", /json/)
            .expect(200) // This is HTTP response
            .end((err, res) => {
                if (err) {
                    logger.error("Request error: ", err);
                }

                try {
                    res = JSON.parse(res.text);
                } catch (e) {
                    logger.error("Cant parse response");
                }

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("templateId");
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.be.a("string");
                expect(res.templateId).to.be.a("string");
                expect(res.templateId.length).to.equal(36);
                expect(res.type).to.equal("TemplateUploaded");

                templateId = res.templateId;
                resolve();
            });
    });

    it("Create contract", function(resolve) {
        request
            .post("/ogw/create-contract")
            .set("Content-Type", "application/json")
            .send({
                initialData: {
                    developer: accounts[0].iovSideChainId, // identities[0].iovMasterChainId,
                    customer: accounts[1].iovSideChainId
                },
                auth: {
                    serviceProviderId: "75ed99a3-f9d5-451d-8ee4-9635a4f39eb8",
                    key: "superflybambuk"
                },
                templateId: templateId,
                when: "2017-10-25T14:55:48.876+03:00"
            })
            //.expect("Content-type", /json/)
            .expect(200) // THis is HTTP response
            .end((err, res) => {
                if (err) {
                    logger.error("Request error: ", err);
                }

                try {
                    res = JSON.parse(res.text);
                } catch (e) {
                    logger.error("Cant parse response");
                }

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("contractId");
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.be.a("string");
                expect(res.contractId).to.be.a("string");
                expect(res.contractId.length).to.equal(36);
                expect(res.type).to.equal("ContractCreated");

                contractId = res.contractId;

                resolve();
            });
    });

    it("Perform transaction more than contract. Expect fail.", function(
        resolve
    ) {
        let data = SAP_DATA[TYPES.TRX]({
            yourIdentityIOVAddress: accounts[0].identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: accounts[0].iovSideChainId,
            counterpartyAccountNumber: accounts[1].iovSideChainId,
            amount: 50,
            valuationTime: Date.now(),
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res && !res.error) {
                logger.error(res);
            }
            expect(res).to.be.an("object");
            expect(res).to.not.have.ownProperty("body");
            expect(res).to.have.ownProperty("id");
            expect(res.id).to.equal(data.id);
            expect(res).to.have.ownProperty("error");
            expect(res.error).to.be.an("object");
            expect(res.error).to.have.ownProperty("message");
            expect(res).to.have.ownProperty("errorCode");
            expect(res.errorCode).to.equal(111);
            expect(res.error.message).to.match(new RegExp(contractId));

            resolve();
        });
    });

    it("Perform transaction less than contract. Expect success.", function(
        resolve
    ) {
        let data = SAP_DATA[TYPES.TRX]({
            yourIdentityIOVAddress: accounts[0].identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: accounts[0].iovSideChainId,
            counterpartyAccountNumber: accounts[1].iovSideChainId,
            amount: 5,
            valuationTime: Date.now(),
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res && res.error) {
                logger.error(res);
            }
            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("id");
            expect(res.id).to.equal(data.id);
            expect(res).to.have.ownProperty("type");
            expect(res.type).to.equal(data.type);
            expect(res).to.not.have.ownProperty("error");
            expect(res).to.have.ownProperty("body");
            expect(res.body).to.have.ownProperty("currentChange");
            expect(res.body).to.have.ownProperty("availableChange");
            expect(res.body).to.have.ownProperty("currentBalance");
            expect(res.body).to.have.ownProperty("availableBalance");
            expect(res.body).to.have.ownProperty("processedAt");

            resolve();
        });
    });
});
