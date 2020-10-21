const async = require("async");
const accountHelper = require("../../support/helpers/account_helper.js");
const identityHelper = require("../../support/helpers/identity_helper.js");

class CompositeHelper {
    createQrCodeAddPubKey(identity) {
        return identityHelper.generateQrCode(identity).then(qrCode => {
            return identityHelper.addPubKey(identity, qrCode, "1");
        });
    }

    createQrCodeAddPubKeyAndMakeTransaction(
        identity,
        account1,
        account2,
        amount,
        description
    ) {
        return this.createQrCodeAddPubKey(identity).then(_ => {
            return accountHelper.makeTransaction(
                account1,
                account2,
                amount,
                description
            );
        });
    }

    addQrPubkeyAndGetBalanceFromAllNodes(identity, account) {
        return this.createQrCodeAddPubKey(identity).then(_ => {
            return accountHelper.getBalanceFromAllNodes(account);
        });
    }
}

module.exports = new CompositeHelper();
