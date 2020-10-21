var env = require("node-env-file");
env(__dirname + "/../.env");

const Swagger = require("swagger-client");
const config = require(__dirname + "/../config/cbs.json")[process.env.NODE_ENV];
const testConfig = require(__dirname + "/../config/tests.json");
const fs = require("fs");
const async = require("async");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: process.env.LOG_LEVEL,
            json: false
        })
    ]
});

let useDefaultUserCred = fs.existsSync(__dirname + "/../iov_env.conf");

module.exports = class Abstract {
    constructor() {
        if (new.target === Abstract) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }

        this.abstractMethods = [
            "entityName",
            "entityCreate",
            "entityRead",
            "entitiesRead",
            "entityDelete"
        ];

        this.abstractMethods.forEach(method => {
            if (method === undefined) {
                throw new TypeError("Must override method: " + method);
            }
        });
    }

    static setCbsUrl(cbsUrl) {
        logger.debug("Set CBS url: ", cbsUrl);
        if (cbsUrl.indexOf(config.CBS.swagger) == -1) {
            Abstract.cbsUrl = cbsUrl + config.CBS.swagger;
        } else {
            Abstract.cbsUrl = cbsUrl;
        }
    }

    static getCbsUrl() {
        return Abstract.cbsUrl
            ? Abstract.cbsUrl
            : config.CBS.url[0] + ":" + config.CBS.port + config.CBS.swagger;
    }

    swaggerClient(done) {
        const iovClient = process.env["Client"]
            ? JSON.parse(process.env["Client"])
            : null;

        let client = new Swagger({
            authorizations: {
                someQueryAuth: new Swagger.ApiKeyAuthorization(
                    "withIov",
                    "true",
                    "query"
                )
            },
            timeout: 600000, // 10 min
            url: Abstract.cbsUrl
                ? Abstract.cbsUrl
                : config.CBS.url[0] +
                  ":" +
                  config.CBS.port +
                  config.CBS.swagger,
            success: () => {
                if (iovClient && iovClient.token) {
                    // Login with iovClient token
                    client.clientAuthorizations.add(
                        "api_scheme_name",
                        new Swagger.ApiKeyAuthorization(
                            "X-Access-Token",
                            iovClient.token,
                            "header"
                        )
                    );

                    done(null, client);
                } else {
                    // Login as sales user
                    client["Login"]["login"](
                        {
                            body: {
                                username:
                                    config.CBS.username && !useDefaultUserCred
                                        ? config.CBS.username
                                        : testConfig.defaultCbsCredentials
                                              .username,
                                password:
                                    config.CBS.password && !useDefaultUserCred
                                        ? config.CBS.password
                                        : testConfig.defaultCbsCredentials
                                              .password
                            }
                        },
                        { responseContentType: "application/json" },
                        success => {
                            client.clientAuthorizations.add(
                                "api_scheme_name",
                                new Swagger.ApiKeyAuthorization(
                                    "X-Access-Token",
                                    success.obj.body.sessionToken,
                                    "header"
                                )
                            );

                            done(null, client);
                        },
                        error => {
                            done(error.statusText);
                        }
                    );
                }
            },
            failure: err => {
                logger.debug("Can't connect to CBS");
                done(err);
            }
        });
    }

    swaggerResponse(err, data) {
        logger.debug("Error: ", err, "\n", "Response", data);
    }

    create(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (Array.isArray(entity)) {
                        async.eachLimit(
                            entity,
                            2,
                            (row, next) => {
                                logger.debug("Request: ", JSON.stringify(row));

                                client[this.entityName][this.entityCreate](
                                    {
                                        body: row
                                    },
                                    { responseContentType: "application/json" },
                                    success => {
                                        logger.debug(
                                            "Response: ",
                                            JSON.stringify(success.obj)
                                        );
                                        next();
                                    },
                                    error => {
                                        next(error);
                                    }
                                );
                            },
                            error => done(error)
                        );
                    } else {
                        logger.debug("Request: ", JSON.stringify(entity));

                        client[this.entityName][this.entityCreate](
                            {
                                body: entity
                            },
                            { responseContentType: "application/json" },
                            success => {
                                logger.debug(
                                    "Response: ",
                                    JSON.stringify(success.obj)
                                );
                                done(null, success.obj);
                            },
                            error => done(error.statusText)
                        );
                    }
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    reads(cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entitiesRead]) {
                        return done(
                            "Unknown method: " +
                                this.entitiesRead +
                                " for tag " +
                                this.entityName
                        );
                    }

                    client[this.entityName][this.entitiesRead](
                        {},
                        { responseContentType: "application/json" },
                        success => {
                            logger.debug(
                                "Response: ",
                                JSON.stringify(success.obj)
                            );
                            done(null, success.obj);
                        },
                        error => done(error.statusText)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }
    /**
     * Get one enity by id
     * @param {object} data {id: int}
     * @param {function} cb
     */
    read(data, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityRead]) {
                        return done(
                            "Unknown method: " +
                                this.entityRead +
                                " for tag " +
                                this.entityName
                        );
                    }

                    client[this.entityName][this.entityRead](
                        data,
                        { responseContentType: "application/json" },
                        success => {
                            logger.debug(
                                "Response: ",
                                JSON.stringify(success.obj)
                            );
                            done(null, success.obj);
                        },
                        error => done(error.statusText)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    readIOV(data, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityReadIOV]) {
                        return done(
                            "Unknown method: " +
                                this.entityReadIOV +
                                " for tag " +
                                this.entityName
                        );
                    }

                    logger.debug("Request: ", JSON.stringify(data));

                    client[this.entityName][this.entityReadIOV](
                        data,
                        { responseContentType: "application/json" },
                        success => {
                            logger.debug(
                                "Response: ",
                                JSON.stringify(success.obj)
                            );
                            done(null, success.obj);
                        },
                        error => {
                            done(error.statusText);
                        }
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    delete(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    let request = {
                        //body: entity,
                        path: entity.id,
                        id: entity.id
                    };

                    logger.debug("Delete request: ", request);

                    client[this.entityName][this.entityDelete](
                        request,
                        { responseContentType: "application/json" },
                        success => {
                            logger.debug(
                                "Response: ",
                                JSON.stringify(success.obj)
                            );
                            done(null, success.obj);
                        },
                        error => {
                            let err =
                                error.statusText || error || "Error delete";
                            done(err);
                        }
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    deleteList(entities, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entitiesDelete]) {
                        return done(
                            "Unknown method: " +
                                this.entitiesDelete +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            ids: entities.map((v, k) => v.id)
                        }
                    };

                    logger.debug("Request: ", request);

                    client[this.entityName][this.entitiesDelete](
                        request,
                        { responseContentType: "application/json" },
                        success => {
                            logger.debug(
                                "Response: ",
                                JSON.stringify(success.obj)
                            );
                            done(null, success.obj);
                        },
                        error => done(error.statusText)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }
};
