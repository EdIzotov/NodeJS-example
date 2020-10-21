const Abstract = require("./abstract.js");
const async = require("async");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Identity extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Identity";
    }

    get entityCreate() {
        return "Create_New_Identity";
    }

    get entityRead() {
        return "Get_One_Identity";
    }

    get entityReadIOV() {
        return "identity_get_all_identity_iov_accounts";
    }

    get entitiesRead() {
        return "Get_All_Identities";
    }

    get entityDelete() {
        return "identity_delete_one";
    }

    get entityGetBankOwnIdentities() {
        return "identity_get_bank_own_identities";
    }

    get entityGetBankOwnIdentity() {
        return "identity_get_bank_own_identity";
    }

    get entityCreateNewPrivateIdentity() {
        return "identity_new_private_identity";
    }

    get entityCreateNewCompanyIdentity() {
        return "identity_new_company_identity";
    }

    get entitiesDelete() {
        return "identity_delete_list";
    }

    createNewPrivateIdentity(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (
                        !client[this.entityName][
                            this.entityCreateNewPrivateIdentity
                        ]
                    ) {
                        return done(
                            "Unknown method: " +
                                this.entityCreateNewPrivateIdentity +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: entity,
                        pushToIov: true
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][
                        this.entityCreateNewPrivateIdentity
                    ](
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
                            let err = error.statusText || error;
                            done(err);
                        }
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    createCreateNewCompanyIdentity(entity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (
                        !client[this.entityName][
                            this.entityCreateNewCompanyIdentity
                        ]
                    ) {
                        return done(
                            "Unknown method: " +
                                entityCreateNewCompanyIdentity +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: entity,
                        pushToIov: true
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][
                        this.entityCreateNewCompanyIdentity
                    ](
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
                            let err = error.statusText || error;
                            done(err);
                        }
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    getBankIdentity(bankId, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (
                        !client[this.entityName][this.entityGetBankOwnIdentity]
                    ) {
                        return done(
                            "Unknown method: " +
                                this.entityGetBankOwnIdentity +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: { id: bankId },
                        id: bankId
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityGetBankOwnIdentity](
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

    getBankIdentities(cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (
                        !client[this.entityName][
                            this.entityGetBankOwnIdentities
                        ]
                    ) {
                        return done(
                            "Unknown method: " +
                                this.entityGetBankOwnIdentities +
                                " for tag " +
                                this.entityName
                        );
                    }

                    client[this.entityName][this.entityGetBankOwnIdentities](
                        { body: {} },
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

module.exports = new Identity();
