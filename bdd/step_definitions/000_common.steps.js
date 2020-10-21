const { BeforeAll, Given, When, Then } = require("cucumber");
const { expect } = require("chai");
const world = require(__dirname + "/../../support/world.js");
const URL = require("url");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

BeforeAll(function(done) {
    Promise.all([
        new Promise(resolve => {
            world.getEnv(resolve);
        }),
        new Promise(resolve => {
            const Onboarding = new iovOnboarding();
            Onboarding.envPrepare(resolve);
        })
    ]).then(() => {
        done();
    });
});

Given("Clear World", function() {
    world.clearWorld();
});

Given("Delay msec {int}", function(msec, done) {
    setTimeout(done, msec);
});

class iovOnboarding {
    constructor() {
        this.portalSessionToken = "";
        this.cbsSessionToken = "";
        this.assethosts = [];
        this.rootIdentities = [];
        this.region = {};
    }

    envPrepare(done) {
        return this.authPortal()
            .then(portalSessionToken => {
                this.portalSessionToken = portalSessionToken;
                return this.authCbs();
            })
            .then(cbsSessionToken => {
                this.cbsSessionToken = cbsSessionToken;
                return this.getRegionModel();
            })
            .then(region => {
                this.region = region;
                return this.getSaps();
            })
            .then(saps => {
                this.saps = saps;
                return this.getAssetHosts();
            })
            .then(assethosts => {
                this.assethosts = assethosts;
                return this.getRootIdentities();
            })
            .then(rootIdentities => {
                this.rootIdentities = rootIdentities;
                return this.createAdminIdentity();
            })
            .then(adminIdentity => {
                this.adminIdentity = adminIdentity;
                return this.getSecret();
            })
            .then(adminIdentitySecret => {
                this.adminIdentitySecret = adminIdentitySecret.secret;
                return this.createCbsClient();
            })
            .then(cbsClient => {
                this.cbsClient = cbsClient;
                world.setCbsClient(cbsClient);
                return this.getRedboxes();
            })
            .then(redboxes => {
                this.redboxes = redboxes;
                return this.updateRedbox();
            })
            .then(onboardedCbsClient => {
                return this.cbsBecomeClient(onboardedCbsClient.id);
            })
            .then(clientSessionToken => {
                world.setCbsClientSessionToken(clientSessionToken);
                this.cbsSessionToken = clientSessionToken;
                done();
            })
            .catch(e => {
                logger.error("Onboarding error: ", e);
            });
    }

    getRedboxes() {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.getRedboxes;
        const cbsAuthHeader = world.getCbsAuthHeader();

        return request[req.method](req.path)
            .set(cbsAuthHeader, this.cbsSessionToken)
            .then(res => {
                return JSON.parse(res.text).body;
            });
    }

    updateRedbox() {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.updateClientRedbox;
        const cbsAuthHeader = world.getCbsAuthHeader();
        const path = req.path.replace("{id}", this.cbsClient.id);

        const data = {
            redBoxId: this.redboxes[0].id,
            secret: this.adminIdentitySecret,
            id: this.cbsClient.id
        };

        return request[req.method](path)
            .set(cbsAuthHeader, this.cbsSessionToken)
            .send(data)
            .then(res => {
                res = JSON.parse(res.text).body;
                return res;
            });
    }

    authPortal() {
        const request = world.getAdminPortalConn();
        const req = world.portalConfig.api.login;

        const authdata = {
            username: world.portalConfig.auth.username,
            password: world.portalConfig.auth.password
        };

        return request[req.method](req.path)
            .send(authdata)
            .then(res => {
                try {
                    res = JSON.parse(res.text);
                } catch (e) {
                    logger.error("Can`t parse JSON", res.text);
                }
                return res.body.sessionToken;
            });
    }

    authCbs() {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.login;

        const authdata = {
            username: world.cbsConfig.auth.username,
            password: world.cbsConfig.auth.password
        };

        return request[req.method](req.path)
            .send(authdata)
            .then(res => {
                if (res.error) {
                    logger.error(res.body);
                }

                res = JSON.parse(res.text);

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("header");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("sessionToken");
                expect(res.header).to.be.an("object");
                expect(res.header).to.have.ownProperty("response_code");
                expect(res.header.response_code).to.equal(0);

                return res.body.sessionToken;
            });
    }

