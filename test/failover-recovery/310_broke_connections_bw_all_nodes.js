const fs = require("fs");
const expect = require("chai").expect;
const async = require("async");
const cbsApi = require(__dirname + "/../../cbs");
const winston = require("winston");
const ssh = require("node-ssh");
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

let connections = {};

describe(testName, function() {
    this.timeout(100000);

    before(function() {
        let cbsUrl =
            failoverConfig.cbs.api.proto +
            failoverConfig.cbs.hosts[0] +
            ":" +
            failoverConfig.cbs.api.port;

        cbsApi.setCbsUrl(cbsUrl);
    });

    it("SSH connect to nodes", function(resolve) {
        let ips = [];
        let connected = 0;
        let errors = 0;

        getIPs(failoverConfig, /^(\d+)\.(\d+)\.(\d+)\.(\d+)/, ips);
        ips = ips.filter(function(value, index, array) {
            return array.indexOf(value) == index;
        });

        ips.forEach(ip => {
            connections[ip] = new ssh();
            connections[ip]
                .connect(
                    Object.assign(sshConfig, {
                        host: ip
                    })
                )
                .then(function(result) {
                    if (result.stderr) {
                        logger.error(
                            "Can`t execute command. Error: ",
                            result.stderr
                        );
                        errors++;
                    } else {
                        logger.info(`Connect to ${ip} is success.`);
                        connected++;
                    }
                })
                .catch(function(err) {
                    logger.error(`Connection error to ${ip}`, err);
                    errors++;
                });
        });

        let waitConnections = setInterval(() => {
            if (errors > 0) {
                clearInterval(waitConnections);
                logger.error("Can't connect to host. Check config file.");
                process.exit(1);
            }
            console.log(connected, errors, "\n");
            if (connected === ips.length) {
                clearInterval(waitConnections);
                resolve();
            }
        }, 500);
    });

    it("Allow connections", function(resolve) {
        let ips = Object.keys(connections);
        let executed = 0;
        let errors = 0;

        ips.forEach(ip => {
            let allowIps = ips.splice(ips.indexOf(ip), 1);
            let cmd = acceptIp(allowIps).join(" && ");

            connections[ip]
                .execCommand(cmd, {
                    cwd: "/"
                })
                .then(function(result) {
                    if (result.stderr) {
                        logger.error(
                            "Can`t execute command. Error: ",
                            result.stderr
                        );
                        errors++;
                    } else {
                        executed++;
                    }
                });
        });

        let wait = setInterval(() => {
            if (errors > 0) {
                clearInterval(wait);
                logger.error("Can't execute command. Check config file.");
                process.exit(1);
            }

            if (executed === ips.length) {
                clearInterval(wait);
                setTimeout(resolve, 30000);
            }
        }, 500);
    });

    it("Drop connections", function(resolve) {
        let ips = Object.keys(connections);
        let executed = 0;
        let errors = 0;

        ips.forEach(ip => {
            let dropIps = ips.splice(ips.indexOf(ip), 1);
            let cmd = dropIp(dropIps).join(" && ");

            connections[ip]
                .execCommand(cmd, {
                    cwd: "/"
                })
                .then(function(result) {
                    if (result.stderr) {
                        logger.error(
                            "Can`t execute command. Error: ",
                            result.stderr
                        );
                        errors++;
                    } else {
                        executed++;
                    }
                });
        });

        let wait = setInterval(() => {
            if (errors > 0) {
                clearInterval(wait);
                logger.error("Can't execute command. Check config file.");
                process.exit(1);
            }

            if (executed === ips.length) {
                clearInterval(wait);
                setTimeout(resolve, 1000);
            }
        }, 500);
    });

    it("Add pubkey. Operations should not be successful.", function(resolve) {
        let account = JSON.parse(process.env["account1"]);
        let secretKey = process.env["secretKey1"];
        let amount = parseFloat(process.env["balanceAccount1"]);
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

    it("Allow connections", function(resolve) {
        let ips = Object.keys(connections);
        let executed = 0;
        let errors = 0;

        ips.forEach(ip => {
            let allowIps = ips.splice(ips.indexOf(ip), 1);
            let cmd = acceptIp(allowIps).join(" && ");

            connections[ip]
                .execCommand(cmd, {
                    cwd: "/"
                })
                .then(function(result) {
                    if (result.stderr) {
                        logger.error(
                            "Can`t execute command. Error: ",
                            result.stderr
                        );
                        errors++;
                    } else {
                        executed++;
                    }
                });
        });

        let wait = setInterval(() => {
            if (errors > 0) {
                clearInterval(wait);
                logger.error("Can't execute command. Check config file.");
                process.exit(1);
            }

            if (executed === ips.length) {
                clearInterval(wait);
                setTimeout(resolve, 30000);
            }
        }, 500);
    });

    it("Requests to SAP->addpubkey for identity which performed requests when connections was broken", function(resolve) {
        let account = JSON.parse(process.env["account2"]);
        let secretKey = process.env["secretKey2"];
        let amount = parseFloat(process.env["balanceAccount2"]);
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
});

function getIPs(o, regexp, result) {
    for (var k in o) {
        if (typeof o[k] === "string") {
            if (o[k].match(regexp)) {
                result.push(o[k]);
            }
        } else if (typeof o[k] === "object") {
            getIPs(o[k], regexp, result);
        }
    }
}

function dropIp(ips) {
    let res = [];
    if (Array.isArray(ips)) {
        ips.forEach(ip => {
            res.push(
                "iptables -I INPUT 1 -s <IP>/32 -j DROP".replace("<IP>", ip)
            );
            res.push(
                "iptables -I OUTPUT 1 -s <IP>/32 -j DROP".replace("<IP>", ip)
            );
        });

        return res;
    } else {
        ip = ips;
        res.push("iptables -I INPUT 1 -s <IP>/32 -j DROP".replace("<IP>", ip));
        res.push("iptables -I OUTPUT 1 -s <IP>/32 -j DROP".replace("<IP>", ip));

        return res;
    }
}

function acceptIp(ips) {
    let res = [];
    if (Array.isArray(ips)) {
        ips.forEach(ip => {
            res.push(
                "iptables -D INPUT -s <IP>/32 -j DROP".replace("<IP>", ip)
            );
            res.push(
                "iptables -D OUTPUT -s <IP>/32 -j DROP".replace("<IP>", ip)
            );
        });

        return res;
    } else {
        ip = ips;
        res.push("iptables -D INPUT -s <IP>/32 -j DROP".replace("<IP>", ip));
        res.push("iptables -D OUTPUT -s <IP>/32 -j DROP".replace("<IP>", ip));

        return res;
    }
}
