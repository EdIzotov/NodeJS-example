const cbsApi = require(__dirname + '/../../../cbs');
const async = require('async');

module.exports = function(bank, done) {
    async.waterfall([
        (doneIn) => {
            cbsApi['Identity'].create({
                "bank": bank,
                "identityType": 0,
                "companyNumber": "1",
                "dateOfIncooperation": "2017-04-13T12:57:36.232Z",
                "placeOfIncooperation": "2017-04-13T12:57:36.232Z",
                "countryOfIncooperation": "2017-04-13T12:57:36.232Z",
                "identityNumber": "1",
                "firstName": "PerformanceTest1_" + Date.now(),
                "lastName": "PerformanceTest1_" + Date.now(),
                "phoneNumber": "0631000000",
                "passportNumber": "XX000000",
                "dateOfBirth": "2017-04-13T12:57:36.232Z",
                "nationality": "UA"
            }, function(err, res) {
                if(err) {
                    doneIn(err);
                } else {
                    doneIn(null, res.body, bank);
                }
            });
        },
        (id1, bank, doneIn) => {
            cbsApi['Identity'].create({
                "bank": bank,
                "identityType": 0,
                "companyNumber": "1",
                "dateOfIncooperation": "2017-04-13T12:57:36.232Z",
                "placeOfIncooperation": "2017-04-13T12:57:36.232Z",
                "countryOfIncooperation": "2017-04-13T12:57:36.232Z",
                "identityNumber": "1",
                "firstName": "PerformanceTest2_" + Date.now(),
                "lastName": "PerformanceTest2_" + Date.now(),
                "phoneNumber": "0631000000",
                "passportNumber": "XX000000",
                "dateOfBirth": "2017-04-13T12:57:36.232Z",
                "nationality": "UA"
            }, function(err, res) {
                if(err) {
                    doneIn(err);
                } else {
                    let data = {};
                    data.identities = [];
                    data.identities.push(id1);
                    data.identities.push(res.body);
                    doneIn(null, data);
                }
            });
        }
    ], (err, result) => {
        if (err) {
            console.error('REQUEST ERROR: ', err);
            process.exit(1);
        } else {
            console.log('  - Creating identities ...');
            done(null, result);
        }
    });
};
