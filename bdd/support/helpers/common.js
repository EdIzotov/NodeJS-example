const world = require("../world.js");
const { expect } = require("chai");
const crypto = require("crypto");

class Common {
    getCbsSessionToken() {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.login;

        const authdata = {
            username: world.cbsConfig.auth.username,
            password: world.cbsConfig.auth.password
        };

        return request[req.method](req.path)
            .send(authdata)
            .then(res => {
                res = JSON.parse(res.text);

                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("header");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.have.ownProperty("sessionToken");
                expect(res.header).to.be.an("object");
                expect(res.header).to.have.ownProperty("response_code");
                expect(res.header.response_code).to.equal(0);

                return res.body.sessionToken;
            });
    }

    sign(data, privateKey) {
        var signRsaSha256 = crypto.createSign("RSA-SHA256");
        signRsaSha256.write(data);
        signRsaSha256.end();

        return signRsaSha256.sign(privateKey, "base64"); // 'latin1', 'hex' or 'base64'
    }

    parseJson(res, operation = "") {
        try {
            return JSON.parse(res.text);
        } catch (error) {
            throw "Can't parse " + operation + " response: " + res.text;
        }
    }
}

module.exports = new Common();
