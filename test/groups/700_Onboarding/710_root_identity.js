require("node-env-file")(__dirname + "/../../../.env");

const async = require("async");
const crypto = require("crypto");
const uuidV1 = require("uuid/v1");
const testsConfig = require(__dirname + "/../../../config/tests.json");
const sapTransport = require(__dirname + "/../../../api/transport");
const sapConfig = require(__dirname + "/../../../config/sap.json")[
    process.env.NODE_ENV
];
const ahgConfig = require(__dirname + "/../../../config/ahg.json")[
    process.env.NODE_ENV
];
const redboxConfig = require(__dirname + "/../../../config/redbox.json")[
    process.env.NODE_ENV
];
const portalConfig = require(__dirname + "/../../../config/portal.json")[
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
var ahgUrl = "";
var redboxUrl = "";
if (fs.existsSync(__dirname + "/../../../iov_env.conf")) {
    require("node-env-file")(__dirname + "/../../../iov_env.conf");
    url = "http://" + process.env.sap_host + sapConfig.SAP.path;
    cbsApi.setCbsUrl("http://" + process.env.cbs_host);
    adminPortalUrl = "http://" + process.env.admin_portal_host;
    regionId =
        process.env.region_id >= 0 ? parseInt(process.env.region_id) : null;
    ahgUrl = process.env.ahg_host;
    redboxUrl = "http://" + process.env.redbox_host;
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
    ahgUrl = ahgConfig.url;
    redboxUrl = redboxConfig.url;
}

const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const TYPES = require(__dirname + "/../../../api/operationTypes");
const storage = require(__dirname + "/../../data/storage");

const supertest = require("supertest");
const requestAHG = supertest.agent(ahgUrl);
// const requestRedbox = supertest.agent(redboxUrl);
const requestAP = supertest.agent(adminPortalUrl);
const hash = crypto.createHash("sha256");
const hmac = crypto.createHmac("sha256", "ybhm2v6dP5GfwKgWebK1HQ==");

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

let rootIdentity = {};
let rootIdentityKeyId = "1";
let signature = "";
let requestId = uuidV1();

const rootIdentityAssetType = 0;
const rootIdentityAssetSubType = 0;
const rootIdentityHash = sha256(uuidV1());
const rootIdentityDescription = "test - create root identity";

const adminIdentityAssetType = 0;
const adminIdentityAssetSubType = 1;
const adminIdentityHash = sha256(uuidV1());
const adminIdentityDescription = "test - create admin identity";

const groupIdentityAssetType = 0;
const groupIdentityAssetSubType = 2;
const groupIdentityHash = sha256(uuidV1());
const groupIdentityDescription = "test - create group identity";

const nodeIdentityAssetType = 0;
const nodeIdentityAssetSubType = 3;
const nodeIdentityHash = sha256(uuidV1());
const nodeIdentityDescription = "test - create node identity";

const userIdentityAssetType = 0;
const userIdentityAssetSubType = 4;
const userIdentityHash = sha256(uuidV1());
const userIdentityDescription = "test - create user identity";

let sessionToken = null;

let redboxes = [];

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);

        it("Request: auth on admin portal", function(resolve) {
            const req = portalConfig.api.login;
            const authdata = {
                username: portalConfig.auth.username,
                password: portalConfig.auth.password
            };

            requestAP[req.method](req.path)
                .send(authdata)
                .end(function(err, res) {
                    if (err || res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("header");
                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.have.ownProperty("sessionToken");
                    expect(res.header).to.be.an("object");
                    expect(res.header).to.have.ownProperty("response_code");
                    expect(res.header.response_code).to.equal(0);

                    sessionToken = res.body.sessionToken;

                    resolve();
                });
        });

        it("Request: get root identities", function(resolve) {
            const req = portalConfig.api.getRootIdentities;

            requestAP[req.method](req.path)
                .set("X-Access-Token", sessionToken)
                .end(function(err, res) {
                    if (err || res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("header");
                    expect(res.header).to.be.an("object");
                    expect(res.header).to.have.ownProperty("response_code");
                    expect(res.header.response_code).to.equal(0);

                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.be.instanceof(Array);
                    expect(res.body.length).to.be.above(0);

                    rootIdentity = res.body[0];

                    resolve();
                });
        });

        it("Request: get IOV address", function(resolve) {
            const req = portalConfig.api.getIovAddress;

            const data = {
                regionId: regionId, // !!! this is regionNumber !!!
                layerId: 2,
                assetType: rootIdentityAssetType,
                assetSubType: rootIdentityAssetSubType,
                hash: rootIdentity.hash
            };

            requestAP[req.method](req.path)
                .set("X-Access-Token", sessionToken)
                .send(data)
                .end(function(err, res) {
                    if (err || res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("header");
                    expect(res.header).to.be.an("object");
                    expect(res.header).to.have.ownProperty("response_code");
                    expect(res.header.response_code).to.equal(0);

                    expect(res).to.have.ownProperty("body");
                    rootIdentity.iovAddress = res.body.iovAddress;

                    resolve();
                });
        });

        it("Request: CBS get redboxes", function(resolve) {
            cbsApi["Redboxes"].getAll({}, (err, res) => {
                if (err) {
                    logger.error(err);
                    expect(res).to.be.an("object");
                    resolve(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("body");

                    redboxes = res.body;

                    resolve();
                }
            });
        });

        it("Request: CBS get signature to create Admin identity", function(resolve) {
            requestId = uuidV1();
            const data = Buffer.concat([
                Buffer.from(rootIdentity.iovAddress),
                Buffer.from(rootIdentity.keyId),
                Buffer.from(requestId),
                Buffer.from("identity"),
                Buffer.from(adminIdentityHash),
                Buffer.from([adminIdentityAssetType]),
                Buffer.from([adminIdentityAssetSubType]),
                Buffer.from(adminIdentityDescription)
            ]).toString("base64");

            cbsApi["Redboxes"].sign(
                {
                    id: redboxes[0].id,
                    body: {
                        data: data
                    }
                },
                (err, res) => {
                    if (err) {
                        logger.error(err);
                        expect(res).to.be.an("object");
                        resolve(err);
                    } else {
                        expect(res).to.be.an("object");

                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("data");
                        expect(res.body).to.have.ownProperty("signature");
                        signature = res.body.signature;

                        resolve();
                    }
                }
            );
        });

        /*         it("Request: get signature to create Admin identity", function(resolve) {
            const req = redboxConfig.api.createSignature;

            requestId = uuidV1();
            const data = {
                data: Buffer.concat([
                    Buffer.from(rootIdentity.iovAddress),
                    Buffer.from(rootIdentity.keyId),
                    Buffer.from(requestId),
                    Buffer.from("identity"),
                    Buffer.from(adminIdentityHash),
                    Buffer.from([adminIdentityAssetType]),
                    Buffer.from([adminIdentityAssetSubType]),
                    Buffer.from(adminIdentityDescription)
                ]).toString("base64")
            };

            requestRedbox[req.method](req.path)
                .set("Accept", "application/json")
                .set("X-Access-Token", sessionToken)
                .send(data)
                .end(function(err, res) {
                    if (err || res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");

                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.have.ownProperty("data");
                    expect(res.body).to.have.ownProperty("signature");
                    signature = res.body.signature;

                    resolve();
                });
        }); */

        it("Request: create Admin identity", function(resolve) {
            let data = {
                auth: {
                    identity: rootIdentity.iovAddress,
                    signature: signature,
                    keyId: rootIdentity.keyId
                },
                requestType: "identity",
                requestId: requestId,
                body: {
                    hash: adminIdentityHash,
                    assetType: adminIdentityAssetType,
                    assetSubType: adminIdentityAssetSubType,
                    description: adminIdentityDescription
                }
            };

            requestAHG[ahgConfig.api.createIdentity.method](
                ahgConfig.api.createIdentity.path
            )
                .send(data)
                .set("X-Access-Token", sessionToken)
                .end(function(err, res) {
                    if (err || res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);

                    expect(res).to.be.an("object");
                    expect(res).to.not.have.ownProperty("errorMessage");
                    expect(res).to.not.have.ownProperty("errorCode");

                    resolve();
                });
        });

        it("Request: get signature to create Node identity", function(resolve) {
            requestId = uuidV1();
            const data = Buffer.concat([
                Buffer.from(rootIdentity.iovAddress),
                Buffer.from(rootIdentity.keyId),
                Buffer.from(requestId),
                Buffer.from("identity"),
                Buffer.from(nodeIdentityHash),
                Buffer.from([nodeIdentityAssetType]),
                Buffer.from([nodeIdentityAssetSubType]),
                Buffer.from(nodeIdentityDescription)
            ]).toString("base64");

            cbsApi["Redboxes"].sign(
                {
                    id: redboxes[0].id,
                    body: {
                        data: data
                    }
                },
                (err, res) => {
                    if (err) {
                        //logger.error(err);
                        expect(res).to.be.an("object");
                        resolve(err);
                    } else {
                        //logger.info(res);
                        expect(res).to.be.an("object");

                        expect(res).to.have.ownProperty("body");
                        expect(res.body).to.have.ownProperty("data");
                        expect(res.body).to.have.ownProperty("signature");
                        signature = res.body.signature;

                        resolve();
                    }
                }
            );
        });

        /*         it("Request: get signature to create Node identity", function(resolve) {
            const req = redboxConfig.api.createSignature;
            requestId = uuidV1();
            const data = {
                data: Buffer.concat([
                    Buffer.from(rootIdentity.iovAddress),
                    Buffer.from(rootIdentity.keyId),
                    Buffer.from(requestId),
                    Buffer.from("identity"),
                    Buffer.from(nodeIdentityHash),
                    Buffer.from([nodeIdentityAssetType]),
                    Buffer.from([nodeIdentityAssetSubType]),
                    Buffer.from(nodeIdentityDescription)
                ]).toString("base64")
            };

            signature = "";

            requestRedbox[req.method](req.path)
                .set("Accept", "application/json")
                .set("X-Access-Token", sessionToken)
                .send(data)
                .end(function(err, res) {
                    if (err || res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);
                    expect(res).to.be.an("object");

                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.have.ownProperty("data");
                    expect(res.body).to.have.ownProperty("signature");
                    signature = res.body.signature;

                    resolve();
                });
        }); */

        it("Request: create Node identity", function(resolve) {
            let data = {
                auth: {
                    identity: rootIdentity.iovAddress,
                    signature: signature,
                    keyId: rootIdentity.keyId
                },
                requestType: "identity",
                requestId: requestId,
                body: {
                    hash: nodeIdentityHash,
                    assetType: nodeIdentityAssetType,
                    assetSubType: nodeIdentityAssetSubType,
                    description: nodeIdentityDescription
                }
            };

            requestAHG[ahgConfig.api.createIdentity.method](
                ahgConfig.api.createIdentity.path
            )
                .send(data)
                .set("X-Access-Token", sessionToken)
                .end(function(err, res) {
                    if (err || res.error) {
                        logger.error(err ? err : res.text);
                    }

                    res = JSON.parse(res.text);

                    expect(res).to.be.an("object");
                    expect(res).to.not.have.ownProperty("errorMessage");
                    expect(res).to.not.have.ownProperty("errorCode");

                    resolve();
                });
        });
    });
});

function sha256(input) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(input))
        .digest("hex");
}
