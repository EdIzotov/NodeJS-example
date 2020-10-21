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
    this.timeout(100000);

    before(function() {
        if (!failoverConfig.core.shards.length) {
            logger.info(
                "Skip this test. Config doesn`t have shards IP configuration"
            );
            this.skip();
        } else if (
            failoverConfig.core.shards.filter(x =>
                failoverConfig.core.sharders.includes(x)
            ).length > 0
        ) {
            logger.info(
                "Shard and sharder has same IPs. Its can`t be blocked."
            );
            this.skip();
        } else {
            let cbsUrl =
                failoverConfig.cbs.api.proto +
                failoverConfig.cbs.hosts[0] +
                ":" +
                failoverConfig.cbs.api.port;

            cbsApi.setCbsUrl(cbsUrl);
        }
    });

    it("connect to node through ssh", function(resolve) {
        ssh
            .connect(
                Object.assign(sshConfig, {
                    host: failoverConfig.core.sharders[0]
                })
            )
            .then(function() {
                logger.info("connect is success.");
                resolve();
            })
            .catch(function(err) {
                logger.error("Connection error", err);
                resolve(err);
            });
    });

    it("Check node role", function(resolve) {
        let cmd =
            "sudo head --lines 500 /logs/node.log |grep 'Cluster is up, roles: '";

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

                expect(result.stdout).to.match(/\[shard, sharder\]/);

                resolve();
            });
    });

    it("Drop connection between shard and sharder", function(resolve) {
        let cmd = "sudo " + dropIp(failoverConfig.core.shards[0]).join(" && ");

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
        let account = JSON.parse(process.env["account2"]);
        let secretKey = process.env["secretKey2"];
        let amount = parseFloat(process.env["balanceAccount2"]);
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

    it("Allow connection between shard and sharder", function(resolve) {
        let cmd =
            "sudo " + acceptIp(failoverConfig.core.shards[0]).join(" && ");

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

                setTimeout(() => resolve(), 6000);
            });
    });

    it("Get history to make sure that the public key was not added. Operations should not be successful.", function(resolve) {
        let account = JSON.parse(process.env["account2"]);
        let secretKey = process.env["secretKey2"];
        let amount = parseFloat(process.env["balanceAccount2"]);
        let keyId = "1";

        async.timesLimit(
            10,
            1,
            (n, next) => {
                let data = SAP_DATA[TYPES.HISTORY]({
                    yourIdentityIOVAddress: account.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account.iovSideChainId,
                    from: new Date(
                        new Date().getTime() - 60 * 60 * 24 * 7 * 1000
                    ).getTime(), // last week
                    to: new Date(
                        new Date().getTime() + 60 * 60 * 24 * 1000
                    ).getTime(),
                    keyId: keyId
                });

                new sapTransport(sapUrl).send(
                    JSON.stringify(data),
                    (err, res) => {
                        if (res && !res.error) logger.error(res);

                        expect(res).to.be.an("object");
                        expect(res).to.have.ownProperty("id");
                        expect(res.id).to.equal(data.id);
                        expect(res).to.have.ownProperty("type");
                        expect(res.type).to.equal(data.type);
                        expect(res).to.have.ownProperty("error");
                        expect(res).to.have.ownProperty("errorCode");
                        expect(res.errorCode).to.equal(4);

                        setTimeout(next, 400);
                    }
                );
            },
            err => {
                setTimeout(resolve, 5000);
            }
        );
    });
});
