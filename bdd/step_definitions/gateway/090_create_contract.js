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
var runGivenForSteps = { createIdentity: true, signRequest: true };
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
        return apiGatewayHelper
            .createAccount(
                variables.identity.body.iovMasterChainId,
                keyRef,
                "2",
                "0"
            )
            .then(res => {
                variables.contractAccount = res.message.data.account_address;
            });
    })
    .given(
        "we have signed the create contract request with the identities key",
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
        "we have the address of the uploaded contract single template file",
        function() {
            const filePath =
                __dirname +
                "/../../data/qa-single-contract-template_2.12-0.2.3.jar";
            const file = fs.readFileSync(filePath);
            const fileHash = crypto
                .createHash("sha256")
                .update(file)
                .digest("hex");

            return apiGatewayHelper
                .uploadTemplate(
                    variables.identity.body.iovMasterChainId,
                    variables.signature,
                    keyRef,
                    filePath,
                    fileHash
                )
                .then(res => {
                    variables.templateAddress =
                        res.message.data.template_address;
                });
        }
    )
    .given('we have the account address as contract "initialData"', function() {
        const initialData = {
            contractAccountAddress: variables.contractAccount
        };

        variables.initialData = JSON.stringify(initialData);
        return;
    })
    .when(
        "we perform the signed create contract request with template address and contract initial data",
        function() {
            return apiGatewayHelper
                .createContract(
                    variables.identity.body.iovMasterChainId,
                    variables.signature,
                    keyRef,
                    variables.templateAddress,
                    variables.initialData
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
    .then(
        'the response contains a "contract_address" field with a value in it',
        function() {
            expect(variables.result.message.data).to.have.ownProperty(
                "contract_address"
            );
        }
    )
    .given(
        "we have the address of the uploaded contract multi template file",
        function() {
            //TODO Here we use same template, diff is only in that for createContract request contract name is required
            //Other template with multiple contracts inside should be used here
            const filePath =
                __dirname +
                "/../../data/qa-single-contract-template_2.12-0.2.3.jar";
            const file = fs.readFileSync(filePath);
            const fileHash = crypto
                .createHash("sha256")
                .update(file)
                .digest("hex");

            return apiGatewayHelper
                .uploadTemplate(
                    variables.identity.body.iovMasterChainId,
                    variables.signature,
                    keyRef,
                    filePath,
                    fileHash
                )
                .then(res => {
                    variables.templateAddress =
                        res.message.data.template_address;
                });
        }
    )
    .when(
        "we perform the signed create contract request with template address, contract template name and contract initial data.",
        function() {
            const contractName = "QA-SmartContract-API-SingleContractTemplate";
            return apiGatewayHelper
                .createContract(
                    variables.identity.body.iovMasterChainId,
                    variables.signature,
                    keyRef,
                    variables.templateAddress,
                    variables.initialData,
                    contractName
                )
                .then(res => {
                    variables.result = res;
                });
        }
    )
    .when(
        "we perform signed the create contract request with a wrong template address",
        function() {
            const wrongTemplateAddress =
                variables.identity.body.iovMasterChainId; //Here we use address of identity (not a proper template address)
            const contractName = "QA-SmartContract-API-SingleContractTemplate";
            return apiGatewayHelper
                .createContract(
                    variables.identity.body.iovMasterChainId,
                    variables.signature,
                    keyRef,
                    wrongTemplateAddress,
                    variables.initialData,
                    contractName
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
