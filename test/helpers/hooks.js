require("node-env-file")(__dirname + "/../../.env");
// switch off check ssl certificate
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
global.assert = require("assert");

const asyncOnExit = require("async-on-exit");
const fs = require("fs");
const async = require("async");
const chai = require("chai");
const expect = chai.expect;
const storage = require(__dirname + "/../data/storage");
const cbsApi = require(__dirname + "/../../cbs");
const cbsConfig = require(__dirname + "/../../config/cbs.json")[
    process.env.NODE_ENV
];
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
let isRunning = false;

beforeEach(function() {
    if (fs.existsSync(__dirname + "/../../iov_env.conf")) {
        require("node-env-file")(__dirname + "/../../iov_env.conf");
        cbsApi.setCbsUrl("http://" + process.env.cbs_host);
    } else {
        cbsApi.setCbsUrl(
            cbsConfig.CBS.url[0] +
                ":" +
                cbsConfig.CBS.port +
                cbsConfig.CBS.swagger
        );
    }
});

before(function() {
    // global hook before all
});

after(function(resolve) {
    // global hook after all
    this.timeout(300000);
    if (process.env.DELETE_ENTITIES == true && !isRunning) {
        deleteEntities(resolve);
    }
});

asyncOnExit(function() {
    return new Promise(function(resolve, reject) {
        if (process.env.DELETE_ENTITIES == true && !isRunning) {
            deleteEntities(resolve);
        }
    });
}, true);

function deleteEntities(resolve) {
    isRunning = true;
    async.waterfall(
        [
            done => {
                logger.info("Delete identities created for test.");

                let identities = storage.get("IDENTITIES");

                async.eachLimit(
                    identities,
                    1,
                    (identity, next) => {
                        logger.info(
                            `Delete Identity from CBS ${identity.cbsUrl}.`
                        );

                        cbsApi.setCbsUrl(identity.cbsUrl);

                        cbsApi["Identity"].deleteList(
                            [identity],
                            (err, res) => {
                                if (err) {
                                    return next(err);
                                }

                                next();
                            }
                        );
                    },
                    done
                );
            },
            done => {
                logger.info("Delete banks created for test.");
                let banks = storage.get("BANKS");
                async.eachLimit(
                    banks,
                    1,
                    (bank, next) => {
                        logger.info(`Delete bank from CBS ${bank.cbsUrl}.`);
                        cbsApi.setCbsUrl(bank.cbsUrl);
                        cbsApi["Bank"].deleteList([bank], (err, res) => {
                            if (err) {
                                return next(err);
                            }

                            next();
                        });
                    },
                    done
                );
            },
            done => {
                logger.info("Delete client created for test.");
                let clients = storage.get("CLIENTS");

                async.eachLimit(
                    clients,
                    1,
                    (client, next) => {
                        logger.info(
                            `Delete client from CBS clientId: ${client.id}.`
                        );

                        cbsApi["Client"].delete(client, (err, res) => {
                            if (err) {
                                return next(err);
                            }

                            next();
                        });
                    },
                    done
                );
            }
        ],
        (err, result) => {
            if (err) {
                logger.error("REQUEST ERROR: ", err);
            }
            resolve();
        }
    );
}
