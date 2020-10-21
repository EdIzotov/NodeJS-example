const Abstract = require('./abstract.js');
const winston = require('winston');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({level: process.env.LOG_LEVEL})
    ]
});

class Blackboxes extends Abstract {

    constructor() {
        super();                      
    }
    
    get entityName() {return "BLACK_BOX_CRUD";}
    
    get entityCreate() {return "Create_New_Black_Box";}
    
    get entityRead() {return "Get_One_Black_Box";}
    
    get entitiesRead() {return "Get_All_Black_Boxes";}
    
    get entityDelete() {return "Delete_One_Black_Box";}    
    
}

module.exports = new Blackboxes;