const blackboxes = require("./blackboxes");
const assetHost = require("./assetHost");
const banks = require("./banks");
const identities = require("./identities");
const accounts = require("./accounts");
const oldWorld = require("./oldWorld");
const parent = require("./abstract.js");
const transaction = require("./transactions");
const Client = require("./client");
const Redboxes = require("./redboxes");
const Secrets = require("./secret");
const Settings = require("./settings");

module.exports = {
    "Black Box": blackboxes,
    "Asset Host": assetHost,
    Bank: banks,
    Identity: identities,
    Account: accounts,
    setCbsUrl: parent.setCbsUrl,
    getCbsUrl: parent.getCbsUrl,
    oldWorld: oldWorld,
    Transaction: transaction,
    Client: Client,
    Redboxes: Redboxes,
    Secrets: Secrets,
    Settings: Settings
};
