const fs = require("fs-extra");

/**
 * Function Logging
 * Write File with string
 * @param {string} string 
 * @param {...any} any
 */

function logging(string, ...any){
    const date = new Date();
    if(!fs.existsSync("./log.txt")) fs.createFile("./log.txt");
    fs.appendFile("./log.txt", ["(" + date.toUTCString() + ") " + string + any + "\n"].toString());
}

module.exports = {logging};