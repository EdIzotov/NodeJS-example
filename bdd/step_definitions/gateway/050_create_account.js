const { expect } = require("chai");
const uuidV1 = require("uuid/v1");
const bankHelper = require("./../../support/helpers/bank_helper.js");
const common = require("./../../support/helpers/common.js");
const world = require("./../../support/world.js");
const specAsync = require("./../../support/spec.js");
const compositeHelper = require("./../../support/facades/composite_helper.js");
const apiGatewayHelper = require("./../../support/helpers/api_gateway_helper.js");
const identityHelper = require("./../../support/helpers/identity_helper.js");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const { createLibrary } = require("./../../support/helpers/yadda_helper.js");

const keyRef = "1";

var runGiven = true;
const variables = {};
module.exports = createLibrary()
    .given("we have an identity in the IOV system", function() {
        if (runGiven) {
            runGiven = false;
            return bankHelper
                .createDefaultBank()
                .then(bank => {
                    variables.bank = bank;
                    return identityHelper.createDefaultIdentity(bank);
                })
                .then(identity => {
                    variables.identity = identity;
                    return compositeHelper
                        .createQrCodeAddPubKey(identity)
                        .then(pubKey => {
                            variables.pubKey = pubKey;
                            return identity;
                        });
                })
                .then(authIdentity => {
                    variables.identity = authIdentity;
                });
        } else {
            return variables;
        }
    })
    .when(
        "we perform the create account request through the API gateway with asset type $INT and with each available asset sub-type",
        function(assetType) {
            const authIdentity = variables.identity.body.iovMasterChainId;
            const assetSubTypes = ["0", "1", "2", "3", "4", "5", "6"];
            const promises = assetSubTypes.map(assetSubType =>
                apiGatewayHelper.createAccount(
                    authIdentity,
                    keyRef,
                    assetType,
                    assetSubType
                )
            );

            return Promise.all(promises).then(function(values) {
                //                logger.info(values);
                variables.result = values;
            });
        }
    )
    .then("the result of each request is successful \\(code $INT\\)", function(
        statusCode
    ) {
        variables.result.forEach(function(element) {
            expect(element.message.data).to.be.an("object");
            expect(element.status).to.be.equal(parseInt(statusCode));
        });
    })
    .then(
        'response contains a "account_address" field with a value in it',
        function() {
            variables.result.forEach(function(element) {
                expect(element.message.data).to.have.ownProperty(
                    "account_address"
                );
            });
        }
    )
    .when(
        "we perform the create account request through the API gateway with specifying asset type $INT and a non-existent asset sub-type",
        function(assetType) {
            const authIdentity = variables.identity.body.iovMasterChainId;

            return apiGatewayHelper
                .createAccount(authIdentity, keyRef, assetType, "100000")
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
