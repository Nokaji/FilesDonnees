const dotenv = require("dotenv");
dotenv.config();

exports.URL = {
    SNT: "https://touchardinforeseau.servehttp.com/snt/",
    NSI: "https://touchardinforeseau.servehttp.com/nsi/",
    SNIR: "https://touchardinforeseau.servehttp.com/ent/public/",
}

exports.APP = {
    APP_DEBUG: process.env.APP_DEBUG,
    APP_PORT: process.env.APP_PORT,
    APP_HOST: process.env.APP_HOST,
    APP_URL: process.env.APP_URL,
    APP_DATA_FOLDER: process.env.APP_DATA_FOLDER,
    APP_USER: process.env.APP_USER,
    APP_PASSWORD: process.env.APP_PASSWORD,
    APP_OTHER_USER: process.env.APP_OTHER_USER,
    APP_OTHER_PASSWORD: process.env.APP_OTHER_PASSWORD,
}
