const Abstract = require("./abstract.js");
const async = require("async");
const winston = require("winston");
const uuidV1 = require("uuid/v1");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const transferSystem = {
    SWIFT: 2,
    SEPA: 3
};

class OldWorld extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Old_World";
    }

    get entityRefill() {
        return "old_world_refill_amount";
    }

    get entityTransfer() {
        return "old_world_transfer_swift_trx";
    }

    get entityWithdraw() {
        return "old_world_withdraw_amount";
    }

    get entitySpendinglimit() {
        return "old_world_spending_limit_trx";
    }

    get entityHoldTrx() {
        return "old_world_hold_trx";
    }

    get entityHoldCancelTrx() {
        return "old_world_hold_cancel_trx";
    }

    get entityHoldDebitTrx() {
        return "old_world_hold_debit_trx";
    }

    holdTrx(account, opts, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityHoldTrx]) {
                        return done(
                            "Unknown method: " +
                                this.entityHoldTrx +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            accountId: account.id,
                            amount: opts.amount,
                            cbsExpiresAt: opts.expiresAt,
                            iovExpiresAt: opts.expiresAt,
                            description: "Test hold trx",
                            iovTransactionId: uuidV1(),
                            periodForIovScheduler: {
                                completed: true
                            },
                            periodForCbsScheduler: {
                                completed: true
                            }
                        }
                    };

                    if (opts.iovTransactionId) {
                        request.body.iovTransactionId = opts.iovTransactionId;
                    }

                    client[this.entityName][this.entityHoldTrx](
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
                        error => done(error.statusText || error)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    holdCancelTrx(opts, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityHoldCancelTrx]) {
                        return done(
                            "Unknown method: " +
                                this.entityHoldCancelTrx +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {}
                    };

                    if (opts.iovTransactionId) {
                        request.body.iovTransactionId = opts.iovTransactionId;
                    }

                    if (opts.cbsTransactionId) {
                        request.body.cbsTransactionId = opts.cbsTransactionId;
                    }

                    client[this.entityName][this.entityHoldCancelTrx](
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
                        error => done(error.statusText || error)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    holdDebitTrx(data, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityHoldDebitTrx]) {
                        return done(
                            "Unknown method: " +
                                this.entityHoldDebitTrx +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            cbsTransactionId: data.cbsTransactionId,
                            iovTransactionId: data.iovTransactionId
                        }
                    };

                    client[this.entityName][this.entityHoldDebitTrx](
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
                        error => done(error.statusText || error)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    changeAccountSpendingLimit(account, opts, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entitySpendinglimit]) {
                        return done(
                            "Unknown method: " +
                                this.entitySpendinglimit +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            accountId: account.id,
                            amount: opts.spendingLimit,
                            description: "Test account spending limit"
                        },
                        id: account.id
                    };

                    client[this.entityName][this.entitySpendinglimit](
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
                        error => done(error.statusText || error)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    transferAmount(account1, account2, opts, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityTransfer]) {
                        return done(
                            "Unknown method: " +
                                this.entityTransfer +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            fromAccountId: account1.id,
                            toAccountId: account2.id,
                            amount: opts.amount,
                            description: opts.description,
                            fromAccountIovTransactionId: opts.fromAccountIovTransactionId
                                ? opts.fromAccountIovTransactionId
                                : uuidV1(),
                            toAccountIovTransactionId: opts.toAccountIovTransactionId
                                ? opts.toAccountIovTransactionId
                                : uuidV1()
                        }
                    };

                    if (opts.iovTransactionId) {
                        request.body.iovTransactionId = opts.iovTransactionId;
                    }

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityTransfer](
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

    refillAmount(account, opts, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityRefill]) {
                        return done(
                            "Unknown method: " +
                                this.entityRefill +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            accountId: account.id,
                            amount: opts.amount,
                            description: opts.description,
                            currency: "EUR"
                        }
                    };

                    if (opts.iovTransactionId) {
                        request.body.iovTransactionId = opts.iovTransactionId;
                    }

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityRefill](
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

module.exports = new OldWorld();
