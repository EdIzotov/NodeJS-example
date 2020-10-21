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

Then("Check SAP trx response. Expect error code {int}", function(errorCode) {
    if (this.res && this.res.error) {
        logger.error(this.res);
    }

    expect(this.res).to.be.an("object");
    expect(this.res).to.have.ownProperty("id");
    expect(this.res).to.have.ownProperty("error");
    expect(this.res).to.have.ownProperty("errorCode");
    expect(this.res.errorCode).to.equal(errorCode);
});
