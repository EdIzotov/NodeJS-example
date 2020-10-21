const world = require("./../world.js");
const common = require("./common.js");
const { expect } = require("chai");
const uuidV1 = require("uuid/v1");
const winston = require("winston");
const crypto = require("crypto");
const numericUtil = require("./../../../api/numericUtil");

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

const apiGatewayConfig = require("./../../../config/api_gateway.json");

class apiGatewayHelper {
    sendAccountRequest(
        requestId,
        identity,
        keyRef,
        signature,
        data,
        reqMethod,
        reqPath
    ) {
        const request = world.getAPIGatewayConn();

        return request[reqMethod](reqPath)
            .set("XXX-Request-ID", requestId)
            .set("Auth-Identity-Addresses", identity)
            .set("Auth-Identity-Key-References", keyRef)
            .set("Auth-Request-Signatures", signature)
            .send(data)
            .then(res => {
                if (res.error) {
                    throw {
                        status: res.statusCode,
                        errorMessage: res.body
                    };
                } else {
                    return {
                        status: res.statusCode,
                        message: res.body
                    };
                }
            });
    }

    createAccount(authIdentity, keyRef, assetType, assetSubType) {
        const reqId = uuidV1();
        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from("new-account"),
            Buffer.from(reqId),
            Buffer.from(Array.from(assetType)),
            Buffer.from(Array.from(assetSubType))
        ]);
        const signature = common.sign(buffer, world.privKey);

        const data = {
            asset_type: parseInt(assetType),
            asset_subtype: parseInt(assetSubType)
        };

        const req = apiGatewayConfig.api.createAccount;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path
        );
    }

    creditAccount(authIdentity, keyRef, toAccount, amount) {
        const reqId = uuidV1();

        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from("account-credit"),
            Buffer.from(reqId),
            Buffer.from(toAccount),
            Buffer(numericUtil.convertDouble(amount))
        ]);

        const signature = common.sign(buffer, world.privKey);

        const data = {
            to_account_address: toAccount,
            credit_amount: amount
        };

        const req = apiGatewayConfig.api.creditAccount;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path
        );
    }

    addPublicKey(authIdentity, keyRef, publicKey, secret) {
        const reqId = uuidV1();

        const buffer = Buffer.from(authIdentity);

        var encrypted = secret;
        if (secret) {
            var initialVector = Buffer.from(secret, "base64");
            var key = Buffer.from(secret, "base64");
            const cipher = crypto.createCipheriv(
                "aes-128-cbc",
                key,
                initialVector
            );
            encrypted = cipher.update(publicKey, "base64", "base64");
            encrypted += cipher.final("base64");
        }

        const signature = common.sign(buffer, world.privKey);

        const data = {
            identity_provider_callback_url: "",
            new_key_reference: keyRef,
            encrypted_public_key: encrypted,
            credentials_signature: signature
        };

        const req = apiGatewayConfig.api.addPublicKey;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path.replace("{identity_address}", authIdentity)
        );
    }

    removePublicKey(authIdentity, authKeyRef, keyRef) {
        const reqId = uuidV1();

        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(authKeyRef),
            Buffer.from(reqId),
            Buffer.from("removepubkey"),
            Buffer.from(keyRef)
        ]);

        const signature = common.sign(buffer, world.privKey);

        const req = apiGatewayConfig.api.removePublicKey;
        var path = req.path
            .replace("{identity_address}", authIdentity)
            .replace("{key_reference}", keyRef);
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            null,
            req.method,
            path
        );
    }

    getAccountDetails(
        authIdentity,
        keyRef,
        accountAddress,
        privateKey = world.privKey
    ) {
        const reqId = uuidV1();
        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from(reqId),
            Buffer.from("balance"),
            Buffer.from(accountAddress)
        ]);
        const signature = common.sign(buffer, privateKey);

        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            null,
            apiGatewayConfig.api.accountDetails.method,
            apiGatewayConfig.api.accountDetails.path.replace(
                "{account_address}",
                accountAddress
            )
        );
    }

    addOwner(
        authIdentity,
        keyRef,
        accountAddress,
        owner,
        privateKey = world.privKey
    ) {
        const reqId = uuidV1();
        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from("account-new-owner"),
            Buffer.from(reqId),
            Buffer.from(accountAddress),
            Buffer.from(owner)
        ]);
        const signature = common.sign(buffer, privateKey);

        const req = {
            path: apiGatewayConfig.api.addOwner.path.replace(
                "{account_address}",
                accountAddress
            ),
            method: apiGatewayConfig.api.addOwner.method
        };

        const data = {
            owner_address: owner
        };
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path
        );
    }

    getOwners(
        authIdentity,
        keyRef,
        accountAddress,
        privateKey = world.privKey
    ) {
        const reqId = uuidV1();
        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from("account-list-owner"),
            Buffer.from(reqId),
            Buffer.from(accountAddress)
        ]);
        const signature = common.sign(buffer, privateKey);

        const req = {
            path: apiGatewayConfig.api.getOwners.path.replace(
                "{account_address}",
                accountAddress
            ),
            method: apiGatewayConfig.api.getOwners.method
        };

        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            null,
            req.method,
            req.path
        );
    }

    removeOwner(
        authIdentity,
        keyRef,
        accountAddress,
        owner,
        privateKey = world.privKey
    ) {
        const reqId = uuidV1();
        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from("account-remove-owner"),
            Buffer.from(reqId),
            Buffer.from(accountAddress),
            Buffer.from(owner)
        ]);
        const signature = common.sign(buffer, privateKey);

        const req = {
            path: apiGatewayConfig.api.removeOwner.path
                .replace("{account_address}", accountAddress)
                .replace("{owner_address}", owner),
            method: apiGatewayConfig.api.removeOwner.method
        };
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            null,
            req.method,
            req.path
        );
    }

    uploadTemplate(authIdentity, signature, keyRef, file_path, file_hash) {
        const reqId = uuidV1();

        const req = apiGatewayConfig.api.uploadTemplate;
        const request = world.getAPIGatewayConn();

        return request[req.method](req.path)
            .set("XXX-Request-ID", reqId)
            .set("Auth-Identity-Addresses", authIdentity)
            .set("Auth-Identity-Key-References", keyRef)
            .set("Auth-Request-Signatures", signature)
            .field("template_file_hash", file_hash)
            .attach("template_file", file_path)
            .then(res => {
                if (res.error) {
                    throw {
                        status: res.statusCode,
                        errorMessage: res.body
                    };
                } else {
                    return {
                        status: res.statusCode,
                        message: res.body
                    };
                }
            });
    }

    createContract(
        authIdentity,
        signature,
        keyRef,
        templateAddress,
        initData,
        contractName
    ) {
        const reqId = uuidV1();

        var data = {};

        Object.assign(
            data,
            { template_address: templateAddress },
            { initial_data: initData },
            contractName && { contract_name: contractName }
        );

        const req = apiGatewayConfig.api.createContract;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path
        );
    }

    queryContract(authIdentity, keyRef, contractAddress, inputData) {
        const reqId = uuidV1();

        const buffer = Buffer.from(authIdentity);

        const signature = common.sign(buffer, world.privKey);

        const data = {
            input_data: inputData
        };

        const req = apiGatewayConfig.api.queryContract;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path.replace("{contract_address}", contractAddress)
        );
    }

    updateContract(authIdentity, keyRef, contractAddress, inputData) {
        const reqId = uuidV1();

        const buffer = Buffer.from(authIdentity);

        const signature = common.sign(buffer, world.privKey);

        const data = {
            input_data: inputData
        };

        const req = apiGatewayConfig.api.updateContract;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path.replace("{contract_address}", contractAddress)
        );
    }

    createTransfer(
        reqId,
        authIdentity,
        keyRef,
        fromAccount,
        toAccount,
        amount,
        description
    ) {
        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from(reqId),
            Buffer.from("trx"),
            Buffer.from(fromAccount),
            Buffer.from(toAccount),
            Buffer(numericUtil.convertDouble(parseFloat(amount)))
        ]);
        const signature = common.sign(buffer, world.privKey);

        const data = {
            from_account_address: fromAccount,
            to_account_address: toAccount,
            transfer_amount: amount
        };

        const req = apiGatewayConfig.api.createTransfer;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            data,
            req.method,
            req.path
        );
    }

    getTransaction(authIdentity, keyRef, accountAddress, trxId) {
        const reqId = uuidV1();
        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from(reqId),
            Buffer.from("trxstatus"),
            Buffer.from(accountAddress),
            Buffer.from(trxId)
        ]);
        const signature = common.sign(buffer, world.privKey);

        const req = apiGatewayConfig.api.getTransfer;
        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            null,
            req.method,
            req.path
                .replace("{account_address}", accountAddress)
                .replace("{transaction_id}", trxId)
        );
    }

    getTransactionList(
        authIdentity,
        keyRef,
        accountAddress,
        fromTime,
        toTime,
        limit
    ) {
        const reqId = uuidV1();

        const buffer = Buffer.concat([
            Buffer.from(authIdentity),
            Buffer.from(keyRef),
            Buffer.from(reqId),
            Buffer.from("history"),
            Buffer.from(accountAddress),
            Buffer.from(numericUtil.convertLong(fromTime)),
            Buffer.from(numericUtil.convertLong(toTime)),
            Buffer.from([limit])
        ]);

        const signature = common.sign(buffer, world.privKey);

        const req = apiGatewayConfig.api.getTransactionList;
        const path = req.path
            .replace("{account_address}", accountAddress)
            .replace("{select_from}", fromTime)
            .replace("{select_to}", toTime)
            .replace("{select_limit}", limit);

        return this.sendAccountRequest(
            reqId,
            authIdentity,
            keyRef,
            signature,
            null,
            req.method,
            path
        );
    }
}

module.exports = new apiGatewayHelper();
