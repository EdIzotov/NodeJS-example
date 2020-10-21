const { expect } = require("chai");
const bankHelper = require(__dirname + "/../support/helpers/bank_helper.js");
const common = require(__dirname + "/../support/helpers/common.js");
const world = require(__dirname + "/../support/world.js");
const specAsync = require(__dirname + "/../support/spec.js");
const compositeHelper = require(__dirname +
    "/../support/facades/composite_helper.js");
const identityHelper = require(__dirname +
    "/../support/helpers/identity_helper.js");
const accountHelper = require(__dirname +
    "/../support/helpers/account_helper.js");
const templateHelper = require(__dirname +
    "/../support/helpers/template_helper.js");
const contractHelper = require(__dirname +
    "/../support/helpers/contract_helper.js");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const templatePath =
    __dirname +
    "/../../test/data/sc-examples-contracts_2.12-0.2.3-develop.0.jar";
const templateVersion = "1.0.0";

const {createLibrary} = require("../support/helpers/yadda_helper.js")

const variables = {};

module.exports = createLibrary().given(
            "we create new bank, identity, $NUM and $NUM EUR accounts",
            function(accountFromAmount, accountToAmount) {
                const balanceFrom = parseFloat(accountFromAmount);
                const balanceTo = parseFloat(accountToAmount);

                return bankHelper
                    .createDefaultBank()
                    .then(bank => {
                        variables.bank = bank;
                        return identityHelper.createDefaultIdentity(bank);
                    })
                    .then(identity => {
                        variables.identity = identity;
                        variables.signature = common.sign(
                            identity.body.iovMasterChainId,
                            world.privKey
                        );
                        return compositeHelper
                            .createQrCodeAddPubKey(identity)
                            .then(pubKey => {
                                variables.pubKey = pubKey;
                                return identity;
                            });
                    })
                    .then(identity => {
                        return accountHelper
                            .createAccount(identity, balanceFrom, "account1")
                            .then(account => {
                                variables.accountFrom = account;
                                return identity;
                            });
                    })
                    .then(identity => {
                        return accountHelper
                            .createAccount(identity, balanceTo, "account2")
                            .then(account => {
                                variables.accountTo = account;
                            });
                    });
            }
        )

        .given("we upload new contract template", function() {
            return templateHelper
                .uploadTemplate(
                    variables.identity,
                    variables.signature,
                    templatePath,
                    templateVersion
                )
                .then(template => {
                    variables.template = template;
                    return;
                });
        })

        .given("we create new contract instant $STRING", function(
            contractName
        ) {
            const initData = {
                contractAccount: variables.accountFrom.body.iovSideChainId
            };
            function eventuallyCreateContract(createContractCall, expireTimes) {
                return new Promise(function(resolve, reject) {
                    var failResult;
                    function next(times) {
                        // console.log("create contract, i = " + times);
                        if (times >= expireTimes) return reject(failResult);
                        createContractCall()
                            .then(contract => {
                                resolve(contract);
                            })
                            .catch(e => {
                                // console.log("create contract catch: ", e);
                                failResult = e;
                                next(times + 1);
                            });
                    }
                    next(0);
                });
            }
            return eventuallyCreateContract(
                () =>
                    contractHelper.createContract(
                        variables.identity,
                        variables.signature,
                        variables.template,
                        contractName,
                        templateVersion,
                        initData
                    ),
                3
            ).then(contract => {
                variables.contract = contract;
                return;
            });
        })

        .when(
            "we send contract event to trigger new $NUM EUR transaction from contract",
            function(trxAmount) {
                const eventData = {
                    to: variables.accountTo.body.iovSideChainId,
                    amount: parseFloat(trxAmount)
                };
                return contractHelper.contractEvent(
                    variables.identity,
                    variables.signature,
                    variables.contract,
                    eventData
                );
            }
        )

        .when(
            "we send $INT contract events to trigger $NUM EUR transaction from contract",
            function(nEvents, trxAmount) {
                const events = parseInt(nEvents);
                expect(events).to.greaterThan(0);
                const eventData = {
                    to: variables.accountTo.body.iovSideChainId,
                    amount: parseFloat(trxAmount)
                };
                var promises = [];
                var i = 1;
                let pushEvent = interval => {
                    if (i >= events) {
                        clearInterval(interval);
                    }
                    i++;
                    const eventPromise = contractHelper.contractEvent(
                        variables.identity,
                        variables.signature,
                        variables.contract,
                        eventData
                    );
                    promises.push(eventPromise);
                    return eventPromise;
                };

                return new Promise((resolve, reject) => {
                    const interval = setInterval(() => {
                        pushEvent(interval).then(result => {
                            if (i >= events) {
                                resolve("all events were sent successful");
                            }
                        });
                    }, 5);
                }).then(result => {
                    // await of promises are completed
                    return Promise.all(promises);
                });
            }
        )

        .then(
            "eventually accounts balances will changed to $NUM and $NUM on nodes",
            function(accountFromAmount, accountToAmount) {
                variables.expectedBalanceFrom = parseFloat(accountFromAmount);
                variables.expectedBalanceTo = parseFloat(accountToAmount);

                return specAsync
                    .eventually(
                        () =>
                            accountHelper.getCurrentBalance(
                                variables.accountFrom
                            ),
                        variables.expectedBalanceFrom
                    )
                    .then(_ => {
                        return specAsync.eventually(
                            () =>
                                accountHelper.getCurrentBalance(
                                    variables.accountTo
                                ),
                            variables.expectedBalanceTo
                        );
                    });
            }
        )

        .then("eventually accounts balances will changed in bank", function() {
            return specAsync
                .eventually(
                    () =>
                        accountHelper.getCurrentBalanceFromBank(
                            variables.accountFrom
                        ),
                    variables.expectedBalanceFrom
                )
                .then(_ => {
                    return specAsync.eventually(
                        () =>
                            accountHelper.getCurrentBalanceFromBank(
                                variables.accountTo
                            ),
                        variables.expectedBalanceTo
                    );
                });
        });