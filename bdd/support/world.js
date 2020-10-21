require("node-env-file")(__dirname + "/../../.env");
const fs = require("fs");
const { expect } = require("chai");
// const { setWorldConstructor } = require("cucumber");
const sapTransport = require(__dirname + "/../../api/transport");
const privKey = fs.readFileSync(__dirname + "/../../test/data/private.key");

const apiGatewayConfig = require(__dirname + "/../../config/api_gateway.json")[
    process.env.NODE_ENV
];

// These configs are temporary here should be removed
const cbsConfig = require(__dirname + "/../config/cbs.json")[
    process.env.NODE_ENV
];
const scConfig = require(__dirname + "/../../config/smart_contract.json")[
    process.env.NODE_ENV
];
const portalConfig = require(__dirname + "/../config/portal.json")[
    process.env.NODE_ENV
];
const sapOperations = require(__dirname + "/../../api/operations");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const supertest = require("supertest");
const envConfig = __dirname + "/../../iov_env.conf";

if (fs.existsSync(envConfig)) {
    require("node-env-file")(envConfig);
} else {
    logger.error(`Config file ${envConfig} not found`);
    process.exit(1);
}

class CustomWorld {
    constructor() {
        this.envSettings = null;
        this._init();
    }

    _init() {
        this.pubKey =
            "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";
        this.privKey = privKey;

        this.apiGatewayUrl = "http://" + process.env.api_gateway_host;

        this.adminPortalUrl = "http://" + process.env.admin_portal_host;
        this.cbsUrl = "http://" + process.env.cbs_host;
        this.scUrl = "http://" + process.env.sap_host;
        this.cbsConfig = cbsConfig;
        this.portalConfig = portalConfig;
        this.sapOperations = sapOperations;

        this.iovRegionId = parseInt(process.env.region_id);
        // this.cbsRegionId = parseInt(process.env.region_id);
    }

    _setUrls() {
        this.sapUrl =
            this.envSettings.regions[0].saps[0].protocol +
            "://" +
            this.envSettings.regions[0].saps[0].host +
            ":" +
            this.envSettings.regions[0].saps[0].port +
            "/" +
            this.envSettings.regions[0].saps[0].route;
    }

    setCbsClient(cbsClient) {
        // logger.info("/*-/-*/-*/ cbsClient *-", typeof cbsClient);
        this.cbsClient = cbsClient;
    }

    setCbsClientSessionToken(token) {
        this.cbsClientSessionToken = token;
    }

    getCbsClientSessionToken() {
        return this.cbsClientSessionToken;
    }

    getEnv(done) {
        const request = this.getAdminPortalConn();

        const req = portalConfig.api.login;
        const authdata = {
            username: portalConfig.auth.username,
            password: portalConfig.auth.password
        };
        let sessionToken;

        request[req.method](req.path)
            .send(authdata)
            .end((err, res) => {
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

                const req = portalConfig.api.getEnv;

                request[req.method](req.path)
                    .set("X-Access-Token", sessionToken)
                    .end((err, res) => {
                        if (err) logger.error(err);

                        res = JSON.parse(res.text);

                        this.envSettings = res.body;

                        this._setUrls();

                        done();
                    });
            });
    }

    getAPIGatewayConn() {
        return supertest.agent(this.apiGatewayUrl);
    }

    //TODO should be removed
    getSapConn() {
        return new sapTransport(this.sapUrl);
    }

    getAdminPortalConn() {
        return supertest.agent(this.adminPortalUrl);
    }

    getAhgConn() {
        return supertest.agent(this.ahgUrl);
    }

    getRedboxConn() {
        return supertest.agent(this.redboxUrl);
    }

    getCbsConn() {
        return supertest.agent(this.cbsUrl);
    }

    getScConn() {
        return supertest.agent(this.scUrl);
    }

    getCbsAuthHeader() {
        return "X-Access-Token";
    }

    getPortalAuthHeader() {
        return "X-Access-Token";
    }
}

module.exports = new CustomWorld();
// setWorldConstructor(CustomWorld);
