const world = require("../world.js");
const common = require("./common.js");
const { expect } = require("chai");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const fs = require("fs");
const hashFiles = require("hash-files");
const crypto = require("crypto");
const scConfig = require("../../../config/smart_contract.json")[
    process.env.NODE_ENV
];
const keyId = "1";
const uuidV1 = require("uuid/v1");

class templateHelper {
    uploadTemplate(identity, signature, filePath, version) {
        const templateOptions = {
            algorithm: "sha256",
            files: [filePath]
        };
        const templateHash = hashFiles.sync(templateOptions);
        const request = world.getScConn();
        const req = scConfig.api.uploadTemplate;

        return request[req.method](req.path)
            .field("identity", identity.body.iovMasterChainId)
            .field("keyId", keyId)
            .field("signature", signature)
            .field("version", version)
            .field("requestId", uuidV1())
            .field("fileHash", templateHash)
            .attach("file", filePath)
            .then(res => {
                if (res.error) {
                    logger.error(res.text);
                }
                return this.expectTemplate(
                    common.parseJson(res, "upload template")
                );
            });
    }

    expectTemplate(maybeTemplate) {
        logger.debug(
            "Expect uploaded template: " + JSON.stringify(maybeTemplate)
        );
        expect(maybeTemplate).to.be.an("object");
        expect(maybeTemplate).to.have.ownProperty("templateAddress");
        expect(maybeTemplate).to.have.ownProperty("type");
        return maybeTemplate;
    }
}

module.exports = new templateHelper();