    getSaps() {
        const request = world.getAdminPortalConn();
        const req = world.portalConfig.api.getSaps;
        const portalAuthHeader = world.getPortalAuthHeader();

        return request[req.method](req.path)
            .set(portalAuthHeader, this.portalSessionToken)
            .then(res => {
                if (res.error) {
                    logger.error(res.text);
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

                return res.body;
            });
    }

    cbsBecomeClient(clientId) {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.becomeClient;
        const path = req.path.replace("{clientId}", clientId);
        const cbsAuthHeader = world.getCbsAuthHeader();

        return request[req.method](path)
            .set(cbsAuthHeader, this.cbsSessionToken)
            .send({})
            .then(res => {
                if (res.error) {
                    logger.error(res.body);
                }

                res = JSON.parse(res.text);

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("header");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("sessionToken");
                expect(res.header).to.be.an("object");
                expect(res.header).to.have.ownProperty("response_code");
                expect(res.header.response_code).to.equal(0);

                return res.body.sessionToken;
            });
    }

    createCbsClient() {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.createClient;
        const adminIdentity = this.adminIdentity;
        const regionId = adminIdentity.regionId;
        const cbsAuthHeader = world.getCbsAuthHeader();

        let sapId = null;
        let assetHostId = null;
        // search sap model for region
        this.saps.forEach(v => {
            if (v.regionId === regionId) {
                sapId = v.id;
            }
        });

        this.assethosts.forEach((v, k) => {
            if (v.regionId === regionId) {
                assetHostId = v.id;
            }
        });

        let data = {
            name: this.adminIdentity.name,
            adminIdentity: this.adminIdentity.iovAddress,
            assetHostId: assetHostId,
            sapId: sapId,
            userName: "CucumberClient" + Date.now(),
            password: "CucumberClientPass",
            description: "CucumberTest"
        };

        return request[req.method](req.path)
            .set(cbsAuthHeader, this.cbsSessionToken)
            .send(data)
            .then(res => {
                res = JSON.parse(res.text).body;

                return res;
            });
    }

    getAssetHosts() {
        const request = world.getAdminPortalConn();
        const req = world.portalConfig.api.getAssethosts;
        const path = req.path.replace("{regionId}", this.region.id);
        const portalAuthHeader = world.getPortalAuthHeader();

        // logger.info("*-*-*-*-3", req.method, this.region, path);

        return request[req.method](path)
            .set(portalAuthHeader, this.portalSessionToken)
            .then(res => JSON.parse(res.text).body);
    }

    getRootIdentities() {
        const request = world.getAdminPortalConn();
        const req = world.portalConfig.api.getRootIdentities;
        const portalAuthHeader = world.getPortalAuthHeader();

        return request[req.method](req.path)
            .set(portalAuthHeader, this.portalSessionToken)
            .then(res => JSON.parse(res.text).body);
    }

    getRegionModel() {
        const request = world.getAdminPortalConn();
        const req = world.portalConfig.api.getRegionByNumber;
        const portalAuthHeader = world.getPortalAuthHeader();

        const path = req.path.replace("{number}", world.iovRegionId);

        return request[req.method](path)
            .set(portalAuthHeader, this.portalSessionToken)
            .then(res => JSON.parse(res.text).body);
    }

    createAdminIdentity() {
        const request = world.getAdminPortalConn();
        const req = world.portalConfig.api.createAdminIdentity;
        const portalAuthHeader = world.getPortalAuthHeader();

        const urlParse = URL.parse(world.cbsUrl);

        const data = {
            assetHostId: this.assethosts[0].id,
            rootIdentityId: this.rootIdentities[0].id,
            name: "CucumberAdminIdentity" + Date.now(),
            clientHost: urlParse.hostname,
            clientPort: urlParse.port,
            description: "cucumber test admin identity"
        };

        return request[req.method](req.path)
            .set(portalAuthHeader, this.portalSessionToken)
            .send(data)
            .then(res => JSON.parse(res.text).body);
    }

    getSecret() {
        const request = world.getAdminPortalConn();
        const req = world.portalConfig.api.getSecret;
        const path = req.path.replace("{identityId}", this.adminIdentity.id);
        const portalAuthHeader = world.getPortalAuthHeader();

        return request[req.method](path)
            .set(portalAuthHeader, this.portalSessionToken)
            .then(res => {
                if (res.error) {
                    logger.error(res.text);
                }

                res = JSON.parse(res.text);

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("header");
                expect(res.header).to.be.an("object");
                expect(res.header).to.have.ownProperty("response_code");
                expect(res.header.response_code).to.equal(0);

                expect(res).to.have.ownProperty("body");
                expect(res.body).to.be.an("object");

                return res.body;
            });
    }
}
