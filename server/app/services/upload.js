'use strict'

const fs = require('fs');
const path = require('path');

function deleteFile(file_path) {
    let global_path = path.resolve(__dirname, `../../${file_path}`);
    if (fs.existsSync(global_path)) {
        fs.unlinkSync(global_path)
    }
}

module.exports = {
    deleteFile
}