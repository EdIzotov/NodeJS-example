#!/usr/bin/env node

require('node-env-file')(__dirname + '/../.env');
const async = require('async');
const fs = require('fs');
const config = require(__dirname + '/config/testData.json');
const createAccounts = require(__dirname + '/accounts');
const runTest = require(__dirname + '/benchAPI/runTest');
const createRequestBody = require(__dirname + '/benchAPI/createRequestBody');
const exportToExcel = require(__dirname + '/export');
const exportToConfluence = require(__dirname + '/confluenceAPI');
const tests = config.tests;

async.waterfall([
    (done) => {
        createAccounts(done);
    },
    (accounts, done) => {
        console.log('Running tests ...');
        let testResults = [];
        async.eachLimit(tests, 1, function(test, callback) {
            console.log("  Test # " + (tests.indexOf(test) + 1) + ":");
            console.log("    Type - " + test.type);
            console.log("    Workers - " + test.workers);
            if (test.type === 'trx') {
                console.log("    SAP concurrency - " + test.concurrencySAP);
                console.log("    CBS concurrency - " + test.concurrencyCBS);
                console.log("    Warm up transactions - " + test.warm_up_transactions);
                console.log("    Identities - " + test.identities);
                console.log("    Accounts - " + test.accounts);
                console.log("    Transactions - " + test.transactions);
                console.log("    Turn on cbs north api mock mode - " + test.turn_on_cbs_north_api_mock_mode);
            } else {
                console.log("    Concurrency - " + test.concurrency);
                console.log("    Requests Per Worker - " + test.requestsPerWorker);
            }            
            console.log("    Keep-Alive - " + test.keep_alive);
            runTest.run(createRequestBody(accounts, test), testResults, test, callback);
        }, function(err) {
            if (err) {
                console.log(err);
                done();
            } else {
                done(null);
            }
        });
    }
], (err) => {
    if (err) {
        console.error('REQUEST ERROR: ', err);
        process.exit(1);
    } else {
        let results = runTest.get();
        let date = new Date();
        let fileDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
        let fileNameNonTRX = __dirname + '/export/output/' + process.env.NODE_ENV + '-balance_history' + '-' + fileDate + '.xlsx';
        let fileNameTRX = __dirname + '/export/output/' + process.env.NODE_ENV + '-trx' + '-' + fileDate + '.xlsx';
        exportToExcel(results.nonTRX, fileNameNonTRX, 'nonTRX');
        exportToExcel(results.trx, fileNameTRX, 'trx');
        exportToConfluence(fileNameNonTRX);
        exportToConfluence(fileNameTRX);
        console.log('DONE!');
    }
});
