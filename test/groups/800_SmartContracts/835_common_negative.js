require("node-env-file")(__dirname + "/../../../.env");

// switch off check ssl certificate
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const uuidV1 = require('uuid/v1');
const async = require("async");
const crypto = require("crypto");
const URL = require("url");
const testsConfig = require(__dirname + "/../../../config/tests.json");
const sapTransport = require(__dirname + "/../../../api/transport");
const sapConfig = require(__dirname + "/../../../config/sap.json")[
    process.env.NODE_ENV
];
const ahgConfig = require(__dirname + "/../../../config/ahg.json")[
    process.env.NODE_ENV
];
const portalConfig = require(__dirname + "/../../../config/portal.json")[
    process.env.NODE_ENV
];
const scConfig = require(__dirname + "/../../../config/smart_contract.json")[
    process.env.NODE_ENV
];
const regionConfig = require(__dirname + "/../../../config/region.json")[
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
var adminPortalUrl = "";
var regionId = null;
var scUrl = "";
if (fs.existsSync(__dirname + "/../../../iov_env.conf")) {
    require("node-env-file")(__dirname + "/../../../iov_env.conf");
    url = "http://" + process.env.sap_host + sapConfig.SAP.path;
    cbsApi.setCbsUrl("http://" + process.env.cbs_host);
    adminPortalUrl = "http://" + process.env.admin_portal_host;
    regionId =
        process.env.region_id >= 0 ? parseInt(process.env.region_id) : null;
    scUrl = "http://" + process.env.sc_host;
} else {
    url =
        sapConfig.SAP.protocol +
        "://" +
        sapConfig.SAP.host +
        ":" +
        sapConfig.SAP.port +
        sapConfig.SAP.path;
    adminPortalUrl = portalConfig.url;
    regionId = regionConfig.region_id;
    scUrl = scConfig.url;
}

const hashFiles = require("hash-files");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const TYPES = require(__dirname + "/../../../api/operationTypes");
const storage = require(__dirname + "/../../data/storage");
const privKey = fs.readFileSync(__dirname + "/../../data/private.key");

const supertest = require("supertest");
const request = supertest.agent(scUrl);

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

var contractTemplateAddress =
    "CgQIAxAAEiRmZmZmZmZmZi1jMGE4LTEwMmMtMDAwMC0wMTYzNjg1ZjY5NzYYASAA";
var contractName = "Test";
var contractAddress = "";
var nonJarfileHash = "";
var nonJarFile = __dirname + "/../../data/public.key";
var fileHash = "";

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);

        before(function(resolve) {
            const options = {
                algorithm: "sha256",
                files: [
                    __dirname +
                        "/../../data/sc-examples-contracts_2.12-0.2.3-develop.0.jar"
                ]
            };
            hashFiles(options, function(err, hash) {
                if (err) {
                    logger.error("Can`t get hash from file !!!");
                }
                fileHash = hash;
                resolve();
            });
        });

        it("Request: upload contract template(Incorrect identity format <IOVAddress>)", function(resolve) {
            const req = scConfig.api.uploadTemplate;
            const keyId = process.env["800_keyId1"];
            const account = JSON.parse(process.env["800_account1"]);
            const signature = signatureRsa(
                account.identity.iovMasterChainId,
                privKey
            );

            request[req.method](req.path)
                .field("identity", "Incorrect identity")
                .field("keyId", keyId)
                .field("signature", signature)
                .field("version", "1.00")
                .field("fileHash", fileHash)
                .field("requestId", uuidV1())
                .attach(
                    "file",
                    __dirname +
                        "/../../data/sc-examples-contracts_2.12-0.2.3-develop.0.jar"
                )
                .end(function(err, res) {
                    if (err || !res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("reason");
                    expect(res.reason).to.be.an("object");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason).to.have.ownProperty("type");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason.errorCode).to.equal(322);
                    resolve();
                });
        });

        it("Request: upload contract template(Identity <IOVAddress> not found)", function(resolve) {
            const req = scConfig.api.uploadTemplate;
            const keyId = process.env["800_keyId1"];
            const nonExistingIdentity =
                "CgQIAxAAEixCdXhpREZiMHpocmRqa2tDTklSTmsyUlFKakliYkRKUkRKVW5uOVBZWEVvPRgBIAE=";
            const signature = signatureRsa(nonExistingIdentity, privKey);

            request[req.method](req.path)
                .field("identity", nonExistingIdentity)
                .field("keyId", keyId)
                .field("signature", signature)
                .field("version", "1.00")
                .field("fileHash", fileHash)
                .field("requestId", uuidV1())
                .attach(
                    "file",
                    __dirname +
                        "/../../data/sc-examples-contracts_2.12-0.2.3-develop.0.jar"
                )
                .end(function(err, res) {
                    if (err || !res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("reason");
                    expect(res.reason).to.be.an("object");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason).to.have.ownProperty("type");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason.errorCode).to.equal(5);
                    resolve();
                });
        });

        it("Request: upload contract template(Signature <SIGNATURE> is not correct)", function(resolve) {
            const req = scConfig.api.uploadTemplate;
            const keyId1 = process.env["800_keyId7"];
            const account1 = JSON.parse(process.env["800_account7"]);
            const keyId2 = process.env["800_keyId8"];
            const account2 = JSON.parse(process.env["800_account8"]);
            const signature = signatureRsa(
                account1.identity.iovMasterChainId,
                privKey
            );

            request[req.method](req.path)
                .field("identity", account2.identity.iovMasterChainId)
                .field("keyId", keyId2)
                .field("signature", signature)
                .field("version", "1.00")
                .field("fileHash", fileHash)
                .field("requestId", uuidV1())
                .attach(
                    "file",
                    __dirname +
                        "/../../data/sc-examples-contracts_2.12-0.2.3-develop.0.jar"
                )
                .end(function(err, res) {
                    if (err || !res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("reason");
                    expect(res.reason).to.be.an("object");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason).to.have.ownProperty("type");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason.errorCode).to.equal(8);
                    resolve();
                });
        });

        it("Request: upload contract template(Public key with key id <KEYID> is not found)", function(resolve) {
            const req = scConfig.api.uploadTemplate;
            const keyId1 = process.env["800_keyId7"];
            const account1 = JSON.parse(process.env["800_account7"]);
            const keyId2 = process.env["800_keyId8"];
            const account2 = JSON.parse(process.env["800_account8"]);
            const signature = signatureRsa(
                account1.identity.iovMasterChainId,
                privKey
            );

            request[req.method](req.path)
                .field("identity", account1.identity.iovMasterChainId)
                .field("keyId", "FAKE-KEYID")
                .field("signature", signature)
                .field("version", "1.00")
                .field("requestId", uuidV1())
                .field("fileHash", fileHash)
                .attach(
                    "file",
                    __dirname +
                        "/../../data/sc-examples-contracts_2.12-0.2.3-develop.0.jar"
                )
                .end(function(err, res) {
                    if (err || !res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("reason");
                    expect(res.reason).to.be.an("object");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason).to.have.ownProperty("type");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason.errorCode).to.equal(7);
                    resolve();
                });
        });
    });
});

function signatureRsa(data, privateKey) {
    var signRsaSha256 = crypto.createSign("RSA-SHA256");
    signRsaSha256.write(data);
    signRsaSha256.end();

    return signRsaSha256.sign(privateKey, "base64"); // 'latin1', 'hex' or 'base64'
}
