require("node-env-file")(__dirname + "/../../../.env");

// switch off check ssl certificate
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const async = require("async");
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
if (fs.existsSync(__dirname + "/../../../iov_env.conf")) {
    require("node-env-file")(__dirname + "/../../../iov_env.conf");
    url = "http://" + process.env.sap_host + sapConfig.SAP.path;
    cbsApi.setCbsUrl("http://" + process.env.cbs_host);
    adminPortalUrl = "http://" + process.env.admin_portal_host;
    regionId =
        process.env.region_id >= 0 ? parseInt(process.env.region_id) : null;
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
}

const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const TYPES = require(__dirname + "/../../../api/operationTypes");
const storage = require(__dirname + "/../../data/storage");

const supertest = require("supertest");
const request = supertest.agent(adminPortalUrl);

var testName = __filename.match(
    /GROUPS(?:\/|\\)([\w\d+\_]+)(?:\/|\\)([\w\d+\_]+)/i
);
var testOperation = testName[2].toUpperCase();
var testHost = testName[1].toUpperCase();

let adminIdentityName = "Admin_" + Date.now();
let saps = [];
let layers = [];
let region = {};
let assethosts = [];
let rootIdentities = [];
let adminIdentities = [];
let adminIdentitySecrets = [];
const pubkey =
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCEbGRXxoAvEgbROOK2hwNzRCni9TBKFMsF5rx6GuuOKL4BbsSOJ9FmUkXo/XUrmH8HPM6DomIHBpENqFfG8/FO6V0N/qRz6VnRtpqYuIaeII3omiV61MYqKdpXSYqmS9wLnK075HloODVVccDMx/IZDa8uhWEuUIFLGDmCmFejOwIDAQAB";

let sessionToken = null;
let client = null;
let redboxes = [];

let exportPki = [];
let exportAssets = [];

