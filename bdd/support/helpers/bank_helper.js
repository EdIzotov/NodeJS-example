const world = require("../world.js");
const common = require("./common.js");
const { expect } = require("chai");

const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class BankHelper {
    constructor() {
        this._initStore();
    }

    store(bank) {
        this.banks.push(bank);
    }

    _initStore() {
        this.banks = [];
    }

     createDefaultBank(done) {
            const data = {
                name: "CucumberBank" + Date.now()
            };

            const request = world.getCbsConn();
            const req = world.cbsConfig.api.createBanks;
            const cbsAuthHeader = world.getCbsAuthHeader();
            const clientToken = world.getCbsClientSessionToken();

            return request[req.method](req.path)
                .set(cbsAuthHeader, clientToken)
                .send(data)
                .then(res => {
                       if (res.error) {
                            throw res.error
                        } else {
                            try {
                                const bank = JSON.parse(res.text);
                                if (bank.body && bank.body.id) {
                                    this.store(bank.body);
                                }
                                return bank;
                            } catch (e) {
                                throw e
                            }
                    }
            });
    }

    deleteBanks() {
        const request = world.getCbsConn();
        const req = world.cbsConfig.api.deleteBanks;
        const cbsAuthHeader = world.getCbsAuthHeader();
        const clientToken = world.getCbsClientSessionToken();

        const data = {
            ids: []
        };

        this.banks.forEach(bank => {
            data.ids.push(bank.id);
        });

        return request[req.method](req.path)
            .set(cbsAuthHeader, clientToken)
            .send(data)
            .then(res => {
                this._initStore();
            });
    }
}

module.exports = new BankHelper();
