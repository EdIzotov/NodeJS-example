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
    let keyId = process.env["200_keyId8"];
    let account = JSON.parse(process.env["200_account8"]);

    let allowedAssetSubTypes = [0, 1, 2, 3, 4, 5, 6];
    let assetType = 2;
    let accounts = [];

    async.waterfall(
        [
            done => {
                logger.info(
                    `Request: create accounts with assetSubTypes ${JSON.stringify(
                        allowedAssetSubTypes
                    )}`
                );

                const identity = account.identity;

                async.eachLimit(
                    allowedAssetSubTypes,
                    1,
                    (assetSubType, next) => {
                        cbsApi["Account"].createNew(
                            {
                                identityId: identity.id,
                                currentBalance: 1000,
                                availableBalance: 1000,
                                spendingLimit: 0,
                                assetType: assetType,
                                assetSubType: assetSubType
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
                logger.info(
                    `Request: transaction from accounts with different assetSubTypes`
                );

                async.eachLimit(accounts, 1, (account, next) => {
                    const idx = accounts.indexOf(account);
                    const lastEl = accounts.length - 1;

                    if (lastEl === idx) {
                        return next();
                    }

                    const nextAccount = accounts[idx + 1];

                    let data = SAP_DATA[TYPES.TRX]({
                        yourIdentityIOVAddress:
                            account.identity.iovMasterChainId,
                        privKey: privKey,
                        yourWalletAccountNumber: account.iovSideChainId,
                        counterpartyAccountNumber: nextAccount.iovSideChainId,
                        amount: 10,
                        valuationTime: Date.now(),
                        keyId: keyId
                    });

                    new sapTransport(url).send(
                        JSON.stringify(data),
                        (err, res) => {
                            if (err) {
                                done(err);
                            } else {
                                if (res && !res.errorCode) {
                                    logger.error(res);
                                }

                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("errorCode");
                                expect(res.error).to.be.an("object");
                                expect(res).to.not.have.ownProperty("body");
                                expect(res).to.have.ownProperty("errorCode");
                                expect(res.errorCode).to.equal(115);

                                done();
                            }
                        }
                    );
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
