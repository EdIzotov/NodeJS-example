#! /usr/bin/env node

const program = require('commander');
const URL = require('url');
const async = require('async');
const transport = require(__dirname + '/api/transport');
const dummyData = require(__dirname + '/api/dummyData');
const TYPES  = require(__dirname + '/api/operationTypes');
const values = require('object.values');

var url;

program
    .version(1)
    .option('-n, --requests <option>', 'Number of requests to perform', parseInt)
    .option('-c, --concurrency <option>', 'Number of multiple requests to make at a time', parseInt)
    .option('-t, --type <option>', 'API request type ' + values(TYPES).join('/'))
    .option('-e, --display-errors', 'Display API error messages', 'boolean', false)
    .option('-k, --keep-alive', 'Use keepAlive', 'boolean', false)
    .option('-d, --send-data <option>', 'JSON for request')
    .usage('[command] [options] url');

program.parse(process.argv);

if (!program.args[0]) {
    program.outputHelp();
    process.exit(-1);
}

url = URL.parse(program.args[0]);

if ((url.protocol !== 'ws:' && url.protocol !== 'http:') || !url.hostname) {
    console.log('Wrong URL.');
    process.exit(-1);
}

var requests = program.requests || 1;
var concurrency = program.concurrency || 1;
var type = program.type ? program.type.toLowerCase() : TYPES.PUBKEY;
var keepAlive = program.keepAlive ? true : false;
var message   = program.sendData  ? program.sendData.replace(/^'(.*)'$/, '$1') : JSON.stringify(dummyData.loadtest[type]);

if (values(TYPES).indexOf(type) === -1) {
    console.log('Wrong request TYPE.');
    process.exit(-1);
}

// For keepAlive connection create array of transport instances = concurrency value
if (keepAlive) {
    var nextEl = (function (max) {
        var current = -1;
        return function () {
            current++;
            if (current === max)
                current = 0;
            return current;
        };
    })(concurrency);

    var Transports = (function (max) {
        let tmp = [];
        for (let i = 0; i < max; i++) {            
            tmp.push((new transport(url)));
        }
        return tmp;
    })(concurrency);

    // Wait for all connection will be opened
    async.each(Transports, (transport, done) => {
        transport.onMessage(done);

    }, (err) => err ? console.error('Error: ', err) : run());
} else {
    run();
}

function run() {
    
    var startTime = new Date();

    async.timesLimit(requests, concurrency, function (n, next) {
        if (keepAlive) {
            let n = nextEl();
            Transports[n].sendKeepAlive(message, next, n);
        } else {
            (new transport(url)).send(message, next);
        }

    }, function (err, res) {

        var endTime = new Date();
        var timeTotalMs = (endTime.getTime() - startTime.getTime());
        var displayErrors = program.displayErrors ? true : false;

        var complete = 0;
        var failed   = 0;

        res.forEach((v, k) => {
            if(v && !v.error) {
                complete++;
            } else {
                failed++;
                if (displayErrors && failed < 10) { // display first 10 errors
                    console.error(v);                    
                }
            }            
        });


        var totalReq = complete + failed;
        var timePerReq = totalReq ? (timeTotalMs / totalReq) : 0;
        var RPS = timePerReq ? (1000 / timePerReq).toFixed(2) : 0;

        var text = '\n'
                + 'Complete requests:    ' + complete + '\n'
                + 'Failed requests:      ' + failed + '\n'
                + 'Time taken for tests: ' + timeTotalMs / 1000 + ' s \n'
                + 'Time per request:     ' + timePerReq.toFixed(3) + ' ms \n'
                + 'Requests per second:  ' + RPS + '\n'
                + (err ? err : '');

        console.log(text);

        process.exit((err ? 1 : 0));
    });
}