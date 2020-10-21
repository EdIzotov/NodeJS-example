
const uuidV1 = require('uuid/v1');
const crypto = require('crypto');
const TYPES = require(__dirname + '/../api/operationTypes');

module.exports = {

    /**
     * Publish client's public key
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.PUBKEY]: function (opts) {

        var uuid = typeof opts.id === 'undefined' ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var pubKey  = opts.pubKey;
        var secret  = opts.secret;
        
        var iv  = new Buffer(secret, 'base64');
        var key = new Buffer(secret, 'base64');
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        var encrypted = cipher.update(pubKey, 'base64', 'base64');
        encrypted += cipher.final('base64');        
        
        var identityBuf = new Buffer(yourIdentityIOVAddress, 'base64');
        var pubKeyBuf   = new Buffer(pubKey, 'base64'); 
        var toSignBuf   = Buffer.concat([identityBuf, pubKeyBuf], identityBuf.length + pubKeyBuf.length);         
        var yourSignature = signatureRsa(toSignBuf, privKey);                
        
        return  {
            "id": uuid,
            "type": TYPES.PUBKEY,
            "body": {
                "authData": {"identity": yourIdentityIOVAddress, "signature": yourSignature},
                "encrypted": encrypted
            }
        };
    },

    /**
     * Get balance
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.BALANCE]: function (opts) {

        var uuid = typeof opts.id === 'undefined' ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var yourWalletAccountNumber = opts.yourWalletAccountNumber;
        
        var identityBuf   = new Buffer(yourIdentityIOVAddress, 'base64');
        var yourWalletBuf = new Buffer(yourWalletAccountNumber, 'base64'); 
        var toSignBuf     = Buffer.concat([identityBuf, yourWalletBuf], identityBuf.length + yourWalletBuf.length);         
        var yourSignature = signatureRsa(toSignBuf, privKey);

        return {
            "id":   uuid,
            "type": TYPES.BALANCE,
            "body": {
                "authData": {
                    "identity": yourIdentityIOVAddress, 
                    "signature": yourSignature
                },
                "iovAddress": yourWalletAccountNumber
            }
        };

    },

    /**
     * Get history
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.HISTORY]: function (opts) {

        var uuid = typeof opts.id === 'undefined' ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var yourWalletAccountNumber = opts.yourWalletAccountNumber;
        var from  = opts.from;             // fromMillisInUTC
        var to    = opts.to;               // toMillisInUTC 
        var limit = opts.limit;
        
        var identityBuf   = new Buffer(yourIdentityIOVAddress,  'base64');
        var yourWalletBuf = new Buffer(yourWalletAccountNumber, 'base64');                
        var fromBuf = Buffer.from(from.toString()); 
        var toBuf   = Buffer.from(to.toString());   
        
        if (limit) {
            var limitBuf = new Buffer(limit.toString());
            var toSignBuf = Buffer.concat([identityBuf, yourWalletBuf, fromBuf, toBuf, limitBuf], identityBuf.length + yourWalletBuf.length + fromBuf.length + toBuf.length + limitBuf.length);            
        } else {
            var toSignBuf = Buffer.concat([identityBuf, yourWalletBuf, fromBuf, toBuf], identityBuf.length + yourWalletBuf.length + fromBuf.length + toBuf.length); 
        }
        
        var yourSignature = signatureRsa(toSignBuf, privKey);

        var result = {
            "id": uuid,
            "type": TYPES.HISTORY,
            "body": {
                "authData": {"identity": yourIdentityIOVAddress, "signature": yourSignature},
                "iovAddress": yourWalletAccountNumber,
                "from": from,
                "to": to
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
    [TYPES.TRX]: function (opts) {

        var uuid = typeof opts.id === 'undefined' ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var from = opts.yourWalletAccountNumber;             // 
        var to = opts.counterpartyAccountNumber;             // 
        var amount = opts.amount;
        var currency = opts.currency ? opts.currency.toUpperCase() : "EUR"; //optional and default is EUR
        var fxCurrency = opts.fxCurrency; //optional 
        var valuationTime = opts.valuationTime;        

        var fromBuf = new Buffer(from, 'base64'); 
        var toBuf   = new Buffer(to, 'base64');             
        var idBuf   = new Buffer(uuid);
        var amountBuf  = new Buffer(Number((amount).toFixed(5))); // RoundingMode.HALF_UP for amount
        var valuationTimeBuf = new Buffer(valuationTime.toString()); 
        var toSignBuf  = Buffer.concat([fromBuf, toBuf, idBuf, amountBuf, valuationTimeBuf], fromBuf.length + toBuf.length + idBuf.length + amountBuf.length, valuationTimeBuf.length);        
        var yourSignature = signatureRsa(toSignBuf, privKey);

        var result = {
            "id": uuid,
            "type": TYPES.TRX,
            "body": {
                "authData": {"identity": yourIdentityIOVAddress, "signature": yourSignature},
                "from": from,
                "to": to,
                "amount": amount,
                "valuationTime": valuationTime //millisInUTC
            }
        };

        if (currency) {
            result.body.currency = currency;
        }

        if (fxCurrency) {
            result.body.fxCurrency = fxCurrency;
        }

        return result;
    },

    /**
     * Get status by transactionId
     * @param {object} opts
     * @returns {object}
     */
    [TYPES.TRXSTATUS]: function (opts) {

        var uuid = typeof opts.id === 'undefined' ? uuidV1() : opts.id;
        var yourIdentityIOVAddress = opts.yourIdentityIOVAddress; // base64
        var privKey = opts.privKey;
        var transactionId = opts.transactionId;
        
        var trxIdBuf    = new Buffer(transactionId); 
        var toSignBuf   = Buffer.concat([trxIdBuf], trxIdBuf.length);         
        var yourSignature = signatureRsa(toSignBuf, privKey);
        var useCache = false;

        return {
            "id": uuid,
            "type": TYPES.TRXSTATUS,
            "body": {
                "authData": {"identity": yourIdentityIOVAddress, "signature": yourSignature},
                "transactionId": transactionId,
                "useCache": useCache
            }
        };

    }


};

function signatureRsa(data, privateKey) {
    var signRsaSha256 = crypto.createSign('RSA-SHA256');
    signRsaSha256.write(data);
    signRsaSha256.end();

    return signRsaSha256.sign(privateKey, 'base64');  // 'latin1', 'hex' or 'base64'
}


