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

Given(/^Prepare data for addpubkey$/, function(table) {
    let data = table.rowsHash();
    data.yourIdentityIOVAddress = this.identity.iovMasterChainId;
    data.secret = this.qr.secretKey;
    data.pubKey = world.pubKey;
    data.privKey = world.privKey;
    data.keyId = data.keyId.toString();

    this.data = world.sapOperations["addpubkey"](data);
});

When(/^Request to SAP API -> addpubkey$/, function(done) {
    const request = world.getSapConn();

    request.send(JSON.stringify(this.data), (err, res) => {
        if (err) {
            logger.error(err);
        }

        this.res = res;
        done();
    });
});

Then("Check SAP addpubkey response", function() {
    if (this.res && this.res.error) {
        logger.error(this.res);
    }

    expect(this.res).to.be.an("object");
    expect(this.res).to.have.ownProperty("id");
    expect(this.res.id).to.equal(this.data.id);
    expect(this.res).to.have.ownProperty("type");
    expect(this.res.type).to.equal(this.data.type);
    expect(this.res).to.not.have.ownProperty("error");
});
