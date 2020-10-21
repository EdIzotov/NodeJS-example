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
    let newKeyId = "2";
    let keyId = process.env["200_keyId5"];
    let trxAmount = parseFloat(process.env["200_trxAmount"]);
    let account1 = JSON.parse(process.env["200_account5"]);
    let account2 = JSON.parse(process.env["200_account6"]);
    let secretKey1 = process.env["200_secretKey1"];

    logger.info("Info: attempt to register / replace public key");

    async.waterfall(
        [
            done => {
                logger.info(
                    "Request: try replace pubkey(already used keyId & old QR)"
                );

                let data = SAP_DATA[TYPES.PUBKEY]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKeyWrong,
                    pubKey: pubKeyWrong,
                    secret: secretKey1,
                    keyId: keyId
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && !res.errorCode) {
                            logger.error(res);
                        }
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(305);

                        done();
                    }
                });
            },
            done => {
                logger.info("Request: try add pubkey (new keyId & old QR)");

                let data = SAP_DATA[TYPES.PUBKEY]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKeyWrong,
                    pubKey: pubKeyWrong,
                    secret: secretKey1,
                    keyId: newKeyId
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        if (res && !res.errorCode) {
                            logger.error(res);
                        }
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(6);

                        done();
                    }
                });
            },
            done => {
                logger.info(" - get new QR");

                cbsApi["Secrets"].сreateSecret(
                    {
                        identityId: account1.identity.id
                    },
                    (err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");
                            expect(res.body).to.have.ownProperty("secretKey");

                            done(null, res.body.secretKey);
                        }
                    }
                );
            },
            (secretKey, done) => {
                logger.info(
                    "Request: try replace pubkey(already used keyId & NEW QR)"
                );

                let data = SAP_DATA[TYPES.PUBKEY]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKeyWrong,
                    pubKey: pubKeyWrong,
                    secret: secretKey,
                    keyId: keyId
                });

                new sapTransport(url).send(JSON.stringify(data), (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res).to.not.have.ownProperty("body");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(305);

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
