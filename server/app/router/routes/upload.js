const express = require('express');
const file_upload = require('express-fileupload');
const app = express();
const pool = require('../../database/pool');

//DEFAULT OPTIONS
app.use(file_upload());

app.put('/upload/:fileType/:id', (req, res) => {

    let file_type = req.params.fileType;
    let id_file_type = req.params.id;
    if (!req.files) {
        return res.status(400).json({
            success: false,
            message: 'no se ha seleccionado ningún archivo'
        })
    }

    let valid_file_types = ['users', 'questions'];
    if (valid_file_types.indexOf(file_type) < 0) {
        return res.status(400).json({
            success: false,
            message: `the allowed file types are ${valid_file_types.join(', ')} but your file type is ${file_type}`
        })
    }

    let file = req.files.file;
    let file_separation = file.name.split('.');
    let file_extension = file_separation[file_separation.length - 1];
    let valid_file_extensions = ['png', 'jpg', 'gif', 'jpeg'];

    if (valid_file_extensions.indexOf(file_extension) < 0) {
        return res.status(400).json({
            success: false,
            message: `the allowed file extensions are ${valid_file_extensions.join(', ')} but your file extesion is ${file_extension}`
        })
    }

    // CAMBIAR NOMBRE DE ARCHIVO
    let file_name = `${id_file_type}-${new Date().getMilliseconds()}.${file_extension}`

    file.mv(`uploads/${file_type}/${file_name}`, (error) => {
        if (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }

        userImage(id_file_type, res, file_name)
        // res.json({
        //     success: true,
        //     message: 'the image has been successfully uploaded'
        // })
    })
});

async function userImage(id_user, res, file_name) {
    try {
        const rows_search = (await pool('SELECT * FROM users WHERE id_user = $1', id_user)).rows;

        if (rows_search.length == 0) {
            return res.status(400).json({
                success: false,
                message: `user ${id_user} does not exists`
            })
        }

        const result = (await pool('UPDATE users SET profile_image = $1 WHERE id_user = $2', file_name, id_user)).rows;
        console.log("result: ", result);
        res.json({
            message: 'imagen cargada en db correctamente'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error
        });
    }
}

module.exports = app;