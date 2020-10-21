const { expect } = require("chai");
const bankHelper = require("./../../support/helpers/bank_helper.js");
const compositeHelper = require("./../../support/facades/composite_helper.js");
const apiGatewayHelper = require("./../../support/helpers/api_gateway_helper.js");
const identityHelper = require("./../../support/helpers/identity_helper.js");
const accountHelper = require("./../../support/helpers/account_helper.js");
const winston = require("winston");
const fs = require("fs");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const { createLibrary } = require("./../../support/helpers/yadda_helper.js");
const wrongPrivKey = fs.readFileSync(
    __dirname + "/../../../test/data/private2.key"
);
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
    .given("we added a public key for this identity", function() {
        return compositeHelper
            .createQrCodeAddPubKey(variables.identity)
            .then(pubKey => {
                variables.pubKey = pubKey;
            });
    })
    .given(
        "created an account the owner of which is this identity",
        function() {
            const authIdentity = variables.identity.body.iovMasterChainId;
            return apiGatewayHelper
                .createAccount(authIdentity, keyRef, "2", "1")
                .then(res => {
                    //                    logger.info(values);
                    variables.account = res;
                });
        }
    )
    .when(
        "we perform the get account details request through the API gateway",
        function() {
            const authIdentity = variables.identity.body.iovMasterChainId;
            const account = variables.account.message.data.account_address;

            return apiGatewayHelper
                .getAccountDetails(authIdentity, keyRef, account)
                .then(res => {
                    variables.result = res;
                });
        }
    )
    .then("the result of the request is successful \\(code $NUM\\)", function(
        statusCode
    ) {
        expect(variables.result.status).to.be.equal(parseInt(statusCode));
    })
    .then(
        'the response contains a "current_balance" field with a value in it',
        function() {
            expect(variables.result.message.data).to.have.ownProperty(
                "current_balance"
            );
            expect(
                parseFloat(variables.result.message.data.current_balance)
            ).to.be.a("number");
        }
    )
    .then(
        'the response contains a "available_balance" field with a value in it',
        function() {
            expect(variables.result.message.data).to.have.ownProperty(
                "available_balance"
            );
            expect(
                parseFloat(variables.result.message.data.available_balance)
            ).to.be.a("number");
        }
    )
    .when(
        "we perform the get account details request through the API gateway and sign the request with a non-existing key",
        function() {
            const authIdentity = variables.identity.body.iovMasterChainId;
            const accountAddress =
                variables.account.message.data.account_address;

            return apiGatewayHelper
                .getAccountDetails(
                    authIdentity,
                    keyRef,
                    accountAddress,
                    wrongPrivKey
                )
                .then(
                    _ => {
                        throw "Expect error but success response was returned";
                    },
                    err => {
                        //                            logger.info(err);
                        variables.error = err;
                    }
                );
        }
    )

    .when(
        "we perform the get account details request through the API gateway with specifying a non-existing account address, but providing a correct signature",
        function() {
            const authIdentity = variables.identity.body.iovMasterChainId;
            const account = "NonExistingAccount";

            return apiGatewayHelper
                .getAccountDetails(authIdentity, keyRef, account)
                .then(
                    _ => {
                        throw "Expect error but success response was returned";
                    },
                    err => {
                        //                            logger.info(err);
                        variables.error = err;
                    }
                );
        }
    )
    .then("the result is unsuccessful \\(code $INT\\)", function(errorCode) {
        //            console.log("DBG RES", variables.error);
        expect(variables.error).to.be.an("object");
        expect(variables.error.status).to.be.equal(parseInt(errorCode));
    });
