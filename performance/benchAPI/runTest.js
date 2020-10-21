const async = require('async');
const auth = require(__dirname + '/auth');
const addTaskRequest = require(__dirname + '/addTaskRequest');
const checkStatus = require(__dirname + '/checkStatus');
const bmConfig = require(__dirname + '/API');
const creds = 'username=' + bmConfig.development.credentials.username + '&password=' + bmConfig.development.credentials.password;

let testResults = {
    nonTRX: [],
    trx: []
};

module.exports.run = function(data, results, test, doneIn) {
    let resultOfSingleTest = {};
    resultOfSingleTest.test = test;
    async.waterfall([
        (done) => {
            let url = bmConfig.development.url + bmConfig.development.api.auth.path;
            auth(url, creds, done);
        },
        (cookie, done) => {
            let url = bmConfig.development.url + bmConfig.development.api.addJob.path;
            if (test.workers > 1) {
                url = url + "?all_workers=1";
            }
            addTaskRequest(url, cookie, data, done);
        },
        (body, cookie, done) => {
            let url = bmConfig.development.url + bmConfig.development.api.jobStatus.path;
            checkStatus(url, cookie, body, done);
        }
    ], (err, result) => {
        if (err) {
            console.error('REQUEST ERROR: ', err);
            process.exit(1);
        } else {
            resultOfSingleTest.result = result;
            if (test.type === 'trx') {
                testResults.trx.push(resultOfSingleTest);
                doneIn();
            } else {
                testResults.nonTRX.push(resultOfSingleTest);
                doneIn();
            }
        }
    });
};

module.exports.get = function() {
    return testResults;
};
