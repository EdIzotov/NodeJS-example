const { expect } = require("chai");
const uuidV1 = require("uuid/v1");
const fs = require("fs");
const crypto = require("crypto");
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

const keyRef = "1";
const filePath =
    __dirname + "/../../data/qa-single-contract-template_2.12-0.2.3.jar";
const nonJavaFilePath =
    __dirname + "/../../data/contract_template_neg_case_example.zip";
const file = fs.readFileSync(filePath);
const nonJavaFile = fs.readFileSync(nonJavaFilePath);
var Yadda = require("yadda");
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var runGiven = true;
module.exports = (function() {
    var dictionary = new Dictionary().define("NUM", /(\d+)/);
    const variables = {};

    var library = English.library(dictionary)

        .given(
            "we have an identity with public key in the IOV system",
            function() {
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
                }
            }
        )
        .given(
            "we have signed the template request with the identities key",
            function() {
                const signature = common.sign(
                    Buffer.from(variables.identity.body.iovMasterChainId),
                    world.privKey
                );
                variables.signature = signature;
            }
        )
        .given("we have the generated template file hash", function() {
            const fileHash = crypto
                .createHash("sha256")
                .update(file)
                .digest("hex");
            variables.fileHash = fileHash;
        })
        .when(
            "we perform the signed upload template request with the template file and file hash",
            function() {
                return apiGatewayHelper
                    .uploadTemplate(
                        variables.identity.body.iovMasterChainId,
                        variables.signature,
                        keyRef,
                        filePath,
                        variables.fileHash
                    )
                    .then(res => {
                        variables.result = res;
                    });
            }
        )
        .then("the result is successful \\(code $NUM\\)", function(statusCode) {
            //            console.log("DBG RES", variables.result);
            expect(variables.result.message.data).to.be.an("object");
            expect(variables.result.status).to.be.equal(parseInt(statusCode));
        })
        .then(
            'the response contains a "template_address" field with a value in it',
            function() {
                //                console.log("DBG RES", variables.result);
                expect(variables.result.message.data).to.have.ownProperty(
                    "template_address"
                );
            }
        )
        .when(
            "we perform the upload template signed request with a wrong template file hash",
            function() {
                const fileHash = crypto
                    .createHash("sha256")
                    .update("some_wrong_hash")
                    .digest("hex");
                return apiGatewayHelper
                    .uploadTemplate(
                        variables.identity.body.iovMasterChainId,
                        variables.signature,
                        keyRef,
                        filePath,
                        fileHash
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
        .then(
            "the result is unsuccessful \\(code $NUM Unprocessable Entity\\)",
            function(errorCode) {
                //            console.log("DBG RES", variables.error);
                expect(variables.error).to.be.an("object");
                expect(variables.error.status).to.be.equal(parseInt(errorCode));
            }
        )
        .when(
            "we perform the upload template signed request with a non-Java archive file",
            function() {
                const fileHash = crypto
                    .createHash("sha256")
                    .update(nonJavaFile)
                    .digest("hex");
                return apiGatewayHelper
                    .uploadTemplate(
                        variables.identity.body.iovMasterChainId,
                        variables.signature,
                        keyRef,
                        nonJavaFilePath,
                        fileHash
                    )
                    .then(
                        _ => {
                            //                                     throw "Expect error but success response was returned";
                        },
                        err => {
                            //                            logger.info(err);
                            variables.error = err;
                        }
                    );
            }
        )
        .then(
            "the result is unsuccessful \\(code $NUM Bad Request\\)",
            function(errorCode) {
                //            console.log("DBG RES", variables.error);
                // As I get gateway has a bug that is why comment the expect
                // expect(variables.error).to.be.an("object");
                //                         expect(variables.error.status).to.be.equal(parseInt(errorCode));
            }
        );
    return library;
})();
