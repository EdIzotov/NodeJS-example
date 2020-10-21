const fs = require("fs");
const expect = require("chai").expect;
const async = require("async");
const cbsApi = require(__dirname + "/../../cbs");
const winston = require("winston");
const ssh = new (require("node-ssh"))();
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});
const sapTransport = require(__dirname + "/../../api/transport");
const SAP_DATA = require(__dirname + "/../../api/operations");
const TYPES = require(__dirname + "/../../api/operationTypes");
const privKey = fs.readFileSync(__dirname + "/../data/private.key");
const pubKey =
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI3/Z6+85nruCkq9xxpgVw+2ZAot+BXkFHPLXzBThaMjI9SGC6egHbVhmrK79CqskgqnSCtelPw8lbfrYt6fygkCAwEAAQ==";

const failoverConfig = require(__dirname + "/../../config/failover.json")[
    process.env.NODE_ENV
];

let sapUrl =
    failoverConfig.sap.api.proto +
    failoverConfig.sap.hosts[0] +
    ":" +
    failoverConfig.sap.api.port +
    failoverConfig.sap.api.path;

const sshConfig = require(__dirname + "/../../config/ssh.json")[
    process.env.NODE_ENV
];

let testName = __filename
    .replace(/.*[\/|\\]+/gi, "")
    .replace(/.js$/i, "")
    .replace(/_/gi, " ")
    .toUpperCase();

describe(testName, function() {
    this.timeout(100000);

    before(function() {
        let cbsUrl =
            failoverConfig.cbs.api.proto +
            failoverConfig.cbs.hosts[0] +
            ":" +
            failoverConfig.cbs.api.port;

        cbsApi.setCbsUrl(cbsUrl);
    });

    it("Connect to AHG through ssh", function(resolve) {
        let host = failoverConfig.ahg[0];

        ssh
            .connect(
                Object.assign(sshConfig, {
                    host: host
                })
            )
            .then(function() {
                logger.info(`Connect to ${host} is success.`);
                resolve();
            })
            .catch(function(err) {
                logger.error(`Connection error to ${host}`, err);
                resolve(err);
            });
    });

    it("Restart AHG", function(resolve) {
        let cmd = failoverConfig.commands.restart.ahg;

        logger.info(`#${cmd}`);

        ssh
            .execCommand(cmd, {
                cwd: "/"
            })
            .then(function(result) {
                if (result.stderr) {
                    logger.error(
                        "Can`t execute command. Error: ",
                        result.stderr
                    );
                    return resolve();
                }

                setTimeout(resolve, 5000);
            })
            .catch(function(err) {
                logger.error(`Can't execute command. ${cmd}`, err);
                resolve(err);
            });
    });

    it("Create identity for check to bank is work correctly after AHG restart", function(resolve) {
        let bank = JSON.parse(process.env["bank"]);

        cbsApi["Identity"].createNewPrivateIdentity(
            {
                bankId: bank.id,
                firstName: "TestFirstName_" + Date.now(),
                lastName: "TestLastName_" + Date.now(),
                phoneNumber: "1234567890",
                passportNumber: "AA010101",
                dateOfBirth: "2017-04-13T12:57:36.232Z",
                nationality: "UA"
            },
            (err, res) => {
                if (err) {
                    logger.error(err);
                }
                expect(res).to.be.an("object");
                expect(res).to.have.ownProperty("body");
                expect(res.body).to.be.an("object");
                expect(res.body).to.have.ownProperty("id");
                expect(res.body.id).to.be.above(0);

                resolve();
            }
        );
    });
});
