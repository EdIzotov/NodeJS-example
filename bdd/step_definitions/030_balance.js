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

Given(/^Prepare data for balance$/, function(table) {
    let data = table.rowsHash();
    data.yourIdentityIOVAddress = this.accounts[0].identity.iovMasterChainId;
    data.privKey = world.privKey;
    data.yourWalletAccountNumber = this.accounts[0].iovSideChainId;
    data.keyId = data.keyId.toString();

    this.balance = parseFloat(data.balance);

    this.data = world.sapOperations["balance"](data);
});

When(/^Request to SAP API -> balance$/, { timeout: 60 * 1000 }, function(done) {
    const request = world.getSapConn();

    request.send(JSON.stringify(this.data), (err, res) => {
        if (err) {
            logger.error(err);
        }

        this.res = res;
        done();
    });
});

Then("Check SAP balance response", function() {
    if (this.res && this.res.error) {
        logger.error(this.res);
    }

    expect(this.res).to.have.ownProperty("id");
    expect(this.res.id).to.equal(this.data.id);
    expect(this.res).to.have.ownProperty("type");
    expect(this.res.type).to.equal(this.data.type);
    expect(this.res).to.not.have.ownProperty("error");
    expect(this.res).to.have.ownProperty("body");
    expect(this.res.body).to.have.ownProperty("current");
    expect(this.res.body).to.have.ownProperty("available");
    expect(this.res.body).to.have.ownProperty("spendingLimit");
    expect(this.res.body.current).to.equal(this.balance);
    expect(this.res.body.available).to.equal(this.balance);
});
