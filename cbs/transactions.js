const Abstract = require("./abstract.js");
const async = require("async");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Transaction extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Transaction";
    }

    get entityGetOneIovTransaction() {
        return "trx_get_cbs_transaction_by_iov_id";
    }

    getOneIovTransaction(accountId, transactionId, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (
                        !client[this.entityName][
                            this.entityGetOneIovTransaction
                        ]
                    ) {
                        return done(
                            "Unknown method: " +
                                this.entityGetOneIovTransaction +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let request = {
                        body: {
                            transactionId: transactionId,
                            accountId: accountId
                        },
                        transactionId: transactionId,
                        accountId: accountId,
                        path: {
                            transactionId: transactionId,
                            accountId: accountId
                        }
                    };

                    logger.debug("Request: ", JSON.stringify(request));

                    client[this.entityName][this.entityGetOneIovTransaction](
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

module.exports = new Transaction();
