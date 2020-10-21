const { expect } = require("chai");
const bankHelper = require("./../../support/helpers/bank_helper.js");
const compositeHelper = require("./../../support/facades/composite_helper.js");
const apiGatewayHelper = require("./../../support/helpers/api_gateway_helper.js");
const identityHelper = require("./../../support/helpers/identity_helper.js");
const accountHelper = require("./../../support/helpers/account_helper.js");
const winston = require("winston");
const fs = require("fs");
const world = require("./../../support/world.js");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const { createLibrary } = require("./../../support/helpers/yadda_helper.js");

const keyRef = "1";
const keyRef2 = ["1", "2"];

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
    .given("we created an account", function() {
        const authIdentity = variables.identity.body.iovMasterChainId;
        return apiGatewayHelper
            .createAccount(authIdentity, keyRef, "2", "1")
            .then(res => {
                //                    logger.info(values);
                variables.account = res;
            });
    })
    .when(
        "we perform the add account owner request to add the created identity as an owner to the created account",
        function() {
            return identityHelper
                .createDefaultIdentity(variables.bank)
                .then(identity => {
                    compositeHelper.createQrCodeAddPubKey(identity);
                    return identity;
                })
                .then(identity => {
                    variables.owner = identity;
                    const authIdentity =
                        variables.identity.body.iovMasterChainId;
                    const owner = identity.body.iovMasterChainId;
                    const account =
                        variables.account.message.data.account_address;
                    return apiGatewayHelper
                        .addOwner(authIdentity, keyRef, account, owner)
                        .then(res => {
                            variables.result = res;
                        });
                });
        }
    )
    .then("the result of the request is successful \\(code $NUM\\)", function(
        statusCode
    ) {
        expect(variables.result.status).to.be.equal(parseInt(statusCode));
    })
    .then(
        "the response contains an “owners” array, which contains the address of the identity we added as an owner to the account",
        function() {
            expect(variables.result.message.data).to.have.ownProperty("owners");
            expect(variables.result.message.data.owners)
                .to.be.an("array")
                .that.include(variables.owner.body.iovMasterChainId);
        }
    );
