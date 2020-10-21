const cbsApi = require(__dirname + "/../../cbs");

const storage = {
    BANKS: "BANKS",
    IDENTITIES: "IDENTITIES",
    ACCOUNTS: "ACCOUNTS",
    CLIENTS: "CLIENTS",
    IOV_PUBLIC_KEYS: "IOV_PUBLIC_KEYS"
};

module.exports = {
    add: (entityName, entityAdd) => {
        if (!storage[entityName]) {
            throw "Unknown entity '" + entityName + "'";
        }

        entityAdd.cbsUrl = cbsApi.getCbsUrl();

        let data = process.env[entityName]
            ? JSON.parse(process.env[entityName])
            : [];

        data.push(entityAdd);
        process.env[entityName] = JSON.stringify(data);
    },
    get: entityName => {
        if (!storage[entityName]) {
            throw "Unknown entity '" + entityName + "'";
        }

        return process.env[entityName]
            ? JSON.parse(process.env[entityName])
            : [];
    }
};
