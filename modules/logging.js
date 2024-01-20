const fs = require("fs-extra");

/**
 * Function Logging
 * Write File with string
 * @param {string} string 
 * @param {...any} any
 */

function logging(string, ...any){
    if(!fs.existsSync("./log.txt")) fs.createFile("./log.txt");
    fs.appendFile("./log.txt", [string + any + "\n"].toString());
}

module.exports = {logging};