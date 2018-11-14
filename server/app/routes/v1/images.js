const express = require('express');
const fs = require('fs');
const path = require('path');
const { checkTokenImage } = require('../../middlewares/authenticated');
const { checkToken } = require('../../middlewares/authenticated');
const app = express();

app.get('/image/:fileType/:image', checkToken, (req, res) => {

    let file_type = req.params.fileType;
    let image = req.params.image;

    //RUTA DE LA IMAGEN
    let image_path = path.resolve(__dirname, `../../../uploads/${file_type}/${image}`);

    //SI EL PATH DE LA IMAGEN EXISTE...
    if (fs.existsSync(image_path)) {
        return res.sendFile(image_path)
    } else {
        let image_default_path = path.resolve(__dirname, '../../assets/default_placeholder.png');
        return res.sendFile(image_default_path);
    }


    //PODRIA MANDAR IMAGEN DEFAULT DESDE EL CLIENTE??
})

module.exports = app;