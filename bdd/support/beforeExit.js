const world = require("./world.js");
const bankIds = JSON.parse(process.argv[2]);
const cbsClientSessionToken = process.argv[3];

function deleteBanks() {
    const request = world.getCbsConn();
    const req = world.cbsConfig.api.deleteBanks;
    const cbsAuthHeader = world.getCbsAuthHeader();
    const clientToken = world.getCbsClientSessionToken();

    const data = {
        ids: bankIds
    };

    return request[req.method](req.path)
        .set(cbsAuthHeader, clientToken)
        .send(data)
        .then(res => {
            try {
                res = JSON.parse(res.text);
            } catch (e) {
                console.error(__filename, e);
            }
            if (res.header.response_code !== 0) {
                console.error(__filename, res);
            }
        })
        .catch(err => {
            console.error(__filename, err);
        });
}

Promise.all([
    new Promise(resolve => {
        world.getEnv(resolve);
    }).then(_ => {
        world.setCbsClientSessionToken(cbsClientSessionToken);
        if (Array.isArray(bankIds) && cbsClientSessionToken) {
            return deleteBanks();
        } else {
            console.error(__filename, "required parameter is missing");
        }
    })
]).catch(err => {
    console.error(__filename, err);
});
