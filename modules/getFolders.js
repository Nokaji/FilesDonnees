const fs = require('fs').promises; // Utiliser fs.promises pour les méthodes asynchrones
const path = require('path');

async function processLinksFile(linksFilePath) {
    try {
        const linksFileContent = (await fs.readFile(linksFilePath, 'utf-8')).toString();

        const regex = /Title:\s*([^,]+),\s*Link:\s*([^ \n]+)/g;
        let match;
        const linksList = []; // Utilisez la même variable

        while ((match = regex.exec(linksFileContent)) !== null) {
            const title = match[1].trim();
            const link = match[2].trim();
            linksList.push({ title, link });
        }

        return linksList;
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier links.txt :', error);
        return null;
    }
}

async function generateTree(dir) {
    try {
        const stats = await fs.stat(dir);

        if (stats.isDirectory()) {
            const files = await fs.readdir(dir);
            const tree = {};

            for (const file of files) {
                const filePath = path.join(dir, file);
                const linksFilePath = path.join(dir, 'links.txt');
            
                // Traiter le fichier links.txt seulement s'il existe
                if (file === 'links.txt') {
                    console.log(`Processing links.txt for ${file}`);
                    const treeLinks = await processLinksFile(linksFilePath);
                    for (const link of treeLinks) {
                        tree[link.title] = link.link;
                    }
                } else {
                    console.log(`No links.txt for ${file}`);
                    tree[file] = await generateTree(filePath);
                }
            }

            return tree;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la génération de l\'arborescence JSON :', error);
        return null;
    }
}


// Fonction exportée pour générer une arborescence JSON
exports.jsonTree = async function (folderData = "./DATA") {
    const tree = await generateTree(folderData);
    return JSON.stringify(tree, null, 2);
};
