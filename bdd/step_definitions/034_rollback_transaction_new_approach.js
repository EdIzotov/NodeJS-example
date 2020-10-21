"use strict";

const { expect } = require("chai");
const bankHelper = require(__dirname + "/../support/helpers/bank_helper.js");
const compositeHelper = require(__dirname +
    "/../support/facades/composite_helper.js");
const identityHelper = require(__dirname +
    "/../support/helpers/identity_helper.js");
const accountHelper = require(__dirname +
    "/../support/helpers/account_helper.js");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const {createLibrary} = require("../support/helpers/yadda_helper.js")

const variables = {};

module.exports = createLibrary().given("we create a new bank \\(with default data\\)", function() {
            return bankHelper
                .createDefaultBank()
                .then(res => (variables.bank = res));
        })

        .given(
            "we create 2 new identities \\(with default data\\)",
            function() {
                return identityHelper
                    .createDefaultIdentity(variables.bank)
                    .then(res1 => {
                        variables.identity1 = res1;
                    })
                    .then(_ => {
                        return identityHelper
                            .createDefaultIdentity(variables.bank)
                            .then(res2 => {
                                variables.identity2 = res2;
                            });
                    });
            }
        )

        .given(
            "we create new account \\(with default data\\) with balance of $NUM EUR for identity 1",
            function(amount) {
                return accountHelper
                    .createAccount(variables.identity1, parseFloat(amount))
                    .then(account => {
                        //throw "error";
                        variables.account1 = account;
                    });
            }
        )

        .given(
            "we create new account \\(with default data\\) with balance of $NUM EUR for identity 2",
            function(amount) {
                return accountHelper
                    .createAccount(variables.identity2, parseFloat(amount))
                    .then(account => {
                        variables.account2 = account;
                    });
            }
        )

        .when(
            "we send transaction from account 1 to account 2 with description $STRING \\(that causes rollback\\)",
            function(description) {
                var flow = this.flow;
                function skipIf1NodeOnly(account) {
                    return accountHelper
                        .getBalanceFromAllNodes(account)
                        .then(result => {
                            if (result.body.entries.length == 1) {
                                flow.scenario = "skip";
                                return;
                            } else return;
                        });
                }

                return compositeHelper
                    .createQrCodeAddPubKeyAndMakeTransaction(
                        variables.identity1,
                        variables.account1,
                        variables.account2,
                        99,
                        description
                    )
                    .then(result => {
                        variables.transaction = result;
                        return skipIf1NodeOnly(variables.account1);
                    });
            }
        )

        .then("transaction is failed with error code $INT", function(
            errorCode
        ) {
            expect(variables.transaction.errorCode).to.equal(
                parseInt(errorCode)
            );
        })

        .then(
            "balance on account 1 in IOV system is $NUM EUR on all nodes",
            function(balance) {
                return accountHelper
                    .getBalanceFromAllNodes(variables.account1)
                    .then(result => {
                        result.body.entries.forEach((item, _1, _2) => {
                            expect(item.current).to.equal(parseInt(balance));
                            expect(item.available).to.equal(parseInt(balance));
                        });
                    });
            }
        )

        .then(
            "balance on account 2 in IOV system is $NUM EUR on all nodes",
            function(balance) {
                return compositeHelper
                    .addQrPubkeyAndGetBalanceFromAllNodes(
                        variables.identity2,
                        variables.account2
                    )
                    .then(result => {
                        result.body.entries.forEach((item, _1, _2) => {
                            expect(item.current).to.equal(parseInt(balance));
                            expect(item.available).to.equal(parseInt(balance));
                        });
                    });
            }
        )

        .then("balance on account 1 in bank is $NUM EUR", function(balance) {
            return accountHelper
                .getAccount(variables.account1.body.id)
                .then(account => {
                    expect(account.body.currentBalance).to.equal(
                        parseInt(balance)
                    );
                    expect(account.body.availableBalance).to.equal(
                        parseInt(balance)
                    );
                });
        })

        .then("balance on account 2 in bank is $NUM EUR", function(balance) {
            return accountHelper
                .getAccount(variables.account2.body.id)
                .then(account => {
                    expect(account.body.currentBalance).to.equal(
                        parseInt(balance)
                    );
                    expect(account.body.availableBalance).to.equal(
                        parseInt(balance)
                    );
                });
        });