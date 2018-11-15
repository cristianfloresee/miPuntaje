'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const multer = require('multer');
const path = require('path');

// ----------------------------------------
// Storage Configuration
// ----------------------------------------
const storageUpload = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'app/public/images')
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now()).toString() + path.extname(file.originalname));
    }
});

// ----------------------------------------
// File Extensions Allowed
// ----------------------------------------
const filterUpload = function (req, file, cb) {
    //file.mimeType === 'image/jpeg' || file.mimeType === 'image/png'
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storageUpload,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: filterUpload
});


function uploadFile(req, res, next){
    upload(req, res, async (error) => {
    
        if(req.file !== undefined){
            console.log("hay una imagen en el form..");
            next(req.file);
        }
        else{
            console.log("no image or error during multer configuration");
            if (!error) {
                next();
            }
            else{
                res(500).send({
                    message: 'Error on multer...'
                })
            }
            
        }
    })
}


let uploadImage = (req, res, next) => {
    console.log(`body: ${req.body}`);
    console.log(`ìmage: ${req.files}`);
    fs.createReadStream('./uploads/'+req.files[x].filename).pipe(fs.createWriteStream('./public/fotos/'+req.files[x].originalname)); 
       //borramos el archivo temporal creado
       fs.unlink('./uploads/'+req.files[x].filename);
    next();

}




//upload.single('campo'), upload.array('campos', 'limite de archivos')
//let data = [].concat(col.insert(req.files));
//res.send(data.map(x => ({ id: x.$loki, fileName: x.filename, originalName: x.originalname })));


// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    uploadFile
}
