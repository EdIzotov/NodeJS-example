const uuidV1 = require("uuid/v1");
const crypto = require("crypto");
const TYPES = require(__dirname + "/../api/operationTypes");
const numericUtil = require(__dirname + "/../api/numericUtil");

module.exports = {
    /**
     * Publish client's public key
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.PUBKEY]: function(opts) {
        var uuid = typeof opts.id === "undefined" ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var pubKey = opts.pubKey;
        var secret = opts.secret;
        var keyId = opts.keyId.toString();

        var iv = new Buffer(secret, "base64");
        var key = new Buffer(secret, "base64");
        const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
        var encrypted = cipher.update(pubKey, "base64", "base64");
        encrypted += cipher.final("base64");

        //        var identityBuf = Buffer.from(yourIdentityIOVAddress, 'base64');
        //        var toSignBuf   = Buffer.concat([identityBuf], identityBuf.length);
        //        var yourSignature = signatureRsa(toSignBuf, privKey);

        var yourSignature = signatureRsa(yourIdentityIOVAddress, privKey);

        return {
            id: uuid,
            type: TYPES.PUBKEY,
            body: {
                authData: {
                    identity: yourIdentityIOVAddress,
                    signature: yourSignature,
                    keyId: keyId
                },
                encrypted: encrypted
            }
        };
    },

    /**
     * Remove client's public key
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.REMOVEPUBKEY]: function(opts) {
        var uuid = typeof opts.id === "undefined" ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var pubKey = opts.pubKey;
        var keyId = opts.keyId.toString();
        var keyIdToRemove = opts.keyIdToRemove.toString();

        var yourSignature = signatureRsa(
            yourIdentityIOVAddress + keyId + uuid + TYPES.REMOVEPUBKEY + keyIdToRemove,
            privKey
        );

        return {
            id: uuid,
            type: TYPES.REMOVEPUBKEY,
            body: {
                authData: {
                    identity: yourIdentityIOVAddress,
                    signature: yourSignature,
                    keyId: keyId
                },
                keyId: keyIdToRemove
            }
        };
    },

    /**
     * Get balance
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.BALANCE]: function(opts) {
        var uuid = typeof opts.id === "undefined" ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var yourWalletAccountNumber = opts.yourWalletAccountNumber;
        var keyId = opts.keyId;

        var yourSignature = signatureRsa(
            yourIdentityIOVAddress + keyId + uuid + TYPES.BALANCE + yourWalletAccountNumber,
            privKey
        );

        return {
            id: uuid,
            type: TYPES.BALANCE,
            body: {
                authData: {
                    identity: yourIdentityIOVAddress,
                    signature: yourSignature,
                    keyId: keyId.toString()
                },
                iovAddress: yourWalletAccountNumber
            }
        };
    },

    /**
     * Get BalanceReport
     * New BalanceReport command were introduced in XXX-1324.
     * It designed to check whether balance is the same on each node for account specified.
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.BALANCEREPORT]: function(opts) {
        var uuid = typeof opts.id === "undefined" ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var yourWalletAccountNumber = opts.yourWalletAccountNumber;
        var keyId = opts.keyId;
        var yourSignature = signatureRsa(yourIdentityIOVAddress, privKey);

        return {
            id: uuid,
            type: TYPES.BALANCEREPORT,
            body: {
                authData: {
                    identity: yourIdentityIOVAddress,
                    signature: yourSignature,
                    keyId: keyId.toString()
                },
                iovAddress: yourWalletAccountNumber
            }
        };
    },

    /**
     * Get history
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.HISTORY]: function(opts) {
        var uuid = typeof opts.id === "undefined" ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var yourWalletAccountNumber = opts.yourWalletAccountNumber;
        var from = opts.from; // fromMillisInUTC
        var to = opts.to; // toMillisInUTC
        var limit = opts.limit;
        var keyId = opts.keyId;

        var yourSignature = signatureRsa(
            Buffer.concat([
                new Buffer(yourIdentityIOVAddress),
                new Buffer(keyId),
                new Buffer(uuid),
                new Buffer(TYPES.HISTORY),
                new Buffer(yourWalletAccountNumber),
                new Buffer(numericUtil.convertLong(from)),
                new Buffer(numericUtil.convertLong(to)),
                limit ? new Buffer([limit]): new Buffer([])
            ]), privKey);

        var result = {
            id: uuid,
            type: TYPES.HISTORY,
            body: {
                authData: {
                    identity: yourIdentityIOVAddress,
                    signature: yourSignature,
                    keyId: keyId.toString()
                },
                iovAddress: yourWalletAccountNumber,
                from: from,
                to: to
            }
        };

        if (limit) {
            result.body.limit = limit;
        }

        return result;
    },

    /**
     * Push transaction
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.TRX]: function(opts) {
        var uuid = typeof opts.id === "undefined" ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress;
        var privKey = opts.privKey;
        var from = opts.yourWalletAccountNumber;
        var to = opts.counterpartyAccountNumber;
        var amount = opts.amount;
        var keyId = opts.keyId;
        // var yourSignature = signatureRsa(yourIdentityIOVAddress, privKey);
        var description = opts.description ? opts.description : "";
        var via = opts.correspondentAccountNumber;

        var yourSignature = signatureRsa(
            Buffer.concat([
                new Buffer(yourIdentityIOVAddress),
                new Buffer(keyId),
                new Buffer(uuid),
                new Buffer(TYPES.TRX),
                new Buffer(from),
                new Buffer(to),
                new Buffer(numericUtil.convertDouble(amount)),
                new Buffer(via ? new Buffer(via) : new Buffer([])),
                new Buffer(description ? new Buffer(description) : new Buffer([]))
            ]),
            privKey);

        var result = {
            id: uuid,
            type: TYPES.TRX,
            body: {
                authData: {
                    identity: yourIdentityIOVAddress,
                    signature: yourSignature,
                    keyId: keyId.toString()
                },
                from: from,
                to: to,
                amount: amount
            }
        };

        if (description) {
            result.body.description = description;
        }

        if (via) {
            result.body.via = via;
        }

        return result;
    },

    /**
     * Get status by transactionId
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.TRXSTATUS]: function(opts) {
        var uuid = typeof opts.id === "undefined" ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var transactionId = opts.transactionId;
        var yourWalletAccountNumber = opts.yourWalletAccountNumber;
        var keyId = opts.keyId;
        var useCache = opts.useCache ? opts.useCache : false;
        var yourSignature = signatureRsa(
            Buffer.concat([
                new Buffer(yourIdentityIOVAddress),
                new Buffer(keyId),
                new Buffer(uuid),
                new Buffer(TYPES.TRXSTATUS),
                new Buffer(yourWalletAccountNumber),
                new Buffer(transactionId),
                new Buffer([useCache ? 1 : 0])
            ]),
            privKey
        );      

        return {
            id: uuid,
            type: TYPES.TRXSTATUS,
            body: {
                authData: {
                    identity: yourIdentityIOVAddress,
                    signature: yourSignature,
                    keyId: keyId.toString()
                },
                iovAddress: yourWalletAccountNumber,
                transactionId: transactionId,
                useCache: useCache
            }
        };
    }
};

function signatureRsa(data, privateKey) {
    var signRsaSha256 = crypto.createSign("RSA-SHA256");
    signRsaSha256.write(data);
    signRsaSha256.end();

    return signRsaSha256.sign(privateKey, "base64"); // 'latin1', 'hex' or 'base64'
}