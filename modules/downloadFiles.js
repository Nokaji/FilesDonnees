const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const axios = require("axios");
const ConfigManager = require("../managers/ConfigManager");
const { logging } = require("./logging");
let countFile = 0;

function sanitizeFilename(name) {
    // Remplacer les caractères spéciaux par des underscores
    return name.replace(/[\/\?<>\\:\*\|":]/g, '_');
}

function getFile(link){
    const finalLink = (link.match(/^\w+:(\/+([^\/#?\s]+)){2,}/)||[])[2]||'';
    return finalLink;
}


async function processElement($, element, currentDir, baseUrl, visitedLinks) {
    const folderName = sanitizeFilename($(element).find('> a').text().trim());
    const folderPath = path.join(currentDir, folderName);

    // Vérifier si la balise <a> a un attribut href="#"
    const anchorHref = $(element).find('> a').attr('href');
    const shouldCreateFolder = anchorHref && anchorHref === '#';

    if (shouldCreateFolder) {

        // Créer le dossier
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
            logging('Creating Folder:', folderPath);
        }
    }

    // Extraire et enregistrer les liens avec les titres
    $(element).find('> ul > li').each(async (index, subElement) => {
        const linkElement = $(subElement).find('> a');
        const link = linkElement.attr('href');
        const title = linkElement.text().trim();

        if (link && !link.startsWith(baseUrl) && link !== "#") {
            // Ajouter le lien avec le titre au fichier
            const linkFilePath = path.join(folderPath, 'links.txt');
            if (!fs.existsSync(linkFilePath) || !fs.readFileSync(linkFilePath, 'utf8').includes(link)) {
                fs.appendFileSync(linkFilePath, `Title: ${title}, Link: ${link}\n`);
                logging('Link added to file:', linkFilePath);
            }

            // Appel récursif après le traitement du lien
            processElement($, subElement, folderPath, baseUrl);
        } else if (!link || link === "#") {
            // Appel récursif pour les dossiers sans lien
            processElement($, subElement, folderPath, baseUrl);
        } else if (link && link.startsWith(baseUrl)) {
            // Télécharger le fichier et le mettre dans le bon dossier
            const filePath = path.join(folderPath, getFile(link));
	    if(!fs.existsSync(filePath)){
                const response = await axios(link, { responseType: 'stream' });
                response.data.pipe(fs.createWriteStream(filePath));
                logging('File downloaded:', filePath);
            }
        }
    });
}

async function getAllFiles(baseUrl, downloadDir) {
    const response = await axios(baseUrl);
    const $ = cheerio.load(response.data);

    // Commencer le traitement depuis la racine de la hiérarchie
    $('ul.file-tree > li.folder-root').each((index, element) => {
        processElement($, element, downloadDir, baseUrl, new Set());
    });
}

exports.downloadFiles = async function(baseUrl){
    console.log(`Starting With : ${baseUrl}`);
    logging(`Start with : ${baseUrl}`);
    if (!fs.existsSync(ConfigManager.APP.APP_DATA_FOLDER)) fs.mkdirSync(ConfigManager.APP.APP_DATA_FOLDER);
    if(baseUrl == ConfigManager.URL.SNT) await getAllFiles(baseUrl, ConfigManager.APP.APP_DATA_FOLDER + "SNT");
    else await getAllFiles(baseUrl, ConfigManager.APP.APP_DATA_FOLDER);
    console.log("Finish Download Files" + baseUrl);
}