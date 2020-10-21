const Confluence = require('confluence-api');
const configFile = require(__dirname + '/config.json');

let config = {
    username: configFile.username,
    password: configFile.password,
    baseUrl:  configFile.baseURL
//    version: 4 // Confluence major version, optional 
};

function getRes(fileName) {
    let confluence = new Confluence(config);
    let space = configFile.space;
    let page = configFile.page;
    let pageID = configFile.pageID;
    let title = fileName.split('/output/')[1].split('.xlsx')[0];

    confluence.getContentByPageTitle(space, page, function(err, data) {
        let currentParentPageID = parseInt(data.results[0].id, 10);
        if (currentParentPageID === pageID) {
            confluence.postContent(space, title, title, pageID, function(err, data) {
                let currentPageID = parseInt(data.id, 10);
                console.log(currentPageID);
                confluence.createAttachment(space, currentPageID, fileName, function(err, data) {
                    if (err) {
                        console.log('Error: ' + err);
                    }
                });
            });
        } else {
            return "Error: ID of the parent page was changed";
        }
    });
}

module.exports = getRes;
