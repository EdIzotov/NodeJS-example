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

var contractName = "Test";
var contractAddress = "";
var nonJarfileHash = "";
var nonJarFile = __dirname + "/../../data/public.key";

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);

        it("Request: send event (Contract not found, address: <IOV_ADDRESS>)", function(resolve) {
            const keyId1 = process.env["800_keyId7"];
            const account1 = JSON.parse(process.env["800_account7"]);
            const keyId2 = process.env["800_keyId8"];
            const account2 = JSON.parse(process.env["800_account8"]);
            const signature = signatureRsa(
                account1.identity.iovMasterChainId,
                privKey
            );

            const req = scConfig.api.sendTransaction;
            const data = {
                auth: {
                    identity: account1.identity.iovMasterChainId,
                    signature: signature,
                    keyId: keyId1
                },
                contractAddress:
                    "CgQIAxAAEiRmZmZmZmZmZi1jMGE4LTEwMmMtMDAwMC0wMTYzNjg1ZjZhOWMYASAB",
                // version: "1.00", // optional
                inputData: `{"to": "CgQIAxAAEixhSUFlc2FackR2OVZBOW1sS1p2MVYxbmVBRDJOdjI0bEVUcXBSSng0YkdNPRgBIAE=", "amount": 10}`,
                requestId: uuidV1()
            };

            request[req.method](req.path)
                .send(data)
                .end(function(err, res) {
                    if (err || !res.error) {
                        logger.error(err ? err : res.text);
                    }

                    logger.info(res.text);

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("reason");
                    expect(res.reason).to.be.an("object");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason).to.have.ownProperty("type");
                    expect(res.reason).to.have.ownProperty("errorCode");
                    expect(res.reason.errorCode).to.equal(314);

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
