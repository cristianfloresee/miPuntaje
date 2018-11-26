'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');

// ----------------------------------------
// Get Lessons
// ----------------------------------------
async function getLessons(req, res, next) {
    try {
        //const id_course = req.query.id_course;
        const id_module = req.query.id_module;

        const text = 'SELECT m.name AS module, c.id_class, c.id_module, c.description, c.status, c.date, c.created_at, c.updated_at FROM modules AS m INNER JOIN (SELECT id_class, id_module, description, status, date, created_at, updated_at FROM classes WHERE id_module IN(SELECT id_module FROM modules WHERE id_module = $1 )) AS c ON m.id_module = c.id_module;';
        const values = [id_module];
        const { rows } = await pool.query(text, values);

        res.json(rows)
    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Create Lesson
// ----------------------------------------
async function createLesson(req, res, next) {

    try {
        const {
            id_module,
            description,
            date
        } = req.body;

        const text = 'INSERT INTO classes(id_module, description, date) VALUES($1, $2, $3) RETURNING id_module, description, status, date, created_at, updated_at';
        const values = [id_module, description, date];
        const { rows } = await pool.query(text, values);

        res.status(201).send(rows[0]);
    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Update Lesson
// ----------------------------------------
async function updateLesson(req, res, next) {
    try {
        const id_class = req.params.lessonId;
        const {
            id_module,
            description,
            date,
            status
        } = req.body;

        // Comprobar si existe el registro antes??

        const text2 = 'UPDATE classes SET id_module = $1, description = $2, date = $3, status = $4 WHERE id_class = $5 RETURNING *';
        const values2 = [id_module, description, date, status, id_class];
        const res2 = (await pool.query(text2, values2)).rows[0];

        res.json(res2)

    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getLessons,
    createLesson,
    updateLesson
}