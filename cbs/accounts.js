const Abstract = require("./abstract.js");
const async = require("async");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Account extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Account";
    }

    get entityCreate() {
        return "account_create_new";
    }

    get entityRead() {
        return "account_get";
    }

    get entitiesRead() {
        return "account_get_all";
    }

    get entityDelete() {
        return "account_delete";
    }

    get entityBlockAccount() {
        return "account_block";
    }

    get entityUnblockAccount() {
        return "account_unblock";
    }

    get entityAddAccountOwner() {
        return "account_add_owner";
    }

    get entityRemoveAccountOwner() {
        return "account_remove_owner";
    }

    get entityLinkAccount() {
        return "account_link";
    }

    get entityCreateNew() {
        return "account_create_new";
    }

    /**
     * Old method create was deprecated
     * new has newModel and operationnsId
     */
    createNew(entity, cb) {
        logger.debug("Request: ", JSON.stringify(entity));

        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityCreateNew]) {
                        return done(
                            "Unknown method: " +
                                this.entityCreateNew +
                                " for tag " +
                                this.entityName
                        );
                    }

                    client[this.entityName][this.entityCreateNew](
                        {
                            body: entity,
                            pushToIov: true
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
            cb
        );
    }

    linkAccount(vostro, nostro, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityLinkAccount]) {
                        return done(
                            "Unknown method: " +
                                this.entityLinkAccount +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            accountId: vostro.id,
                            nostroAccount: nostro.iovSideChainId,
                            description:
                                "Test link VOSTRO to BANK id = " +
                                nostro.identity.bank.id +
                                " NOSTRO"
                        },
                        id: vostro.id
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityLinkAccount](
                        request,
                        {
                            responseContentType: "application/json"
                        },
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

    blockAccount(account, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityBlockAccount]) {
                        return done(
                            "Unknown method: " +
                                this.entityBlockAccount +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            account: account.iovSideChainId,
                            description: "Test block account"
                        },
                        id: account.id
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityBlockAccount](
                        request,
                        {
                            responseContentType: "application/json"
                        },
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

    unblockAccount(account, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityUnblockAccount]) {
                        return done(
                            "Unknown method: " +
                                this.entityUnblockAccount +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            account: account.iovSideChainId,
                            description: "Test block account"
                        },
                        id: account.id
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityUnblockAccount](
                        request,
                        {
                            responseContentType: "application/json"
                        },
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

    addAccountOwner(account, identity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityAddAccountOwner]) {
                        return done(
                            "Unknown method: " +
                                this.entityAddAccountOwner +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            accountId: account.id,
                            identityId: identity.id,
                            description: "Test add account owner"
                        },
                        id: account.id
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityAddAccountOwner](
                        request,
                        {
                            responseContentType: "application/json"
                        },
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

    removeAccountOwner(account, identity, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (
                        !client[this.entityName][this.entityRemoveAccountOwner]
                    ) {
                        return done(
                            "Unknown method: " +
                                this.entityRemoveAccountOwner +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            accountId: account.id,
                            identityId: identity.id,
                            description: "Test block account"
                        },
                        id: account.id
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityRemoveAccountOwner](
                        request,
                        {
                            responseContentType: "application/json"
                        },
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

module.exports = new Account();
