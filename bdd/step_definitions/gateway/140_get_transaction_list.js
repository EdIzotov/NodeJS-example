const { expect, assert } = require("chai");
const common = require("./../../support/helpers/common.js");
const bankHelper = require("./../../support/helpers/bank_helper.js");
const compositeHelper = require("./../../support/facades/composite_helper.js");
const apiGatewayHelper = require("./../../support/helpers/api_gateway_helper.js");
const identityHelper = require("./../../support/helpers/identity_helper.js");
const accountHelper = require("./../../support/helpers/account_helper.js");
const world = require("./../../support/world.js");
const crypto = require("crypto");

const uuidV1 = require("uuid/v1");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const { createLibrary } = require("./../../support/helpers/yadda_helper.js");
const keyRef = "1";

const variables = {};

module.exports = createLibrary()
    .given("we have an identity in the IOV system", function() {
        return bankHelper
            .createDefaultBank()
            .then(bank => {
                variables.bank = bank;
                return identityHelper.createDefaultIdentity(bank);
            })
            .then(identity => {
                return identityHelper.generateQrCode(identity).then(qrCode => {
                    variables.identity = identity;
                    variables.secret = qrCode.body.secretKey;
                });
            });
    })
    .given("we added a public key to this identity", function() {
        return apiGatewayHelper
            .addPublicKey(
                variables.identity.body.iovMasterChainId,
                keyRef,
                world.pubKey,
                variables.secret
            )
            .then(res => {
                expect(res.status).to.be.equal(200);
            });
    })
    .given(
        "we created an account the balance of which is $NUM for account",
        function(amount) {
            return apiGatewayHelper
                .createAccount(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    "2",
                    "0"
                )
                .then(res => {
                    variables.account1 = res.message.data.account_address;
                    return variables.account1;
                })
                .then(account => {
                    apiGatewayHelper
                        .creditAccount(
                            variables.identity.body.iovMasterChainId,
                            keyRef,
                            variables.account1,
                            amount
                        )
                        .then(res => {
                            expect(
                                res.message.data.transaction_details
                            ).to.have.ownProperty("current_balance_change");
                            expect(
                                res.message.data.transaction_details
                                    .current_balance_change
                            ).to.be.equal(amount);
                            expect(
                                res.message.data.transaction_details
                            ).to.have.ownProperty("available_balance_change");
                            expect(
                                res.message.data.transaction_details
                                    .available_balance_change
                            ).to.be.equal(amount);
                        });
                });
        }
    )
    .given(
        "we created an account the balance of which is 0.00 for account 2",
        function() {
            return apiGatewayHelper
                .createAccount(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    "2",
                    "0"
                )
                .then(res => {
                    variables.account2 = res.message.data.account_address;
                    return variables.account2;
                });
        }
    )
    .given("we made the identity the owner of account 1", function() {
        return identityHelper
            .createDefaultIdentity(variables.bank)
            .then(identity => {
                compositeHelper.createQrCodeAddPubKey(identity);
                return identity;
            })
            .then(identity => {
                variables.owner = identity;
                const authIdentity = variables.identity.body.iovMasterChainId;
                const owner = identity.body.iovMasterChainId;
                const account = variables.account1;
                return apiGatewayHelper
                    .addOwner(authIdentity, keyRef, account, owner)
                    .then(res => {
                        expect(res.message.data).to.have.ownProperty("owners");
                        expect(res.message.data.owners)
                            .to.be.an("array")
                            .that.include(owner);
                    });
            });
    })
    .when(
        "we perform $INT transactions from account 1 to account 2 each transferring $NUM assets",
        function(times, amount) {
            variables.limit = parseInt(times);
            variables.transactionIds = [];
            const promises = Array(variables.limit)
                .fill()
                .map(() => {
                    const trxId = uuidV1();
                    variables.transactionIds.push(trxId);
                    return apiGatewayHelper.createTransfer(
                        trxId,
                        variables.owner.body.iovMasterChainId,
                        keyRef,
                        variables.account1,
                        variables.account2,
                        amount
                    );
                });

            return Promise.all(promises).then(function(values) {
                values.forEach(function(element) {
                    expect(element.status).to.be.equal(200);
                    expect(element.message).to.have.ownProperty("data");
                    expect(
                        element.message.data.transaction_details
                            .from_account_address
                    ).to.equal(variables.account1);
                    expect(
                        element.message.data.transaction_details
                            .current_balance_change
                    ).to.equal("-100.0");
                });
            });
        }
    )
    .when(
        "we perform the get transaction list request for account 1 using the created identities key",
        function() {
            const timeFrom = Date.now() - 60 * 60 * 24 * 1000;
            const timeTo = Date.now() + 100000;
            return apiGatewayHelper
                .getTransactionList(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    variables.account1,
                    timeFrom,
                    timeTo,
                    variables.limit
                )
                .then(
                    res => {
                        variables.result = res;
                    },
                    err => {
                        variables.error = err;
                    }
                );
        }
    )
    .then("the result is successful \\(code $NUM\\)", function(statusCode) {
        expect(variables.result.status).to.be.equal(parseInt(statusCode));
    })
    .then(
        "the response contains a $STRING field the value of which is the transaction ID we specified when performing the transaction",
        function(transactionIdField) {
            variables.result.message.data.transactions.forEach(function(
                element
            ) {
                expect(element).to.have.ownProperty(transactionIdField);
                assert(
                    variables.transactionIds.includes(
                        element[transactionIdField]
                    )
                );
            });
        }
    )
    .then(
        "each entity has a $STRING field the value of which is the address of account 1",
        function(fromAccountAddress) {
            variables.result.message.data.transactions.forEach(function(
                element
            ) {
                expect(element).to.have.ownProperty(fromAccountAddress);
                assert(variables.account1 === element[fromAccountAddress]);
            });
        }
    )
    .then(
        "each entity has a $STRING field the value of which is the address of account 2",
        function(toAccountAddress) {
            variables.result.message.data.transactions.forEach(function(
                element
            ) {
                expect(element).to.have.ownProperty(toAccountAddress);
                assert(variables.account2 === element[toAccountAddress]);
            });
        }
    )
    .then(
        "each entity has a $STRING field the value of which is $STRING",
        function(balanceChange, amount) {
            variables.result.message.data.transactions.forEach(function(
                element
            ) {
                expect(element).to.have.ownProperty(balanceChange);
                assert(amount == element[balanceChange]);
            });
        }
    )
    .when(
        "we perform the get transaction list request for account 1 using a non-existing key",
        function() {
            const timeFrom = Date.now() - 60 * 60 * 24 * 1000;
            const timeTo = Date.now() + 100000;
            const wrongPubKey = "wrong_pub_key";
            return apiGatewayHelper
                .getTransactionList(
                    variables.identity.body.iovMasterChainId,
                    wrongPubKey,
                    variables.account1,
                    timeFrom,
                    timeTo,
                    variables.limit
                )
                .then(
                    res => {
                        variables.result = res;
                    },
                    err => {
                        variables.error = err;
                    }
                );
        }
    )
    .then("the result of the request is unsuccessful \\(code $INT\\)", function(
        errorCode
    ) {
        expect(variables.error).to.be.an("object");
        expect(variables.error.status).to.be.equal(parseInt(errorCode));
    });
