const Abstract = require("./abstract.js");
const winston = require("winston");
const async = require("async");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Client extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Client";
    }

    get entityCreate() {
        return "client_create_new_client";
    }

    get entityUnblock() {
        return "client_unblock_one_client";
    }

    get entityAssignRedBox() {
        return "client_assign_red_box";
    }

    get entityUpdateRedBox() {
        return "client_update_red_box_pub_key";
    }

    get entityUpdateRedBox() {
        return "client_update_red_box_pub_key";
    }

    get entityBecomeClient() {
        return "client_become_client";
    }

    get entityDelete() {
        return "client_delete_client";
    }

    сreateNew(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityCreate]) {
                        return done(
                            "Unknown method: " +
                                this.entityCreate +
                                " for tag " +
                                this.entityName
                        );
                    }

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
                                body: entity,
                                iovClient: false,
                                gatewayClient: false
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

    unblock(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityUnblock]) {
                        return done(
                            "Unknown method: " +
                                this.entityUnblock +
                                " for tag " +
                                this.entityName
                        );
                    }

                    logger.debug("Request: ", JSON.stringify(entity));

                    client[this.entityName][this.entityUnblock](
                        {
                            path: entity.id
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
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    assignRedBox(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityAssignRedBox]) {
                        return done(
                            "Unknown method: " +
                                this.entityAssignRedBox +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let data = {
                        id: entity.id,
                        body: {
                            id: entity.id,
                            redBoxId: entity.redBoxId
                        }
                    };

                    logger.debug("Request: ", JSON.stringify(data));

                    client[this.entityName][this.entityAssignRedBox](
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

    redboxUpdate(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityUpdateRedBox]) {
                        return done(
                            "Unknown method: " +
                                this.entityUpdateRedBox +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let data = {
                        id: entity.id,
                        body: {
                            secret: entity.secret,
                            redBoxId: entity.redBoxId
                        }
                    };

                    logger.debug("Request: ", JSON.stringify(data));

                    client[this.entityName][this.entityUpdateRedBox](
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
}

module.exports = new Client();