describe(testHost, function() {
    describe(testOperation, function() {
        this.timeout(testsConfig.testTimeout);

        it("Request: auth on admin portal", function(resolve) {
            const req = portalConfig.api.login;
            const authdata = {
                username: portalConfig.auth.username,
                password: portalConfig.auth.password
            };

            request[req.method](req.path)
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

        it("Request: check db scheme", function(resolve) {
            const req = portalConfig.api.health;

            request[req.method](req.path)
                .set("X-Access-Token", sessionToken)
                .expect(200)
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

                    resolve();
                });
        });

        it("Request: get region model by region number", function(resolve) {
            const req = portalConfig.api.getRegionByNumber;
            const path = req.path.replace("{number}", regionId);

            request[req.method](path)
                .set("X-Access-Token", sessionToken)
                .expect(200)
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
                    expect(res.body).to.be.an("object");

                    region = res.body;

                    resolve();
                });
        });

        it("Request: check if tables is filled for regionId", function(resolve) {
            const req = portalConfig.api.checkHealth;

            request[req.method](req.path.replace("{regionId}", regionId))
                .expect(200)
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

                    resolve();
                });
        });

        it("Request: push all node-identities to iov for current regionId", function(resolve) {
            const req = portalConfig.api.pushNodeIdentities;

            request[req.method](req.path.replace("{regionId}", region.id))
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

                    resolve();
                });
        });

        it("Request: get admin identities", function(resolve) {
            const req = portalConfig.api.getAdminIdentities;

            request[req.method](req.path)
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

                    res.body.forEach((v, k) => {
                        if (
                            v.name === adminIdentityName &&
                            v.regionId === region.id
                        ) {
                            adminIdentity = v;
                        }
                    });

                    resolve();
                });
        });

        it("Request: get layers", function(resolve) {
            const req = portalConfig.api.getLayers;

            request[req.method](req.path)
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

                    layers = res.body;

                    resolve();
                });
        });

        it("Request: get SAPs", function(resolve) {
            const req = portalConfig.api.getSaps;

            request[req.method](req.path)
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

                    saps = res.body;

                    resolve();
                });
        });

        it("Request: get assethosts", function(resolve) {
            const req = portalConfig.api.getAssethosts;
            const path = req.path.replace("{regionId}", region.id);

            request[req.method](path)
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

                    assethosts = res.body;

                    resolve();
                });
        });

        it("Request: get root identities", function(resolve) {
            const req = portalConfig.api.getRootIdentities;

            request[req.method](req.path)
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

                    rootIdentities = res.body;

                    resolve();
                });
        });

        it("Request: create admin identity", function(resolve) {
            let urlParse = URL.parse(cbsApi.getCbsUrl());

            const req = portalConfig.api.createAdminIdentity;

            async.eachLimit(
                assethosts,
                1,
                (assethost, nextHost) => {
                    const data = {
                        assetHostId: assethost.id,
                        rootIdentityId: rootIdentities[0].id,
                        name: adminIdentityName,
                        clientHost: urlParse.hostname,
                        clientPort: urlParse.port,
                        description: "test admin identity"
                    };

                    request[req.method](req.path)
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
                            expect(res.header).to.have.ownProperty(
                                "response_code"
                            );
                            expect(res.header.response_code).to.equal(0);

                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");

                            adminIdentities.push(res.body);

                            process.env[
                                "adminIdentityName"
                            ] = adminIdentityName;

                            nextHost();
                        });
                },
                resolve
            );
        });

        it("Request: get secrets(QRs)", function(resolve) {
            const req = portalConfig.api.getSecret;

            async.eachLimit(
                adminIdentities,
                1,
                (adminIdentity, nextIdentity) => {
                    const path = req.path.replace(
                        "{identityId}",
                        adminIdentity.id
                    );

                    request[req.method](path)
                        .set("X-Access-Token", sessionToken)
                        .end(function(err, res) {
                            if (err || res.error) {
                                logger.error(err ? err : res.text);
                            }

                            res = JSON.parse(res.text);

                            expect(res).to.be.an("object");
                            expect(res).to.have.ownProperty("header");
                            expect(res.header).to.be.an("object");
                            expect(res.header).to.have.ownProperty(
                                "response_code"
                            );
                            expect(res.header.response_code).to.equal(0);

                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");

                            adminIdentitySecrets.push(res.body);

                            nextIdentity();
                        });
                },
                resolve
            );
        });

        it("Request: CBS create new client", function(resolve) {
            const adminIdentity = adminIdentities[0];
            const regionId = adminIdentity.regionId;

            let sapId = null;
            let assetHostId = null;
            // search sap model for region
            saps.forEach((v, k) => {
                if (v.regionId === regionId) {
                    sapId = v.id;
                }
            });

            assethosts.forEach((v, k) => {
                if (v.regionId === regionId) {
                    assetHostId = v.id;
                }
            });

            let data = {
                name: adminIdentity.name,
                adminIdentity: adminIdentity.iovAddress,
                assetHostId: assetHostId,
                sapId: sapId,
                userName: "Client4Test_" + Date.now(),
                password: "tmp",
                description: "tmp"
            };

            //logger.info(JSON.stringify(data));

            cbsApi["Client"].сreateNew(data, (err, res) => {
                if (err) {
                    logger.error(err);
                    expect(res).to.be.an("object");
                    resolve(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.be.an("object");
                    expect(res.body).to.have.ownProperty("id");

                    client = res.body;

                    process.env["Client"] = JSON.stringify(client);
                    storage.add("CLIENTS", client);

                    resolve();
                }
            });
        });

        it("Request: Export Assets", function(resolve) {
            const req = portalConfig.api.exportAssets;

            request[req.method](req.path)
                .set("X-Access-Token", sessionToken)
                .expect(200)
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

                    exportAssets = res.body;

                    resolve();
                });
        });

        it("Request: Export PKI", function(resolve) {
            const adminIdentity = adminIdentities[0];
            const regionId = adminIdentity.regionId;
            const req = portalConfig.api.exportPki;
            const path = req.path
                .replace("{regionId}", regionId)
                .replace("{layerId}", layers[2].id);

            request[req.method](path)
                .set("X-Access-Token", sessionToken)
                .expect(200)
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

                    exportPki = res.body;
                    resolve();
                });
        });

        it("Request: CBS import assets", function(resolve) {
            cbsApi["Settings"].сreateImportAssets(exportAssets, (err, res) => {
                if (err) {
                    logger.error(err);
                    expect(res).to.be.an("object");
                    resolve(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("body");

                    resolve();
                }
            });
        });

        it("Request: CBS import PKI", function(resolve) {
            cbsApi["Settings"].сreateImportPki(exportPki, (err, res) => {
                if (err) {
                    logger.error(err);
                    expect(res).to.be.an("object");
                    resolve(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("body");

                    resolve();
                }
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

        /*         it("Request: CBS client -> Assign Red Box", function(resolve) {

            const adminIdentity = adminIdentities[0];
            const regionId = adminIdentity.regionId;
            const redbox = redboxes[0];

            let data = {
                redBoxId: redbox.id,
                id: client.id,
                client: client
            };

            cbsApi["Client"].assignRedBox(data, (err, res) => {
                if (err) {
                    logger.error(err);
                    expect(res).to.be.an("object");
                    resolve(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.be.an("object");
                    expect(res.body).to.have.ownProperty("id");

                    resolve();
                }
            });
        }); */

        it("Request: CBS client -> Update Red Box", function(resolve) {
            const adminIdentity = adminIdentities[0];
            const regionId = adminIdentity.regionId;
            const redbox = redboxes[0];
            const secret = adminIdentitySecrets[0].secret;

            let data = {
                redBoxId: redbox.id,
                secret: secret,
                id: client.id
            };

            cbsApi["Client"].redboxUpdate(data, (err, res) => {
                if (err) {
                    logger.error(err);
                    expect(res).to.be.an("object");
                    resolve(err);
                } else {
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.be.an("object");

                    resolve();
                }
            });
        });

        /*         it("Request: update pubkey for admin identity", function(resolve) {

            const req = portalConfig.api.updatePubkey;

            async.eachLimit(
                adminIdentitySecrets,
                1,
                (adminIdentitySecret, nextSecret) => {
                    const idx = adminIdentitySecrets.indexOf(
                        adminIdentitySecret
                    );

                    const adminIdentity = adminIdentities[idx];
                    const regionId = adminIdentity.regionId;
                    let sapId = null;
                    // search sap model for region
                    saps.forEach((v, k) => {
                        if (v.regionId === regionId) {
                            sapId = v.id;
                        }
                    });

                    const data = {
                        sapId: sapId,
                        keyId: "1",
                        publicKey: pubkey
                    };

                    const path = req.path
                        .replace("{secretId}", adminIdentitySecret.id)
                        .replace("{identityId}", adminIdentity.id);

                    request[req.method](path)
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
                            expect(res.header).to.have.ownProperty(
                                "response_code"
                            );
                            expect(res.header.response_code).to.equal(0);

                            expect(res).to.have.ownProperty("body");
                            expect(res.body).to.be.an("object");

                            nextSecret();
                        });
                },
                resolve
            );
        }); */
    });
});
