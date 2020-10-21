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

if (sshConfig.privateKey) {
    sshConfig.privateKey = sshConfig.privateKey.replace("{dirname}", __dirname);
}

let testName = __filename
    .replace(/.*[\/|\\]+/gi, "")
    .replace(/.js$/i, "")
    .replace(/_/gi, " ")
    .toUpperCase();

describe(testName, function() {
    this.timeout(100000);

    var allPassed = true;

    afterEach(function() {
        allPassed = allPassed && this.currentTest.state === "passed";
    });

    after(function(resolve) {
        if (allPassed) {
            resolve();
        } else {
            console.log("TEST FAILED. DELETE IPTABLES RULES");
            allowConnectionBwAhgCbs(resolve);
        }
    });

    it("should send with error", function(resolve) {
        if (failoverConfig.cbs.hosts.length > 1) {
            requests(resolve);
        } else {
            logger.info("Skip test. On this environment only one CBS.");
            this.skip();
        }
    });
});

function requests(resolve) {
    logger.info(`Check transaction rollback if accounts store in different CBS.
    Account A(CBS1) and Account B(CBS2) exsit in IOV and CBSs, but CBS2 has broken connection to all AHG`);

    let accounts = [];

    async.waterfall(
        [
            next => {
                createAccountInEachCbs(next, accounts);
            },
            next => {
                dropConnectionBwAhgCbs(next);
            },
            next => {
                performSapTransactionFromAccountInCbs1ToOther(next, accounts);
            },
            next => {
                allowConnectionBwAhgCbs(next);
            },
            next => {
                checkBalanceIOV(next, accounts);
            },
            next => {
                checkBalanceCbs(next, accounts);
            }
        ],
        err => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
                process.exit(1);
            }
            resolve();
        }
    );
}

function allowConnectionBwAhgCbs(next) {
    async.waterfall(
        [
            done => {
                let host = failoverConfig.cbs.hosts[1];
                let conn = new ssh();

                conn
                    .connect(
                        Object.assign(sshConfig, {
                            host: host
                        })
                    )
                    .then(function() {
                        logger.info(`Connect to ${host} is success.`);
                        done(null, conn);
                    })
                    .catch(function(err) {
                        logger.error(`Connection error to ${host}`, err);
                        done(err);
                    });
            },
            (conn, done) => {
                let cmd =
                    "sudo " + acceptIp(failoverConfig.ahg).join(" && sudo ");

                logger.info("exec command: " + cmd);
                return done();
                conn
                    .execCommand(cmd, {
                        cwd: "/"
                    })
                    .then(function(result) {
                        if (result.stderr) {
                            logger.error(
                                "Can`t execute command. Error: ",
                                result.stderr
                            );
                            return done();
                        }

                        setTimeout(() => done(), 3000);
                    });
            }
        ],
        err => next(err)
    );
}

function dropConnectionBwAhgCbs(next) {
    async.waterfall(
        [
            done => {
                let host = failoverConfig.cbs.hosts[1];
                let conn = new ssh();

                conn
                    .connect(
                        Object.assign(sshConfig, {
                            host: host
                        })
                    )
                    .then(function() {
                        logger.info(`Connect to ${host} is success.`);
                        done(null, conn);
                    })
                    .catch(function(err) {
                        logger.error(`Connection error to ${host}`, err);
                        done(err);
                    });
            },
            (conn, done) => {
                let cmd =
                    "sudo " + dropIp(failoverConfig.ahg).join(" && sudo ");

                logger.info("exec command: " + cmd);
                return done();
                conn
                    .execCommand(cmd, {
                        cwd: "/"
                    })
                    .then(function(result) {
                        if (result.stderr) {
                            logger.error(
                                "Can`t execute command. Error: ",
                                result.stderr
                            );
                            return done();
                        }

                        setTimeout(() => done(), 1000);
                    });
            }
        ],
        err => next(err)
    );
}

