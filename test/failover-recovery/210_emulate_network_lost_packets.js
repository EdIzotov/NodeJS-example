const fs = require("fs");
const expect = require("chai").expect;
const async = require("async");
const cbsApi = require(__dirname + "/../../cbs");
const winston = require("winston");
const ssh1 = new (require("node-ssh"))();
const ssh2 = new (require("node-ssh"))();
const ssh3 = new (require("node-ssh"))();
const ssh4 = new (require("node-ssh"))();
const ssh5 = new (require("node-ssh"))();
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

function addDropPackets(percent, ip, filterType = "drop") {
    filterType = "corrupt";
    percent = 25;
    return [
        "tc qdisc add dev `ifconfig | grep -B1 <IP> | grep -o '^\\w*'` root netem <filterType> <percent>%"
            .replace("<IP>", ip)
            .replace("<percent>", percent)
            .replace("<filterType>", filterType)
    ];
}

function delDropPackets(percent, ip, filterType = "drop") {
    filterType = "corrupt";
    percent = 25;
    return [
        "tc qdisc del dev `ifconfig | grep -B1 <IP> | grep -o '^\\w*'` root netem <filterType> <percent>%"
            .replace("<IP>", ip)
            .replace("<percent>", percent)
            .replace("<filterType>", filterType)
    ];
}

