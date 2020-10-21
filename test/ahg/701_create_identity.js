require("node-env-file")(__dirname + "/../../../.env");

// switch off check ssl certificate
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const uuidV1 = require("uuid/v1");
const async = require("async");
const testsConfig = require(__dirname + "/../../../config/tests.json");
const sapTransport = require(__dirname + "/../../../api/transport");
const sapConfig = require(__dirname + "/../../../config/sap.json")[
    process.env.NODE_ENV
];
const ahgConfig = require(__dirname + "/../../../config/ahg.json")[
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

const supertest = require("supertest");
const request = supertest.agent(ahgConfig.url);
const crypto = require("crypto");
const hash = crypto.createHash("sha256");
const hmac = crypto.createHmac("sha256", "ybhm2v6dP5GfwKgWebK1HQ==");
const privateKey = `-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAIRsZFfGgC8SBtE4
4raHA3NEKeL1MEoUywXmvHoa644ovgFuxI4n0WZSRej9dSuYfwc8zoOiYgcGkQ2o
V8bz8U7pXQ3+pHPpWdG2mpi4hp4gjeiaJXrUxiop2ldJiqZL3AucrTvkeWg4NVVx
wMzH8hkNry6FYS5QgUsYOYKYV6M7AgMBAAECgYBjwSdhu+WqD8FU8K5QY6qktS98
icmDtOAvpN5MeWUC5QwlFiU5FSO4GbgSSIRwf+MJN7Q2EygXNMomaK8e73rSH9LN
zZ3fV1YHMkihs6yiG94dsKs3/2cjpCVeLyxzw3Eoo8QSa70rR7pk0OFB71pO/Gnc
IKfnfXTkCpW6nzooOQJBAPNgQG5dgLbPG4R2U1Bx99XOJuVfI2HAsiRrHrTFjQuA
cuNs9HLtIQ/+tbl8BOyIktRlPrU7R06RMSJr1n1wJwUCQQCLStHi1L7+mO1rT+LM
dBgK2lbrFmll6BvP76xL7pJ2LDYrZ6VeT+YKHRPd92jh8H070fK0MXRsS2N0xSV3
IjU/AkAeyRQdYdKATV5ruRP83w28i+E7rncpTFi8ZphxwXN/+vWNcyDQ0NIX1d5i
4h81VGlOWKhAAImalJ8kfYOaRm+JAkB+H5AuMG6EP1pymZIFiHUglpSvJsrmkCVm
wWCkHHAXem7OHHobDIOB0tRjXptkQYpTuQVm7YS6bgSu/bevyJSnAkEA8shupcTn
DjjMmlbL/kbXcRyCaU3hECpaskwY+l+aOnCIAEtytuXgnlx6Ni/3C3Qu27Jryoua
eNOWZyOSzyEZDA==
-----END PRIVATE KEY-----`;

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

let bankHash = "";
let bankIP = "";
const defaultUuid = "36433004-14e1-11e8-930b-13d20e4fe76d";
const region = 0;
const securityLayer = 3;
//const _hash = "vPn1LL9bU1zPIRW2MzpulESRTIzhP6KbjQrUK12zuOw=";
const _hash = "gmJHyePWZqR107NIq0V9U8mrBREEoEtz8t4L7rDOHcg=";
describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);
        /*         it("Request: get all mappings", function(resolve) {
            request[ahgConfig.api.getBanksMappings.method](
                ahgConfig.api.getBanksMappings.path
            )
                .auth("admin", "pass")
                .expect("Content-type", /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        logger.error(err);
                        return;
                    }
                    // get first bank
                    for (var hash in res.body) {
                        bankHash = hash;
                        bankIP = res.body[hash];
                        break;
                    }

                    resolve();
                });
        }); */

        /*         it("Generate root identity hmap", function(resolve) {
            const assetType = 0;
            const assetSubType = 1;

            const data =
                region.toString() +
                layer.toString() +
                assetType.toString() +
                assetSubType.toString();

            //console.log();

            bankHash = hmac.update(data).digest("hex");

            console.log(bankHash);
            process.exit(0);
        }); */

        it("Request: create identity", function(resolve) {
            // return this.skip();
            const assetType = 0;
            const assetSubType = 2;
            /*            const bankIdentity =
                "CgQIAxAAEix2UG4xTEw5YlUxelBJUlcyTXpwdWxFU1JUSXpoUDZLYmpRclVLMTJ6dU93PRgAIAA="; */
            const bankIdentity =
                "CgQIAxAAEixnbUpIeWVQV1pxUjEwN05JcTBWOVU4bXJCUkVFb0V0ejh0NEw3ckRPSGNnPRgBIAE=";
            const rootIdentity =
                "CgQIAxAAEixnbUpIeWVQV1pxUjEwN05JcTBWOVU4bXJCUkVFb0V0ejh0NEw3ckRPSGNnPRgAIAA=";

            let data = {
                auth: {
                    bankIdentity: bankIdentity,
                    signature: signatureRsa(
                        new Buffer(bankIdentity, "base64"),
                        privateKey
                    ),
                    keyId: defaultUuid
                },
                requestType: "identity",
                requestId: uuidV1(),
                body: {
                    hash: "b4914600112ba18af7798b6c1a1363728ae1d96f",
                    assetType: assetType,
                    assetSubType: assetSubType,
                    description: "some transaction description" //optional field
                }
            };

            logger.info("Request data: ", JSON.stringify(data, 0, 2));

            request[ahgConfig.api.createIdentity.method](
                ahgConfig.api.createIdentity.path
            )
                .expect("Content-type", /json/)
                //.expect(200)
                .send(data)
                .end(function(err, res) {
                    if (err) {
                        logger.error(err);
                        //logger.error(res.body ? res.body : "");
                    } else {
                        logger.info(res.body);
                    }

                    resolve();
                });
        });
    });
});

function signatureRsa(data, privateKey) {
    var signRsaSha256 = crypto.createSign("RSA-SHA256");
    signRsaSha256.write(data);
    signRsaSha256.end();

    return signRsaSha256.sign(privateKey, "base64");
}
