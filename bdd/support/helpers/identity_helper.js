const world = require("../world.js");
const common = require("./common.js");
const { expect } = require("chai");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class IdentityHelper {
    generateQrCode(identity) {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.createQR;
        const path = req.path.replace("{id}", identity.body.id);
        const cbsAuthHeader = world.getCbsAuthHeader();
        const clientToken = world.getCbsClientSessionToken();

        return request[req.method](path)
            .set(cbsAuthHeader, clientToken)
            .send({})
            .then(res => JSON.parse(res.text));
    }

    addPubKey(identity, qr, keyId) {
        const data = {
            keyId: keyId,
            yourIdentityIOVAddress: identity.body.iovMasterChainId,
            secret: qr.body.secretKey,
            pubKey: world.pubKey,
            privKey: world.privKey
        };

        const pubkey = world.sapOperations["addpubkey"](data);
        const request = world.getSapConn();

        return request.sendWithPromise(JSON.stringify(pubkey));
    }

    removePubKey(identity, keyId) {
        const data = {
            keyId: "1",
            yourIdentityIOVAddress: identity.body.iovMasterChainId,
            pubKey: world.pubKey,
            privKey: world.privKey,
            keyIdToRemove: keyId
        };

        const pubkey = world.sapOperations["removepubkey"](data);
        const request = world.getSapConn();

        return request.sendWithPromise(JSON.stringify(pubkey))
            .then(resp => {
                if(resp.error) {
                    throw resp;
                } else return resp;
            });
    }

    createDefaultIdentity(bank) {
        const data = {
            firstName: "TestIdentity" + Date.now(),
            lastName: "TestIdentity",
            phoneNumber: "0991910757",
            passportNumber: "AA010101",
            dateOfBirth: "2017-04-13T12:57:36.232Z",
            nationality: "UA",
            bankId: bank.body.id
        };

        const request = world.getCbsConn();
        const req = world.cbsConfig.api.createPrivateIdentity;
        const cbsAuthHeader = world.getCbsAuthHeader();
        const clientToken = world.getCbsClientSessionToken();

        return request[req.method](req.path)
            .set(cbsAuthHeader, clientToken)
            .send(data)
            .then(res => JSON.parse(res.text));
    }
}

module.exports = new IdentityHelper();
