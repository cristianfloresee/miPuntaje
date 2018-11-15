'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const pool = require('../database');
const path = require('path');
const utils = require('../services/upload');
//const multer = require('multer');
//FRAGMENTOS DE CONSULTA
//const SUBCATEGORIES = 'SELECT id_category, id_user, id_subject, name, created_at, updated_at, count(*) OVER() AS count FROM categories';
const SUBCATEGORY_OPTIONS = `SELECT id_subcategory, name FROM subcategories`;
const PAGINATION = ' ORDER BY id_category LIMIT $1 OFFSET $2';
//const multe = require('../middlewares/upload').upload;
//const upload = multe.single('image');
const multer = require('multer');

const storageUpload = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images/users')
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now()).toString() + path.extname(file.originalname));
    }
});

const filterUpload = function (req, file, cb) {
    //file.mimeType === 'image/jpeg' || file.mimeType === 'image/png'
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        //SEND ERROR EXTENSIÓN NO VÁLIDA...
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
}).single('image');



async function getQuestions(req, res) {

    try {
        const subject = req.params.subject;
        const teacher = req.params.teacher;
        const search = req.query.search;
        const category_options = req.query.category_options;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);
        const last_by_techer = req.query.last_by_teacher;

        let values, query;

        if (last_by_techer) {
            const query = `SELECT su.name AS subject, c.name AS category, s.name AS subcategory, q.id_question, q.description, q.difficulty, q.shared, q.created_at, q.updated_at FROM questions AS q INNER JOIN subcategories AS s on q.id_subcategory = s.id_subcategory INNER JOIN categories AS c ON s.id_category = c.id_category INNER JOIN subjects AS su ON c.id_subject = su.id_subject WHERE id_user = $1 ORDER BY s.updated_at DESC LIMIT 5`;
            const values = [last_by_techer];
            const {
                rows
            } = await pool.query(query, values);
            return res.send(rows)
        }

        if (category_options) {
            const query = `${SUBCATEGORY_OPTIONS} WHERE id_category = $1 ORDER BY name`;
            const values = [category_options]
            const {
                rows
            } = await pool.query(query, values);
            return res.send(rows)
        }

        if ((from != undefined) && limit) {
            query = CATEGORIES;
            values = [limit, from];

            if (subject || teacher || search) query += ` WHERE `;
            if (subject) {
                query += `id_subject = $${values.length + 1}`;
                values.push(`${subject}`);
            }
            if (teacher) {
                query += `id_user = $${values.length + 1}`;
                values.push(`${teacher}`);
            }
            if (search) {
                query += `name = $${values.length + 1}`;
                values.push(`${search}`);
            }
            query += `${PAGINATION}`;

        } else {
            query = `${CATEGORIES_OPTIONS} ORDER BY name`;
        }

        //console.log("QUERY: ", query);
        //console.log("VALUE: ", values);
        const {
            rows
        } = await pool.query(query, values);


        const total = rows.length != 0 ? rows[0].count : 0;

        res.json({
            total,
            results: rows
        })
    } catch (error) {
        console.log(`${error}`)
        res.status(500).json({
            message: 'error in obtaining calendars',
            error
        });
    }
}

async function createQuestion(req, res) {

    upload(req, res, async (error) => {

        if (error) { //se producira solo si se envia una imagen
            return res.status(500).send({
                message: 'Error on multer...',
            })
        }
        //if(req.files[0]) //para múltiples archivos
        // if (req.file !== undefined) {
        //     console.log("imagen provided..");

        // } else {
        //     console.log("no image provided or error");
        // }

        try {
            const {
                id_subcategory,
                description,
                difficulty
            } = req.body;
            const file_path = req.file !== undefined ? req.file.filename : undefined;

            const text = 'INSERT INTO questions(id_subcategory, description, difficulty, image) VALUES($1, $2, $3, $4) RETURNING *';
            const values = [id_subcategory, description, difficulty, file_path];
            const {
                rows
            } = await pool.query(text, values);
            res.status(201).send(rows[0]);
        } catch (err) {
            if (file_path) utils.deleteFile(file_path);
            console.log(`${error}`)
            res.status(500).json({
                message: 'Server error'
            })
        }




        // const text1 = 'SELECT id_subcategory FROM subcategories WHERE id_subcategory = $1';
        // const values1 = [id_subcategory];
        // const rows_search = (await pool.query(text1, values1)).rows;

        // if (rows_search.length == 0) {
        //     utils.deleteFile(file_path);
        //     return res.status(400).json({
        //         message: `subcategory ${id_subcategory} does not exists`
        //     })
        // }



        // res.status(201).send(rows[0]);


        //     } catch (error) {
        //         console.log(`${error}`)
        //         res.status(500).json({
        //             message: error.message,
        //             code: error.code,
        //             severity: error.severity
        //         })

        //     }


        // } else {
        //     console.log(`${error}`)
        //     //ERROR INTERNO AL SUBIR LA IMAGEN
        //     res.status(500).send();
        //     //EXTENSIÓN INVÁLIDA
        //     //res.status(400).send();
        // }
    });

}


async function deleteSubcategory(req, res) {
    try {
        const id_subcategory = req.params.subcategoryId;

        const {
            rows
        } = await pool.query('DELETE FROM subcategories WHERE id_subcategory = $1', [id_subcategory]);
        res.status(204).send();

    } catch (error) {
        console.log(`database ${error}`)
        res.status(500).json({
            success: false,
            error
        });
    }
}


// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getQuestions,
    createQuestion,
}