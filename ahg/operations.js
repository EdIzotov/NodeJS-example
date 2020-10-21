const uuidV1 = require("uuid/v1");
const crypto = require("crypto");
const TYPES = require(__dirname + "/../api/operationTypes");

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
    }
};
function signatureRsa(data, privateKey) {
    var signRsaSha256 = crypto.createSign("RSA-SHA256");
    signRsaSha256.write(data);
    signRsaSha256.end();

    return signRsaSha256.sign(privateKey, "base64"); // 'latin1', 'hex' or 'base64'
}
