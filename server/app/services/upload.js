'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const fs = require('fs');
const path = require('path');


// ----------------------------------------
// File Extensions
// ----------------------------------------
const IMAGE_EXTS = ['image/gif','image/jpeg', 'image/jpg', 'image/svg+xml', 'image/svg', 'image/png', 'image/x-png', 'image/pjpeg'];
const QN_IMPORT_EXTS = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      
// ----------------------------------------
// Multer: Storage Configuration
// ----------------------------------------
const storageUpload = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images/users')
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now()).toString() + path.extname(file.originalname));
    }
});

// ----------------------------------------
// Multer: Filter File Extensions
// ----------------------------------------
const filterUpload = function (req, file, cb) {
    if (IMAGE_EXTS.includes(file.mimeType)) {
        return cb(new Error('Only image files are allowed!'), false); //Fix this error. Send readable error!
    }
    cb(null, true);
};

// ----------------------------------------
// Multer: Init Multer
// + initMulter(storageDest, fileSize, extsAllowed)
// ----------------------------------------
const upload = multer({
    storage: storageUpload,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: filterUpload
}).single('image');


// ----------------------------------------
// Delete File Function
// ----------------------------------------
function deleteFile(file_path) {
    let global_path = path.resolve(__dirname, `../../${file_path}`);
    if (fs.existsSync(global_path)) fs.unlinkSync(global_path)
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    deleteFile
}