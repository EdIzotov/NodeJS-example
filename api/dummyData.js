const uuidV1 = require('uuid/v1');
const operations = require(__dirname + '/operations');
const fs = require('fs');
const TYPES = require(__dirname + '/../api/operationTypes');

var privKey = fs.readFileSync(__dirname + '/private.key');
//var pubKey = fs.readFileSync(__dirname + '/public.key');
var cert = fs.readFileSync(__dirname + '/cert.pem');
var pubKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==';

const data = {
    [TYPES.PUBKEY]: operations[TYPES.PUBKEY]({
        id: uuidV1(),
        privKey: privKey,
        pubKey: pubKey,
        secret: 'KQsv9Swx1g0rF74Uk8kDzg==',
        yourIdentityIOVAddress: "CgQIARAAEiw1a2JTRFhZQnMrVnZSZnRrQXVZSU9wdEpmSi9TVDFXNUk3enI1Wmd3eFB3PRgBIAE=", //(new Buffer("100.yourIdentityIOVAddress.100.100").toString('base64'))
        keyId: 1
    }),

    [TYPES.BALANCE]: operations[TYPES.BALANCE]({
        id: uuidV1(),
        privKey: privKey,
        yourIdentityIOVAddress: "CgQIARAAEixYTWxvWXVpbWQ0OE1xWE5lanpNbThjb3MzUXE2VUY5SVFkMll4UU1wRHRvPRgBIAE=", //(new Buffer("100.yourIdentityIOVAddress.100.100").toString('base64')),
        yourWalletAccountNumber: "CgQIAhAAEghhc2Rhc2ZhcxgAIAA=", //(new Buffer("100.yourWalletAccountNumber.100.100").toString('base64'))
        keyId: 1
    }),

    [TYPES.HISTORY]: operations[TYPES.HISTORY]({
        id: uuidV1(),
        privKey: privKey,
        yourIdentityIOVAddress: "CgQIARAAEixYTWxvWXVpbWQ0OE1xWE5lanpNbThjb3MzUXE2VUY5SVFkMll4UU1wRHRvPRgBIAE=", //(new Buffer("100.yourIdentityIOVAddress.100.100").toString('base64')),
        yourWalletAccountNumber: "CgQIAhAAEghhc2Rhc2ZhcxgAIAA=", //(new Buffer("100.yourWalletAccountNumber.100.100").toString('base64'))
        from: (new Date((new Date()).getTime() - (60 * 60 * 24 * 7 * 1000))).getTime(), // last week
        to: (new Date).getTime(),
        limit: 1000,
        keyId: 1
    }),
    [TYPES.TRX]: operations[TYPES.TRX]({
        id: uuidV1(),
        privKey: privKey,
        yourIdentityIOVAddress: "CgQIARAAEixYTWxvWXVpbWQ0OE1xWE5lanpNbThjb3MzUXE2VUY5SVFkMll4UU1wRHRvPRgBIAE=", //(new Buffer("100.yourIdentityIOVAddress.100.100").toString('base64')),
        yourWalletAccountNumber: "CgQIAhAAEghhc2Rhc2ZhcxgAIAA=", //(new Buffer("100.yourWalletAccountNumber.100.100").toString('base64'))
        counterpartyAccountNumber: "CgQIAhAAEghhc2Rhc2ZhcxgAIAA=",
        amount: 1,
        currency: "EUR",
        fxCurrency: "EUR",
        valuationTime: (new Date).getTime(),
        keyId: 1
    }),
    [TYPES.TRXSTATUS]: operations[TYPES.TRXSTATUS]({
        id: uuidV1(),
        privKey: privKey,
        yourIdentityIOVAddress: "CgQIARAAEixYTWxvWXVpbWQ0OE1xWE5lanpNbThjb3MzUXE2VUY5SVFkMll4UU1wRHRvPRgBIAE=", //(new Buffer("100.yourIdentityIOVAddress.100.100").toString('base64')),
        yourWalletAccountNumber: "CgQIAhAAEghhc2Rhc2ZhcxgAIAA=", //(new Buffer("100.yourWalletAccountNumber.100.100").toString('base64'))
        transactionId: "a618d8b3-a94e-456a-8f3f-be75995ad518",
        keyId: 1
    })
};

module.exports = {
    loadtest: JSON.parse(JSON.stringify(data)),
    positive: JSON.parse(JSON.stringify(data)),
    incorrectUUID: (function () {
        var Data1 = JSON.parse(JSON.stringify(data));
        var Data2 = JSON.parse(JSON.stringify(data));
        
        for(var key in Data1) {
            Data1[key].id = "66356cef-5c45-4749-bb58-e03e1f0d00mm"; // incorrect uuid
        }
        
        for(var key in Data2) {
            Data2[key].id = "66356cef-"; // incorrect uuid
        }        
        
        return [Data1, Data2];
    })(),
    requestWithoutId: (function () {
        var Data1 = JSON.parse(JSON.stringify(data));
        var Data2 = JSON.parse(JSON.stringify(data));
        var Data3 = JSON.parse(JSON.stringify(data));
        
        for(var key in Data1) {
            delete Data1[key].id;
        }
        
        for(var key in Data2) {
            Data2[key].id = "";
        }
        
        for(var key in Data3) {
            Data3[key].id = " ";
        }           
        
        return [Data1, Data2, Data3];
    })(),
    invalidJSONrequest: JSON.parse(JSON.stringify(data)), // TODO: need refactoring now broke JSON in Request
    requestWithoutType: (function () {
        var Data1 = JSON.parse(JSON.stringify(data));
        var Data2 = JSON.parse(JSON.stringify(data));
        var Data3 = JSON.parse(JSON.stringify(data));
        var Data4 = JSON.parse(JSON.stringify(data));        
        
        for(var key in Data1) {
            delete Data1[key].type;
        }
        
        for(var key in Data2) {
            Data2[key].type = "";
        }   
        
        for(var key in Data3) {
            Data3[key].type = " ";
        }   
        
        for(var key in Data4) {
            Data4[key].type = "someincorrecttype";
        }           
        
        return [Data1, Data2, Data3, Data4];
    })(),
    requestWithIncorrectBodyContent: (function () {
        var Data1 = JSON.parse(JSON.stringify(data));
        var Data2 = JSON.parse(JSON.stringify(data));
        var Data3 = JSON.parse(JSON.stringify(data));
        var Data4 = JSON.parse(JSON.stringify(data));
        var Data5 = JSON.parse(JSON.stringify(data));
        var Data6 = JSON.parse(JSON.stringify(data));
        
        for(var key in Data1) {
            delete Data1[key].body;
        }
        
        for(var key in Data2) {
            Data2[key].body = "";
        }   
        
        for(var key in Data3) {
            Data3[key].body = " ";
        }   
        
        for(var key in Data4) {
            Data4[key].body = "someincorrectbody";
        }           
 
        for(var key in Data5) {
            Data5[key].body = {};
        }
        
        for (var key in Data6) {
            Data6[key].body = {
                "aaa": {"identity": "yourIdentityIOVAddress", "signature": "yourSignature"},
                "bbb": "someEncryptedWithGivenSecretPublicKey"
            };
        }        
        
        return [Data1, Data2, Data3, Data4, Data5, Data6];
    })(),
};

