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
    .given(
        "we have two identities in the IOV system \\(identity 1 and identity 2\\)",
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
                    return identityHelper.createDefaultIdentity(variables.bank);
                })
                .then(identity => {
                    variables.identities.push(identity);
                });
        }
    )
    .given("we added a public key for both of these identities", function() {
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
    .given("we created an account", function() {
        const authIdentity = variables.identities[0].body.iovMasterChainId;
        return apiGatewayHelper
            .createAccount(authIdentity, keyRef, "2", "1")
            .then(res => {
                //                    logger.info(values);
                variables.account = res;
            });
    })
    .given("we added these identities as owners of this account", function() {
        const authIdentity = variables.identities[0].body.iovMasterChainId;
        const owner = variables.identities[1].body.iovMasterChainId;
        const account = variables.account.message.data.account_address;
        return apiGatewayHelper
            .addOwner(authIdentity, keyRef, account, owner)
            .then(res => {
                expect(res.message.data.owners)
                    .to.be.an("array")
                    .that.include(owner);
                variables.result = res;
            });
    })
    .when(
        "we perform the remove account owner request to remove identity 2 from the owners",
        function() {
            const authIdentity = variables.identities[0].body.iovMasterChainId;
            const owner = variables.identities[1].body.iovMasterChainId;
            const account = variables.account.message.data.account_address;
            return apiGatewayHelper
                .removeOwner(authIdentity, keyRef, account, owner)
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
        "the response contains an “owners” array with 1 entry in it, which is the addresses of identity 1",
        function() {
            expect(variables.result.message.data).to.have.ownProperty("owners");
            expect(variables.result.message.data.owners.length).to.equal(2);
            expect(variables.result.message.data.owners)
                .to.be.an("array")
                .that.include(variables.identities[0].body.iovMasterChainId);
            expect(variables.result.message.data.owners).to.not.include(
                variables.identities[1].body.iovMasterChainId
            );
        }
    );
