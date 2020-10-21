const { expect } = require("chai");
const bankHelper = require("./../../support/helpers/bank_helper.js");
const compositeHelper = require("./../../support/facades/composite_helper.js");
const apiGatewayHelper = require("./../../support/helpers/api_gateway_helper.js");
const identityHelper = require("./../../support/helpers/identity_helper.js");
const accountHelper = require("./../../support/helpers/account_helper.js");
const world = require("./../../support/world.js");

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
    .given("we have already added a public key to this identity", function() {
        return identityHelper
            .generateQrCode(variables.identity)
            .then(qrCode => {
                variables.keyId = qrCode.body.keyId;
                return qrCode.body.secretKey;
            })
            .then(secret => {
                return apiGatewayHelper.addPublicKey(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    world.pubKey,
                    secret
                );
            })
            .then(res => {
                expect(res.status).to.be.equal(200);
            });
    })
    .when(
        "we perform the remove public key request for this identity and this key through the API gateway",
        function() {
            return apiGatewayHelper
                .removePublicKey(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    keyRef
                )
                .then(res => {
                    variables.result = res;
                });
        }
    )
    .then("the result is successful \\(code $NUM\\)", function(statusCode) {
        expect(variables.result.status).to.be.equal(parseInt(statusCode));
    })
    .when(
        "we perform the remove public key request for this identity with a wrong key ID through the API gateway",
        function() {
            const wrongKeyId = "wrong_key_id";
            return apiGatewayHelper
                .removePublicKey(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    wrongKeyId
                )
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
        expect(variables.error).to.be.an("object");
        expect(variables.error.status).to.be.equal(parseInt(errorCode));
    });
