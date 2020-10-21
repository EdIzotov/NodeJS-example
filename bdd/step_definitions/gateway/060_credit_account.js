const { expect } = require("chai");
const bankHelper = require("./../../support/helpers/bank_helper.js");
const compositeHelper = require("./../../support/facades/composite_helper.js");
const apiGatewayHelper = require("./../../support/helpers/api_gateway_helper.js");
const identityHelper = require("./../../support/helpers/identity_helper.js");
const accountHelper = require("./../../support/helpers/account_helper.js");

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
                variables.identity = identity;
            });
    })
    .given("we added a public key to this identity", function() {
        return compositeHelper
            .createQrCodeAddPubKey(variables.identity)
            .then(pubKey => {
                variables.pubKey = pubKey;
            });
    })
    .given("we created an account the balance of which is $NUM", function(
        balance
    ) {
        //
        return accountHelper
            .createAccount(
                variables.identity,
                parseInt(balance),
                "accountForTest"
            )
            .then(account => {
                variables.account = account;
                expect(account.body.currentBalance).to.equal(parseInt(balance));
                expect(account.body.availableBalance).to.equal(
                    parseInt(balance)
                );
            });
    })
    .when(
        'we perform the credit account request with the "credit_amount" set to $NUM',
        function(amount) {
            const authIdentity = variables.identity.body.iovMasterChainId;
            const toAccount = variables.account.body.iovSideChainId;

            return apiGatewayHelper
                .creditAccount(authIdentity, keyRef, toAccount, amount)
                .then(res => {
                    variables.result = res;
                });
        }
    )
    .then("the result is successful \\(code $NUM\\)", function(statusCode) {
        expect(variables.result.status).to.be.equal(parseInt(statusCode));
    })
    .then(
        'the response contains a "current_balance_change" field the value of which is $NUM',
        function(currentBalance) {
            expect(
                variables.result.message.data.transaction_details
            ).to.have.ownProperty("current_balance_change");
            expect(
                variables.result.message.data.transaction_details
                    .current_balance_change
            ).to.be.equal(currentBalance);
        }
    )
    .then(
        'the response contains an "available_balance_change" field the value of which is $NUM',
        function(availableBalance) {
            expect(
                variables.result.message.data.transaction_details
            ).to.have.ownProperty("available_balance_change");
            expect(
                variables.result.message.data.transaction_details
                    .available_balance_change
            ).to.be.equal(availableBalance);
        }
    )
    .then(
        'the response contains a "to_account_address" field the value of which is the address of the account we created',
        function() {
            expect(
                variables.result.message.data.transaction_details
            ).to.have.ownProperty("to_account_address");
            expect(
                variables.result.message.data.transaction_details
                    .to_account_address
            ).to.be.equal(variables.account.body.iovSideChainId);
        }
    );
