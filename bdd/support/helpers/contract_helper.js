const world = require("../world.js");
const common = require("./common.js");
const { expect } = require("chai");
const uuidV1 = require("uuid/v1");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const crypto = require("crypto");
const scConfig = require("../../../config/smart_contract.json")[
    process.env.NODE_ENV
];
const keyId = "1";

class contractHelper {
    createContract(
        identity,
        signature,
        template,
        contractName,
        version,
        initData
    ) {
        const request = world.getScConn();
        const req = scConfig.api.contractCreate;
        const data = {
            auth: {
                identity: identity.body.iovMasterChainId,
                signature: signature,
                keyId: keyId
            },
            templateAddress: template.templateAddress,
            contractName: contractName, // optional
            templateVersion: version, // optional
            initialData: JSON.stringify(initData),
            requestId: uuidV1()
        };

        return request[req.method](req.path)
            .send(data)
            .then(res => {
                if (res.error) {
                    logger.error(res.text);
                }
                return this.expectContract(
                    common.parseJson(res, "create contract")
                );
            });
    }

    contractEvent(identity, signature, contract, eventData) {
        const request = world.getScConn();
        const req = scConfig.api.contractEvent;
        const data = {
            auth: {
                identity: identity.body.iovMasterChainId,
                signature: signature,
                keyId: keyId
            },
            contractAddress: contract.contractAddress,
            // version: version, // optional
            inputData: JSON.stringify(eventData),
            requestId: uuidV1()
        };

        return request[req.method](req.path)
            .send(data)
            .then(res => {
                if (res.error) {
                    logger.error(res.text);
                }
                return this.expectSuccessEvent(
                    common.parseJson(res, "contract event")
                );
            });
    }

    expectContract(maybeContract) {
        logger.debug(
            "Expect created contract: " + JSON.stringify(maybeContract)
        );
        expect(maybeContract).to.be.an("object");
        expect(maybeContract).to.have.ownProperty("contractAddress");
        expect(maybeContract).to.have.ownProperty("type");
        expect(maybeContract.type).to.equal("ContractCreated");
        return maybeContract;
    }

    expectSuccessEvent(maybeSuccessEvent) {
        logger.debug(
            "Expect contract event successful result: " +
                JSON.stringify(maybeSuccessEvent)
        );
        expect(maybeSuccessEvent).to.be.an("object");
        expect(maybeSuccessEvent).to.have.ownProperty("message");
        expect(maybeSuccessEvent).to.have.ownProperty("type");
        expect(maybeSuccessEvent.message).to.equal("OK");
    }
}

module.exports = new contractHelper();
