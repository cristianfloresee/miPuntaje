'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');
const _f_exts = require('../config/file_exts');
const _file = require('../services/file');

// ----------------------------------------
// Init Upload Service
// ----------------------------------------
const upload = _file.uploadFile('images/questions', _f_exts.IMAGE_EXTS, 5, 'image');

//const SUBCATEGORIES = 'SELECT id_category, id_user, id_subject, name, created_at, updated_at, count(*) OVER() AS count FROM categories';
const SUBCATEGORY_OPTIONS = `SELECT id_subcategory, name FROM subcategories`;
const PAGINATION = ' ORDER BY id_category LIMIT $1 OFFSET $2';

// ----------------------------------------
// Get Questions
// ----------------------------------------
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
        next({ error });
    }
}


// ----------------------------------------
// Create Question
// ----------------------------------------
async function createQuestion(req, res) {

    upload(req, res, async (error) => {

        if (error) return res.sendStatus(500);
        const file_path = req.file !== undefined ? req.file.path : undefined;

        try {
            const {
                id_subcategory,
                description,
                difficulty
            } = req.body;

            const text = 'INSERT INTO questions(id_subcategory, description, difficulty, image) VALUES($1, $2, $3, $4) RETURNING *';
            const values = [id_subcategory, description, difficulty, file_path];
            const {
                rows
            } = await pool.query(text, values);
            res.status(201).send(rows[0]);
        } catch (error) {
            if (file_path) _file.deleteFile(file_path);
            next({ error });
        }
    });

}

// ----------------------------------------
// Update Question
// ----------------------------------------
async function updateQuestion(req, res) {

    upload(req, res, async (error) => {

        if (error) return res.sendStatus(500);
        const file_path = req.file !== undefined ? req.file.path : undefined;

        try {
            const {
                id_subcategory,
                description,
                difficulty
            } = req.body;
            const id_question = req.params.questionId;

            const text1 = 'SELECT id_question FROM questions WHERE id_question = $1';
            const values1 = [id_question];
            const res1 = (await pool.query(text1, values1)).rows;

            if (res1.length == 0) {
                if (file_path) _file.deleteFile(file_path);
                return res.status(400).json({
                    message: `questions ${id_question} does not exists`
                })
            }

            console.log("eliminando foto vieja: ", res1[0].image)
            if (file_path) _file.deleteFile(res1[0].image);
            const text2 = 'UPDATE questions SET id_subcategory = $1, description = $2, difficulty = $3, image = $4 RETURNING *';
            const values2 = [id_subcategory, description, difficulty, file_path];
            const res2 = await (pool.query(text2, values2)).rows[0];
            res.json(res2)

        } catch (error) {
            if (file_path) _file.deleteFile(file_path);
            next({ error });
        }
    });
}

// ----------------------------------------
// Delete Question
// ----------------------------------------
async function deleteQuestion(req, res) {
    try {
        const id_question = req.params.questionId;

        const text = 'DELETE FROM questions WHERE id_question = $1';
        const values = [id_question]
        await pool.query(text, values);

        res.sendStatus(204);

    } catch (error) {
        nnext({ error });
    }
}


// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
}