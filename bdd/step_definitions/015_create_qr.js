const { expect } = require("chai");
const world = require(__dirname + "/../support/world.js");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

var Yadda = require("yadda");
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;

// Before(function(opts, done) {
//     const request = world.getCbsConn();
//     const req = world.cbsConfig.api.login;

//     const authdata = {
//         username: world.cbsConfig.auth.username,
//         password: world.cbsConfig.auth.password
//     };

//     request[req.method](req.path)
//         .send(authdata)
//         .end((err, res) => {
//             if (err || res.error) {
//                 logger.error(err ? err : res.body);
//             }

//             res = JSON.parse(res.text);

//             expect(res).to.be.an("object");
//             expect(res).to.have.ownProperty("header");
//             expect(res).to.have.ownProperty("body");
//             expect(res.body).to.have.ownProperty("sessionToken");
//             expect(res.header).to.be.an("object");
//             expect(res.header).to.have.ownProperty("response_code");
//             expect(res.header.response_code).to.equal(0);

//             this.cbsSessionToken = res.body.sessionToken;

//             done();
//         });
// });

Given(/^Prepare data for create QR$/, function() {
    this.data = this.identity;
});

When(/^Request to CBS API -> create QR$/, { timeout: 60 * 1000 }, function(
    done
) {
    const request = world.getCbsConn();
    const req = world.cbsConfig.api.createQR;
    const path = req.path.replace("{id}", this.data.id);
    const cbsAuthHeader = world.getCbsAuthHeader();
    const clientToken = world.getCbsClientSessionToken();

    request[req.method](path)
        .set(cbsAuthHeader, clientToken)
        .send({})
        .end((err, res) => {
            if (err) logger.error(err);

            res = JSON.parse(res.text);

            this.qr = res.body;

            done();
        });
});

Then("Check response from create QR", function(done) {
    expect(this.qr).to.be.an("object");
    expect(this.qr).to.have.ownProperty("secretKey");
    done();
});
