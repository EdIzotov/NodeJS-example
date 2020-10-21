const Yadda = require("yadda");
const English = Yadda.localisation.English;
const Dictionary = Yadda.Dictionary;

var dictionary = new Dictionary()
        .define("INT", /(\d+)/)
        .define("NUM", /(\d+.\d*)/)
        .define("STRING", /"(.*)"/)
        .define("TABLE", /([^\u0000]*)/, Yadda.converters.table)
        .define("LIST", /([^\u0000]*)/, Yadda.converters.list);

module.exports = {

    createLibrary: function(){
        return English.library(dictionary)
    }
}