describe(testName, function() {
    this.timeout(500000);

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

        ssh1
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

    it("Tc drop 30% packets - sharder", function(resolve) {
        let host = failoverConfig.core.sharders[0];
        let cmd = "sudo " + addDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh1
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

                setTimeout(() => resolve(), 2000);
            })
            .catch(function(err) {
                logger.error(`Cant execute command: (${host}) `, err);
                resolve();
            });
    });

    it("connect to cassandra through ssh", function(resolve) {
        let host = failoverConfig.cassandra[0];

        ssh2
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

    it("Tc drop 30% packets cassandra", function(resolve) {
        let host = failoverConfig.cassandra[0];
        let cmd = "sudo " + addDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh2
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

                setTimeout(() => resolve(), 2000);
            })
            .catch(function(err) {
                logger.error(`Cant execute command: (${host}) `, err);
                resolve();
            });
    });

    it("connect to ahg through ssh", function(resolve) {
        let host = failoverConfig.ahg[0];

        ssh3
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

    it("Tc drop 30% packets ahg", function(resolve) {
        let host = failoverConfig.ahg[0];
        let cmd = "sudo " + addDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh3
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

                setTimeout(() => resolve(), 2000);
            })
            .catch(function(err) {
                logger.error(`Cant execute command: (${host}) `, err);
                resolve();
            });
    });

    it("connect to publisher through ssh", function(resolve) {
        let host = failoverConfig.core.publisher[0];

        ssh4
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

    it("Tc drop 30% packets publisher", function(resolve) {
        let host = failoverConfig.core.publisher[0];
        let cmd = "sudo " + addDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh4
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

                setTimeout(() => resolve(), 2000);
            })
            .catch(function(err) {
                logger.error(`Cant execute command: (${host}) `, err);
                resolve();
            });
    });

    it("connect to fan-out through ssh", function(resolve) {
        let host = failoverConfig.fanOut[0];

        ssh5
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

    it("Tc drop 30% packets fan-out", function(resolve) {
        let host = failoverConfig.fanOut[0];
        let cmd = "sudo " + addDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh5
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

                setTimeout(() => resolve(), 2000);
            })
            .catch(function(err) {
                logger.error(`Cant execute command: (${host}) `, err);
                resolve();
            });
    });

    it("Perform trx.", function(resolve) {
        logger.info("Perform trx");

        let account1 = JSON.parse(process.env["account1"]);
        let account2 = JSON.parse(process.env["account2"]);
        let balanceAccount1 = parseFloat(process.env["balanceAccount1"]);
        let balanceAccount2 = parseFloat(process.env["balanceAccount2"]);
        let trxAmount = 1;
        let keyId = "1";

        async.timesLimit(
            35,
            2,
            (n, next) => {
                let data = SAP_DATA[TYPES.TRX]({
                    yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                    privKey: privKey,
                    yourWalletAccountNumber: account1.iovSideChainId,
                    counterpartyAccountNumber: account2.iovSideChainId,
                    amount: trxAmount,
                    valuationTime: Date.now(),
                    keyId: keyId
                });

                new sapTransport(sapUrl).send(
                    JSON.stringify(data),
                    (err, res) => {
                        if (res) {
                            if (res.error) {
                                logger.error(res);
                            } else {
                                logger.info("- Success trx");
                                balanceAccount1 -= trxAmount;
                                balanceAccount2 += trxAmount;
                            }
                            next();
                        } else {
                            next(err);
                        }
                    }
                );
            },
            err => {
                if (err) {
                    logger.error(err);
                }

                process.env["balanceAccount1"] = balanceAccount1;
                process.env["balanceAccount2"] = balanceAccount2;

                setTimeout(resolve, 1500);
            }
        );
    });

    it("Delete tc(traffic control) rules from sharder", function(resolve) {
        let host = failoverConfig.core.sharders[0];
        let cmd = "sudo " + delDropPackets(50, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh1
            .execCommand(cmd, {
                cwd: "/"
            })
            .then(function(result) {
                if (result.stderr) {
                    logger.error(
                        "Can`t execute command. Error: ",
                        result.stderr
                    );
                }

                resolve();
            });
    });

    it("Delete tc(traffic control) rules from cassandra", function(resolve) {
        let host = failoverConfig.cassandra[0];
        let cmd = "sudo " + delDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh2
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
                setTimeout(() => {
                    resolve();
                }, 500);
            });
    });

    it("Delete tc(traffic control) rules from ahg", function(resolve) {
        let host = failoverConfig.ahg[0];
        let cmd = "sudo " + delDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh3
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
                setTimeout(() => {
                    resolve();
                }, 500);
            });
    });

    it("Delete tc(traffic control) rules from publisher", function(resolve) {
        let host = failoverConfig.core.publisher[0];
        let cmd = "sudo " + delDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh4
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
                setTimeout(() => {
                    resolve();
                }, 500);
            });
    });

    it("Delete tc(traffic control) rules from fan-out", function(resolve) {
        let host = failoverConfig.fanOut[0];
        let cmd = "sudo " + delDropPackets(30, host).join(" && ");

        logger.info("exec command: " + cmd);

        ssh5
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
                setTimeout(() => {
                    resolve();
                }, 10000);
            });
    });

    it("Check balance account1", function(resolve) {
        let account = JSON.parse(process.env["account1"]);
        let balanceAccount = parseFloat(process.env["balanceAccount1"]);
        let keyId = "1";

        let data = SAP_DATA[TYPES.BALANCE]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account.iovSideChainId,
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (err) {
                logger.error(err);
                resolve(err);
            } else {
                if (res && res.error) {
                    logger.error(res);
                }
                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("id");
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.equal(data.type);
                expect(res).to.not.have.ownProperty("error");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("current");
                expect(res.body).to.have.ownProperty("available");
                expect(res.body).to.have.ownProperty("spendingLimit");
                expect(res.body.current).to.equal(balanceAccount);
                expect(res.body.available).to.equal(balanceAccount);

                setTimeout(() => {
                    resolve();
                }, 3000);
            }
        });
    });

    it("Check balance account1", function(resolve) {
        let account = JSON.parse(process.env["account1"]);
        let balanceAccount = parseFloat(process.env["balanceAccount1"]);
        let keyId = "1";

        let data = SAP_DATA[TYPES.BALANCE]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account.iovSideChainId,
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (err) {
                logger.error(err);
                resolve(err);
            } else {
                if (res && res.error) {
                    logger.error(res);
                }
                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("id");
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.equal(data.type);
                expect(res).to.not.have.ownProperty("error");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("current");
                expect(res.body).to.have.ownProperty("available");
                expect(res.body).to.have.ownProperty("spendingLimit");
                expect(res.body.current).to.equal(balanceAccount);
                expect(res.body.available).to.equal(balanceAccount);

                setTimeout(() => {
                    resolve();
                }, 3000);
            }
        });
    });

    it("Check balance account1", function(resolve) {
        let account = JSON.parse(process.env["account1"]);
        let balanceAccount = parseFloat(process.env["balanceAccount1"]);
        let keyId = "1";

        let data = SAP_DATA[TYPES.BALANCE]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account.iovSideChainId,
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (err) {
                logger.error(err);
                resolve(err);
            } else {
                if (res && res.error) {
                    logger.error(res);
                }

                process.env["balanceAccount1"] = res.body.current;

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("id");
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.equal(data.type);
                expect(res).to.not.have.ownProperty("error");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("current");
                expect(res.body).to.have.ownProperty("available");
                expect(res.body).to.have.ownProperty("spendingLimit");
                expect(res.body.current).to.equal(balanceAccount);
                expect(res.body.available).to.equal(balanceAccount);

                setTimeout(() => {
                    resolve();
                }, 1500);
            }
        });
    });

    it("Check balance account2", function(resolve) {
        let account = JSON.parse(process.env["account2"]);
        let balanceAccount = parseFloat(process.env["balanceAccount2"]);
        let keyId = "1";

        let data = SAP_DATA[TYPES.BALANCE]({
            yourIdentityIOVAddress: account.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account.iovSideChainId,
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (err) {
                logger.error(err);
                resolve(err);
            } else {
                if (res && res.error) {
                    logger.error(res);
                }

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("id");
                expect(res).to.have.ownProperty("type");
                expect(res.type).to.equal(data.type);
                expect(res).to.not.have.ownProperty("error");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("current");
                expect(res.body).to.have.ownProperty("available");
                expect(res.body).to.have.ownProperty("spendingLimit");
                expect(res.body.current).to.equal(balanceAccount);
                expect(res.body.available).to.equal(balanceAccount);

                resolve();
            }
        });
    });

    it("Perform trx.", function(resolve) {
        logger.info("Perform trx");

        let account1 = JSON.parse(process.env["account1"]);
        let account2 = JSON.parse(process.env["account2"]);
        let balanceAccount1 = parseFloat(process.env["balanceAccount1"]);
        let balanceAccount2 = parseFloat(process.env["balanceAccount2"]);
        let keyId = "1";

        let data = SAP_DATA[TYPES.TRX]({
            yourIdentityIOVAddress: account1.identity.iovMasterChainId,
            privKey: privKey,
            yourWalletAccountNumber: account1.iovSideChainId,
            counterpartyAccountNumber: account2.iovSideChainId,
            amount: balanceAccount1,
            valuationTime: Date.now(),
            keyId: keyId
        });

        new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
            if (res) {
                if (res.error) {
                    logger.error(res);
                } else {
                    logger.info("- Success trx");
                }
                resolve();
            } else {
                resolve(err);
            }
        });
    });
});
