const express = require("express");
const fs = require("fs-extra");
const ConfigManager = require("./managers/ConfigManager");
const {downloadFiles} = require("./modules/downloadFiles");
const path = require("path");
const { engine } = require("express-handlebars");
const getFolders = require("./modules/getFolders");
const { log } = require("console");
const auth = require("basic-auth");
const url = require("url");

class APP{
    app = express();

    constructor(){
        this.app.engine('handlebars', engine({ defaultLayout: false, helpers:{
            baseUrl: ConfigManager.APP.APP_URL
        }}));
        this.app.set('view engine', 'handlebars');
        this.app.set('views', './views');
        
        this.initRouter();
        downloadFiles(ConfigManager.URL.NSI);
        downloadFiles(ConfigManager.URL.SNIR);
        downloadFiles(ConfigManager.URL.SNT);
        setInterval(() => {
            downloadFiles(ConfigManager.URL.NSI);
            setTimeout(() => {}, 1000);
            downloadFiles(ConfigManager.URL.SNIR);
            setTimeout(() => {}, 1000);
            downloadFiles(ConfigManager.URL.SNT);
        }, 1000*60*20);

        this.initServer();
    }

    initRouter(){
        this.app.use("/assets", express.static(path.join(__dirname, "assets")));

        this.app.use("/public", express.static(path.join(__dirname, "DATA")));

        this.app.set('case sensitive routing', false);

        const authenticate = (req, res, next) => {
            const credentials = auth(req);
        
            if (!credentials || credentials.name !== ConfigManager.APP.APP_USER || credentials.pass !== ConfigManager.APP.APP_PASSWORD) {
                res.set('WWW-Authenticate', 'Basic realm="example"');
                return res.status(401).send('Authentification requise.');
            }
        
            return next();
        };

        this.app.use("/Cours", authenticate);

        this.app.get('/*', async (req, res, next) => {
            try {
                req.requestedFolder = req.params[0];
                const urlActuelle = "/" + req.requestedFolder;
                const previousUrl = urlActuelle.split("/").slice(0, -1).join("/");
                const currentFolder = path.join("DATA", req.requestedFolder);
                const navigationFolder = path.join("/", req.requestedFolder);// Var Navigate
                let isReturn = false;

                if(previousUrl !== "" || req.requestedFolder !== ""){
                    isReturn = true;
                }

                const tree = await JSON.parse(await getFolders.jsonTree(currentFolder));
                

                const treeWithUrls = Object.entries(tree).map(([name, value]) => {
                    const isFile = value === null;
                    const urlPath = isFile ? ConfigManager.APP.APP_URL + "/public/" + req.requestedFolder + "/" + encodeURIComponent(name) : path.join("/", req.requestedFolder, encodeURIComponent(name));
                    const fullUrl = ConfigManager.APP.APP_URL + urlPath;

                    return {
                        name,
                        url: fullUrl,
                        urlPath: urlPath,
                        isFile,
                    };
                });
        
                res.render("index", { tree: treeWithUrls, previousUrl: ConfigManager.APP.APP_URL + previousUrl , isReturn, currentFolder: navigationFolder});
            } catch (error) {
                console.error('Erreur lors de la génération de l\'arborescence JSON :', error);
                res.status(500).send('Une erreur est survenue lors de la récupération de l\'arborescence.');
            }
        });
    }

    initServer(){
        this.app.listen(ConfigManager.APP.APP_PORT, ConfigManager.APP.APP_HOST, () => {
            console.log("Starting Server...");
        });
    }
}
new APP();