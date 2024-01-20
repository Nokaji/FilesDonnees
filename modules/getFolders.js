const fs = require('fs');
const path = require('path');

function generateTree(dir) {
    const stats = fs.statSync(dir);

    if (stats.isDirectory()) {
        const files = fs.readdirSync(dir);
        const tree = {};

        for (const file of files) {
            const filePath = path.join(dir, file);
            tree[file] = generateTree(filePath);
        }

        return tree;
    } else {
        return null;
    }
}

// Fonction exportée pour générer une arborescence JSON
exports.jsonTree = async function (folderData = "./DATA") {
    const tree = generateTree(folderData);
    return JSON.stringify(tree, null, 2);
}