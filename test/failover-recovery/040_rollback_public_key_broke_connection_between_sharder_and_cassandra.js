const fs = require("fs");
const expect = require("chai").expect;
const async = require("async");
const cbsApi = require(__dirname + "/../../cbs");
const winston = require("winston");
const ssh = new (require("node-ssh"))();
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const sapTransport = require(__dirname + "/../../api/transport");
const SAP_DATA = require(__dirname + "/../../api/operations");
const TYPES = require(__dirname + "/../../api/operationTypes");
const privKey = fs.readFileSync(__dirname + "/../data/private.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";

const failoverConfig = require(__dirname + "/../../config/failover.json")[
    process.env.NODE_ENV
];

let sapUrl =
    failoverConfig.sap.api.proto +
    failoverConfig.sap.hosts[0] +
    ":" +
    failoverConfig.sap.api.port +
    failoverConfig.sap.api.path;

const sshConfig = require(__dirname + "/../../config/ssh.json")[
    process.env.NODE_ENV
];

let testName = __filename
    .replace(/.*[\/|\\]+/gi, "")
    .replace(/.js$/i, "")
    .replace(/_/gi, " ")
    .toUpperCase();

function dropIp(ip) {
    return [
        "iptables -I INPUT 1 -s <IP>/32 -j DROP".replace("<IP>", ip),
        "iptables -I OUTPUT 1 -s <IP>/32 -j DROP".replace("<IP>", ip)
    ];
}

function acceptIp(ip) {
    return [
        "iptables -D INPUT -s <IP>/32 -j DROP".replace("<IP>", ip),
        "iptables -D OUTPUT -s <IP>/32 -j DROP".replace("<IP>", ip)
    ];
}

describe(testName, function() {
    this.timeout(300000);

    before(function() {
        let cbsUrl =
            failoverConfig.cbs.api.proto +
            failoverConfig.cbs.hosts[0] +
            ":" +
            failoverConfig.cbs.api.port;

        cbsApi.setCbsUrl(cbsUrl);
    });

    it("connect to sharder through ssh", function(resolve) {
        let host = failoverConfig.core.sharders[0];

        ssh
            .connect(
                Object.assign(sshConfig, {
                    host: host
                })
            )
            .then(function() {
                logger.info(`connect to ${host} is success.`);
                resolve();
            })
            .catch(function(err) {
                logger.error(`Connection error: (${host}) `, err);
                resolve();
            });
    });

    it("Drop connection between sharder and cassandra", function(resolve) {
        let cmd = "sudo " + dropIp(failoverConfig.cassandra[0]).join(" && ");

        logger.info("exec command: " + cmd);

        ssh
            .execCommand(cmd, {
                cwd: "/"
            })
            .then(function(result) {
                if (result.stderr) {
                    logger.error(
                        "Can`t execute command. Error: ",
                        result.stderr
                    );
                    return resolve();
                }

                setTimeout(() => resolve(), 3000);
            });
    });

    it("Add pubkey. Operations should not be successful.", function(resolve) {
        let account = JSON.parse(process.env["account4"]);
        let secretKey = process.env["secretKey4"];
        let amount = parseFloat(process.env["balanceAccount4"]);
        let keyId = "1";

        let data = SAP_DATA[TYPES.PUBKEY]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            pubKey: pubKey,
            secret: secretKey,
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res && !res.error) logger.error(res);

            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("id");
            expect(res.id).to.equal(data.id);
            expect(res).to.have.ownProperty("type");
            expect(res.type).to.equal(data.type);
            expect(res).to.have.ownProperty("error");
            resolve();
        });
    });

    it("Allow connection between sharder and cassandra", function(resolve) {
        let host = failoverConfig.cassandra[0];
        let cmd = "sudo " + acceptIp(host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh
            .execCommand(cmd, {
                cwd: "/"
            })
            .then(function(result) {
                if (result.stderr) {
                    logger.error(
                        "Can`t execute command. Error: ",
                        result.stderr
                    );
                    return resolve();
                }

                setTimeout(() => resolve(), 31000);
            });
    });

    it("Requests to SAP->addpubkey", function(resolve) {
        let account = JSON.parse(process.env["account5"]);
        let secretKey = process.env["secretKey5"];
        let amount = parseFloat(process.env["balanceAccount5"]);
        let keyId = "2";

        let data = SAP_DATA[TYPES.PUBKEY]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            pubKey: pubKey,
            secret: secretKey,
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res && res.error) logger.error(res);

            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("id");
            expect(res.id).to.equal(data.id);
            expect(res).to.have.ownProperty("type");
            expect(res.type).to.equal(data.type);
            expect(res).to.not.have.ownProperty("error");

            resolve();
        });
    });

    it("Get history", function(resolve) {
        let account = JSON.parse(process.env["account5"]);
        let keyId = "2";

        let data = SAP_DATA[TYPES.HISTORY]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account.iovSideChainId,
            from: new Date(
                new Date().getTime() - 60 * 60 * 24 * 7 * 1000
            ).getTime(), // last week
            to: new Date(new Date().getTime() + 60 * 60 * 24 * 1000).getTime(),
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res && res.error) logger.error(res);

            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("id");
            expect(res.id).to.equal(data.id);
            expect(res).to.have.ownProperty("type");
            expect(res.type).to.equal(data.type);
            expect(res).to.not.have.ownProperty("error");

            resolve();
        });
    });

    it("Requests to SAP->addpubkey for identity which performed requests when connections was broken", function(resolve) {
        let account = JSON.parse(process.env["account4"]);
        let secretKey = process.env["secretKey4"];
        let amount = parseFloat(process.env["balanceAccount4"]);
        let keyId = "2";

        let data = SAP_DATA[TYPES.PUBKEY]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            pubKey: pubKey,
            secret: secretKey,
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res && res.error) logger.error(res);

            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("id");
            expect(res.id).to.equal(data.id);
            expect(res).to.have.ownProperty("type");
            expect(res.type).to.equal(data.type);
            expect(res).to.not.have.ownProperty("error");

            resolve();
        });
    });

    it("Get history for identity which performed requests when connections was broken", function(resolve) {
        let account = JSON.parse(process.env["account4"]);
        let secretKey = process.env["secretKey4"];
        let amount = parseFloat(process.env["balanceAccount4"]);
        let keyId = "2";

        let data = SAP_DATA[TYPES.HISTORY]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account.iovSideChainId,
            from: new Date(
                new Date().getTime() - 60 * 60 * 24 * 7 * 1000
            ).getTime(), // last week
            to: new Date(new Date().getTime() + 60 * 60 * 24 * 1000).getTime(),
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res && res.error) logger.error(res);

            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("id");
            expect(res.id).to.equal(data.id);
            expect(res).to.have.ownProperty("type");
            expect(res.type).to.equal(data.type);
            expect(res).to.not.have.ownProperty("error");

            resolve();
        });
    });
});
