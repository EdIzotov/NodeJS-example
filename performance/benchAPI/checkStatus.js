const request = require('request');
const minMaxSummValue = require(__dirname + '/../helpers/minMaxSummValue');

let checkStatus = function(url, cookie, body, done) {
    let id = body.data;
    let uri = url + '?jobId=' + id;
    request.get({url: uri, headers: { Cookie: cookie }}, function(error, httpResponse, res) {
        if (error) {
            console.log('Error: ' + error);
        } else {
            let response = JSON.parse(res);
            if (!response || (response && response.success === false)) {
                console.log('Error: ', response);
                done(response.error, null);
            }
            if (response && response.processing === true) {
                checkStatus(url, cookie, body, done);
            } else {
                if (response.data.options.tool === 'trxGen') {
                    console.log("    Test result:");
                    console.log("      - " + "Time Taken For Transactions: " + minMaxSummValue.maximal(response.data.result, 'TimeTakenForTransactions'));
                    console.log("      - " + "Transactions Completed: " + minMaxSummValue.summ(response.data.result, 'TransactionsCompleted'));
                    console.log("      - " + "Transactions RPS: " + minMaxSummValue.summ(response.data.result, 'TransactionsRPS'));
                    console.log("      - " + "Transaction Errors: " + minMaxSummValue.summ(response.data.result, 'TransactionsErrors'));
                    console.log("      - " + "Public Key Registering Errors: " + minMaxSummValue.summ(response.data.result, 'PublicKeyRegisteringErrors'));
                    console.log("      - " + "Checking Balance Errors: " + minMaxSummValue.summ(response.data.result, 'CheckingBalanceErrors'));
                    console.log("      - " + "Incorrect Balance: " + minMaxSummValue.summ(response.data.result, 'IncorrectBalance'));
                    console.log("      - " + "CBS Errors: " + minMaxSummValue.summ(response.data.result, 'CbsErrors'));
                } else {
                    console.log("    Test result:");
                    console.log("      - " + "Total time: " + minMaxSummValue.maximal(response.data.result, 'totalTime'));
                    console.log("      - " + "Completed: " + minMaxSummValue.summ(response.data.result, 'complete'));
                    console.log("      - " + "Failed: " + minMaxSummValue.summ(response.data.result, 'failed'));
                    console.log("      - " + "Requests per second: " + minMaxSummValue.summ(response.data.result, 'requestsPerSecond'));
                    console.log("      - " + "Time per request: " + minMaxSummValue.maximal(response.data.result, 'timePerRequest'));
                    console.log("      - " + "Errors: " + minMaxSummValue.summ(response.data.result, 'writeErrors'));
                }
                done(null, response.data.result);
            }
        }
    });
};
module.exports = checkStatus;