function checkBalanceCbs(next, accounts) {
    let account = accounts[0];
    let amount = 98;
    let keyId = "1";

    logger.info("Check CBS balance.");

    cbsApi.setCbsUrl(
        failoverConfig.cbs.api.proto +
            failoverConfig.cbs.hosts[0] +
            ":" +
            failoverConfig.cbs.api.port
    );

    cbsApi["Account"].read({ id: account.id }, function(err, res) {
        if (err) {
            next(err);
        } else {
            expect(res).to.be.an("object");
            expect(res).to.have.ownProperty("body");
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.ownProperty("currentBalance");
            expect(res.body.currentBalance).to.equal(amount);
            next();
        }
    });
}

function checkBalanceIOV(next, accounts) {
    async.eachLimit(
        accounts,
        1,
        (account, nextBalance) => {
            let amount = 100;
            let keyId = "1";

            logger.info("Check balance.");

            let data = SAP_DATA[TYPES.BALANCE]({
                yourIdentityIOVAddress: account.identity.iovMasterChainId,
                privKey: privKey,
                yourWalletAccountNumber: account.iovSideChainId,
                keyId: keyId
            });

            new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
                if (err) {
                    nextBalance(err);
                } else {
                    if (res && res.error) {
                        logger.error(res);
                    }

                    logger.info(res);

                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("id");
                    expect(res.id).to.equal(data.id);
                    expect(res).to.have.ownProperty("type");
                    expect(res.type).to.equal(data.type);
                    expect(res).to.not.have.ownProperty("error");
                    expect(res).to.have.ownProperty("body");
                    expect(res.body).to.have.ownProperty("current");
                    expect(res.body.current).to.equal(amount);

                    nextBalance();
                }
            });
        },
        err => next(err)
    );
}

function performSapTransactionFromAccountInCbs1ToOther(next, accounts) {
    logger.info(
        `Perform SAP transaction from account(CBS1) to accounts from other CBSs.`
    );

    let account1 = accounts[0];
    let dataset = [];
    let trxAmount = 1;
    let keyId = "1";

    async.eachLimit(
        accounts.slice(1),
        1,
        (account2, nextTrx) => {
            let data = SAP_DATA[TYPES.TRX]({
                yourIdentityIOVAddress: account1.identity.iovMasterChainId,
                privKey: privKey,
                yourWalletAccountNumber: account1.iovSideChainId,
                counterpartyAccountNumber: account2.iovSideChainId,
                amount: trxAmount,
                valuationTime: Date.now(),
                keyId: keyId
            });

            new sapTransport(sapUrl).send(JSON.stringify(data), (err, res) => {
                if (err) {
                    nextTrx(err);
                } else {
                    logger.info(res);
                    expect(res).to.be.an("object");
                    expect(res).to.have.ownProperty("id");
                    expect(res.id).to.equal(data.id);
                    expect(res).to.have.ownProperty("type");
                    expect(res.type).to.equal(data.type);
                    expect(res).to.have.ownProperty("error");
                    expect(res).to.have.ownProperty("errorCode");
                    expect(res.errorCode).to.equal(105);

                    nextTrx();
                }
            });
        },
        next
    );
}

