const Abstract = require("./abstract.js");
const winston = require("winston");
const async = require("async");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Redbox extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Red_Box";
    }

    get entityGet() {
        return "get_all_red_boxs";
    }

    get entitySign() {
        return "red_box_create_signature";
    }

    sign(data, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entitySign]) {
                        return done(
                            "Unknown method: " +
                                this.entitySign +
                                " for tag " +
                                this.entityName
                        );
                    }

                    logger.debug("Request: ", JSON.stringify(data));

                    client[this.entityName][this.entitySign](
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

    getAll(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityGet]) {
                        return done(
                            "Unknown method: " +
                                this.entityGet +
                                " for tag " +
                                this.entityName
                        );
                    }

                    logger.debug("Request: ", JSON.stringify(entity));

                    client[this.entityName][this.entityGet](
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
}

module.exports = new Redbox();
