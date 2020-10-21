"use strict";

const { expect } = require("chai");
const bankHelper = require("../support/helpers/bank_helper.js");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const { createLibrary } = require("../support/helpers/yadda_helper.js");

const variables = {};

module.exports = createLibrary()
    .when("create bank $INT banks", function(bankCount) {
        //console.log("dfdffd ", bankCount);
        return Promise.all(
            Array.apply(0, Array(parseInt(bankCount))).map(_ => {
                return bankHelper.createDefaultBank();
            })
        ).then(banks => {
            variables.bankIds = banks.map(bank => bank.body.id);
            //console.log(variables.bankIds);
        });
    })
    .then("id is present for all banks", function() {
        variables.bankIds.forEach(bankId => {
            expect(bankId).to.be.above(0);
        });
    });
