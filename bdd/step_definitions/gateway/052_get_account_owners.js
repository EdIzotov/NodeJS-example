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

const variables = {};

module.exports = createLibrary()
    .given("we have an identity", function() {
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
        "we created an account the owner of which is this identity",
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
        "we perform the get account owners request through the API gateway using the identity which is the owner of the account",
        function() {
            const authIdentity = variables.identity.body.iovMasterChainId;
            const account = variables.account.message.data.account_address;

            return apiGatewayHelper
                .getOwners(authIdentity, keyRef, account)
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
        "the response contains an “owners” array, which contains the address of the identity created at the beginning of the test",
        function() {
            expect(variables.result.message.data).to.have.ownProperty("owners");
            expect(variables.result.message.data.owners)
                .to.be.an("array")
                .that.include(variables.identity.body.iovMasterChainId);
        }
    )
    .given(
        "we have 2 identities in the IOV system \\(identity 1 and identity 2\\)",
        function() {
            variables.identities = [];
            return bankHelper
                .createDefaultBank()
                .then(bank => {
                    variables.bank = bank;
                    return identityHelper.createDefaultIdentity(bank);
                })
                .then(identity => {
                    variables.identities.push(identity);
                })
                .then(_ => {
                    return identityHelper.createDefaultIdentity(variables.bank);
                })
                .then(identity => {
                    variables.identities.push(identity);
                });
        }
    )
    .given("we added a public key for each identity", function() {
        variables.pubKeys = [];
        const promises = variables.identities.map(element =>
            identityHelper
                .generateQrCode(element)
                .then(qrCode => {
                    variables.keyId = qrCode.body.keyId;
                    return qrCode.body.secretKey;
                })
                .then(secret => {
                    return apiGatewayHelper.addPublicKey(
                        element.body.iovMasterChainId,
                        keyRef,
                        world.pubKey,
                        secret
                    );
                })
                .then(res => {
                    expect(res.status).to.be.equal(200);
                })
        );
        return Promise.all(promises).then(function(values) {
            return values;
        });
    })
    .given(
        "we created an account the owner of which is identity 1",
        function() {
            const authIdentity = variables.identities[0].body.iovMasterChainId;
            return apiGatewayHelper
                .createAccount(authIdentity, keyRef, "2", "1")
                .then(res => {
                    //                    logger.info(res);
                    variables.account = res;
                });
        }
    )
    .when(
        "we perform the get account owners request through the API gateway and sign the request with the key of identity 2",
        function() {
            const authIdentity = variables.identities[1].body.iovMasterChainId;
            const account = variables.account.message.data.account_address;

            return apiGatewayHelper
                .getOwners(authIdentity, keyRef, account)
                .then(
                    _ => {
                        throw "Expect error but success response was returned";
                    },
                    err => {
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
