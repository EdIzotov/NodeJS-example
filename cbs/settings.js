const Abstract = require("./abstract.js");
const winston = require("winston");
const async = require("async");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class Settings extends Abstract {
    constructor() {
        super();
    }

    get entityName() {
        return "Settings";
    }

    get entityImportPki() {
        return "settings_import_node_pki";
    }

    get entityImportAssets() {
        return "settings_import_assets";
    }

    сreateImportPki(pki, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityImportPki]) {
                        return done(
                            "Unknown method: " +
                                this.entityImportPki +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let data = {
                        body: {
                            nodePki: pki
                        }
                    };

                    logger.debug(JSON.stringify(data, 0, 2));

                    client[this.entityName][this.entityImportPki](
                        data,
                        { responseContentType: "application/json" },
                        success => {
                            logger.debug(
                                "Response: ",
                                JSON.stringify(success.obj)
                            );
                            done(null, success.obj);
                        },
                        error => done(error.statusText)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }

    сreateImportAssets(assets, cb) {
        async.waterfall(
            [
                this.swaggerClient,
                (client, done) => {
                    if (!client[this.entityName]) {
                        return done("Unknown tag: " + this.entityName);
                    }

                    if (!client[this.entityName][this.entityImportAssets]) {
                        return done(
                            "Unknown method: " +
                                this.entityImportAssets +
                                " for tag " +
                                this.entityName
                        );
                    }

                    let data = {
                        body: {
                            assets: assets
                        }
                    };

                    logger.debug(JSON.stringify(data, 0, 2));

                    client[this.entityName][this.entityImportAssets](
                        data,
                        { responseContentType: "application/json" },
                        success => {
                            logger.debug(
                                "Response: ",
                                JSON.stringify(success.obj)
                            );
                            done(null, success.obj);
                        },
                        error => done(error.statusText)
                    );
                }
            ],
            cb ? cb : this.swaggerResponse
        );
    }
}

module.exports = new Settings();
