const Abstract = require("./abstract.js");
const winston = require("winston");
const async = require("async");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Bank extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Bank";
    }

    get entityNew() {
        return "bank_create_new_bank";
    }

    сreateNew(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityNew]) {
                        return done(
                            "Unknown method: " +
                                this.entityNew +
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

                                client[this.entityName][this.entityNew](
                                    {
                                        body: row,
                                        pushToIovFlag: true,
                                        clientId: entity.client.id
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

                        client[this.entityName][this.entityNew](
                            {
                                body: entity,
                                pushToIovFlag: true,
                                clientId: entity.client.id
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

    get entityRead() {
        return "Get_One_Bank";
    }

    get entitiesRead() {
        return "bank_get_all";
    }

    get entityDelete() {
        return "Delete_One_Bank";
    }

    get entitiesDelete() {
        return "bank_delete_list_banks";
    }
}

module.exports = new Bank();
