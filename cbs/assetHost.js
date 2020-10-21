const Abstract = require('./abstract.js');
const winston = require('winston');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({level: process.env.LOG_LEVEL})
    ]
});

class AssetHost extends Abstract {

    constructor() {
        super();                      
    }
    
    get entityName() {return "AHG_CRUD";}
    
    get entityCreate() {return "Create_New_Asset_Host";}
    
    get entityRead() {return "Get_One_Black_Box";}
    
    get entitiesRead() {return "Get_All_Asset_Hosts";}
    
    get entityDelete() {return "Delete_One_Asset_Host";}    
    
}

module.exports = new AssetHost;