function createAccountInEachCbs(next, accounts) {
    let accountInitAmount = 100;

    async.eachLimit(
        failoverConfig.cbs.hosts.slice(0, 2),
        1,
        (cbsHost, nextCbs) => {
            cbsApi.setCbsUrl(
                failoverConfig.cbs.api.proto +
                    cbsHost +
                    ":" +
                    failoverConfig.cbs.api.port
            );
            async.waterfall(
                [
                    done => {
                        logger.info("Create new Bank.");

                        let data = {
                            name: "Bank4Test_" + Date.now(),
                            isIovBank: false
                        };

                        cbsApi["Bank"].сreateNew(data, (err, res) => {
                            if (err) {
                                done(err);
                            } else {
                                expect(res).to.be.an("object");
                                expect(res).to.have.ownProperty("body");
                                expect(res.body).to.be.an("object");
                                expect(res.body).to.have.ownProperty("id");
                                expect(res.body).to.have.ownProperty("name");
                                expect(res.body).to.have.ownProperty("country");
                                expect(res.body).to.have.ownProperty("bic");
                                expect(res.body).to.have.ownProperty("sap");
                                expect(res.body).to.have.ownProperty(
                                    "assetHost"
                                );
                                expect(res.body).to.have.ownProperty(
                                    "blackBox"
                                );

                                //storage.add("BANKS", res.body);

                                done(null, res.body);
                            }
                        });
                    },
                    (bank, done) => {
                        logger.info("Create identity in CBS " + cbsHost);

                        let identity = {
                            bankId: bank.id,
                            firstName: "TestFirstName_" + Date.now(),
                            lastName: "TestLastName_" + Date.now(),
                            phoneNumber: "0991910757",
                            passportNumber: "AA010101",
                            dateOfBirth: "2017-04-13T12:57:36.232Z",
                            nationality: "UA"
                        };

                        cbsApi["Identity"].createNewPrivateIdentity(
                            identity,
                            function(err, res) {
                                if (err) {
                                    done(err);
                                } else {
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.be.an("object");
                                    expect(res.body).to.have.ownProperty("id");
                                    expect(res.body.id).to.be.above(0);

                                    done(null, res.body);
                                }
                            }
                        );
                    },
                    (identity, done) => {
                        logger.info("Create account for identity.");

                        cbsApi["Account"].createNew(
                            {
                                identityId: identity.id,
                                currency: "EUR",
                                currentBalance: accountInitAmount,
                                availableBalance: accountInitAmount,
                                spendingLimit: 0
                            },
                            (err, res) => {
                                if (err) {
                                    done(err);
                                } else {
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.have.ownProperty(
                                        "identity"
                                    );
                                    expect(res.body.identity).to.be.an(
                                        "object"
                                    );
                                    expect(
                                        res.body.identity
                                    ).to.have.ownProperty("id");
                                    expect(res.body.identity.id).to.be.above(0);

                                    accounts.push(res.body);
                                    done(null, res.body);
                                }
                            }
                        );
                    },
                    (account, done) => {
                        logger.info("Request to CBS. Create account QR.");

                        cbsApi["Identity"].createAccountsQR(
                            account.identity,
                            function(err, res) {
                                if (err) {
                                    done(err);
                                } else {
                                    //console.log('CREATE QR RESP', res.body);
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("body");
                                    expect(res.body).to.be.an("object");
                                    expect(res.body).to.have.ownProperty(
                                        "secretKey"
                                    );

                                    done(null, account, res.body.secretKey);
                                }
                            }
                        );
                    },
                    (account, secretKey, done) => {
                        let data = SAP_DATA[TYPES.PUBKEY]({
                            yourIdentityIOVAddress:
                                account.identity.iovMasterChainId,
                            privKey: privKey,
                            pubKey: pubKey,
                            secret: secretKey,
                            keyId: "1"
                        });

                        logger.info("Request to SAP. Add pubkey.");

                        new sapTransport(sapUrl).send(
                            JSON.stringify(data),
                            (err, res) => {
                                if (err) {
                                    done(err);
                                } else {
                                    if (res && res.error) {
                                        logger.error(res);
                                    }
                                    expect(res).to.be.an("object");
                                    expect(res).to.have.ownProperty("id");
                                    expect(res.id).to.equal(data.id);
                                    expect(res).to.have.ownProperty("type");
                                    expect(res.type).to.equal(data.type);
                                    expect(res).to.not.have.ownProperty(
                                        "error"
                                    );
                                    done();
                                }
                            }
                        );
                    }
                ],
                err => nextCbs(err)
            );
        },
        err => next(err)
    );
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
