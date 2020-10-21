const Abstract = require("./abstract.js");
const winston = require("winston");
const async = require("async");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Secrets extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Secret";
    }

    get entityCreate() {
        return "secret_create_new_for_identity";
    }

    сreateSecret(entity, cb) {
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

                    let data = {
                        path: {
                            identityId: entity.identityId
                        },
                        identityId: entity.identityId
                    };

                    logger.debug(JSON.stringify(data, 0, 2));

                    client[this.entityName][this.entityCreate](
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

module.exports = new Secrets();
