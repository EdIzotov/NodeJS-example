const { expect } = require("chai");
const common = require("./../../support/helpers/common.js");
const bankHelper = require("./../../support/helpers/bank_helper.js");
const compositeHelper = require("./../../support/facades/composite_helper.js");
const apiGatewayHelper = require("./../../support/helpers/api_gateway_helper.js");
const identityHelper = require("./../../support/helpers/identity_helper.js");
const accountHelper = require("./../../support/helpers/account_helper.js");
const world = require("./../../support/world.js");
const fs = require("fs");
const crypto = require("crypto");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const { createLibrary } = require("./../../support/helpers/yadda_helper.js");
const keyRef = "1";

const variables = {};
var runGivenForSteps = {
    createIdentity: true,
    createdAccount: true,
    uploadTemplate: true,
    createContract: true,
    signRequest: true,
    prepareQuery: true
};

module.exports = createLibrary()
    .given("we have an identity in the IOV system", function() {
        if (runGivenForSteps.createIdentity) {
            runGivenForSteps.createIdentity = false;
            return bankHelper
                .createDefaultBank()
                .then(bank => {
                    variables.bank = bank;
                    return identityHelper.createDefaultIdentity(bank);
                })
                .then(identity => {
                    variables.identity = identity;
                    variables.authIdentity =
                        variables.identity.body.iovMasterChainId;
                    return identity;
                })
                .then(identity =>
                    compositeHelper
                        .createQrCodeAddPubKey(identity)
                        .then(pubKey => {
                            variables.pubKey = pubKey;
                        })
                );
        }
    })
    .given("we created an account for contract", function() {
        if (runGivenForSteps.createdAccount) {
            runGivenForSteps.createdAccount = false;
            return apiGatewayHelper
                .createAccount(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    "2",
                    "0"
                )
                .then(res => {
                    variables.contractAccount =
                        res.message.data.account_address;
                });
        }
    })
    .given("we have the uploaded templates file", function() {
        if (runGivenForSteps.uploadTemplate) {
            runGivenForSteps.uploadTemplate = false;
            const filePath =
                __dirname +
                "/../../data/qa-single-contract-template_2.12-0.2.3.jar";
            const file = fs.readFileSync(filePath);
            const fileHash = crypto
                .createHash("sha256")
                .update(file)
                .digest("hex");

            const uploadSignature = common.sign(
                Buffer.from(variables.identity.body.iovMasterChainId),
                world.privKey
            );

            return apiGatewayHelper
                .uploadTemplate(
                    variables.identity.body.iovMasterChainId,
                    uploadSignature,
                    keyRef,
                    filePath,
                    fileHash
                )
                .then(res => {
                    variables.templateAddress =
                        res.message.data.template_address;
                });
        }
    })
    .given("we have the address of created contract", function() {
        if (runGivenForSteps.createContract) {
            runGivenForSteps.createContract = false;
            const initialData = {
                contractAccountAddress: variables.contractAccount
            };

            const createSignature = common.sign(
                Buffer.from(variables.identity.body.iovMasterChainId),
                world.privKey
            );

            return apiGatewayHelper
                .createContract(
                    variables.identity.body.iovMasterChainId,
                    createSignature,
                    keyRef,
                    variables.templateAddress,
                    JSON.stringify(initialData)
                )
                .then(res => {
                    variables.contractAddress =
                        res.message.data.contract_address;
                });
        }
    })
    .given(
        "we have signed the query contract request with the identities key",
        function() {
            if (runGivenForSteps.signRequest) {
                runGivenForSteps.signRequest = false;
                variables.signature = common.sign(
                    Buffer.from(variables.identity.body.iovMasterChainId),
                    world.privKey
                );
            }
        }
    )
    .given(
        'we have set the $STRING as the requests "input-data" to query contract account address',
        function(queryRequest) {
            if (runGivenForSteps.prepareQuery) {
                runGivenForSteps.prepareQuery = false;
                variables.queryRequest = queryRequest;
            }
        }
    )
    .when(
        "we perform the signed query contract request with input data",
        function() {
            return apiGatewayHelper
                .queryContract(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    variables.contractAddress,
                    variables.queryRequest
                )
                .then(res => {
                    variables.result = res;
                });
        }
    )
    .then("the result is successful \\(code $NUM\\)", function(statusCode) {
        expect(variables.result).to.be.an("object");
        expect(variables.result.status).to.be.equal(parseInt(statusCode));
    })
    .then("the response contains the contract account address", function() {
        expect(variables.result.message.data).to.have.ownProperty(
            "result_data"
        );
        const queryResult = JSON.parse(
            variables.result.message.data.result_data
        );
        expect(queryResult.QueryContractAccountResult.address).to.be.equal(
            variables.contractAccount
        );
    })
    .when(
        "we perform the signed query contract request with input data and a wrong contract address",
        function() {
            const wrongContractAddress = "wrong_address";
            return apiGatewayHelper
                .queryContract(
                    variables.identity.body.iovMasterChainId,
                    keyRef,
                    wrongContractAddress,
                    variables.queryRequest
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
