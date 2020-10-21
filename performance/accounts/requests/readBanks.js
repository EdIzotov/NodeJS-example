const cbsApi = require(__dirname + '/../../../cbs');

module.exports = function(done) {
    cbsApi['Bank'].reads(function(err, res) {
        if(err) {
            done(err);
        } else {
            console.log('  - Getting banks ...');
            done(null, res.body[0]);
        }
    });
};
