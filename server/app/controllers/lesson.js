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
        // Query Params
        const id_course = req.query.id_course || null;
        const id_module = req.query.id_module || null;
        const status = req.query.status || null;
        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;


        console.log("id_module: ", id_module);
        // Obtiene las Clases
        const text = `SELECT m.name AS module, c.id_class, c.id_module, c.description, c.status, c.date, c.created_at, c.updated_at 
        FROM modules AS m 
        INNER JOIN classes AS c 
        ON m.id_module = c.id_module 
        WHERE ($1::int IS NULL OR m.id_course = $1) 
        AND ($2::int IS NULL OR m.id_module = $2) 
        AND ($3::bool IS NULL OR c.status = $3) 
        LIMIT $4 
        OFFSET $5`;
        const values = [id_course, id_module, status, page_size, (page - 1) * page_size];
        const { rows } = await pool.query(text, values);

        // Obtiene la cantidad total de Clases (de acuerdo a los Parámetros de Filtro)
        const text2 = 'SELECT count(*) FROM classes WHERE ($1::int IS NULL OR id_module = $1) AND ($2::int IS NULL OR id_module IN (SELECT id_module FROM modules WHERE id_course = $2)) AND ($3::bool IS NULL OR status = $3) ';
        const values2 = [id_module, id_course, status];
        const total_items = (await pool.query(text2, values2)).rows[0].count;

        // Envía la Respuesta
        res.json({
            info: {
                total_pages: Math.ceil(total_items / page_size),
                page: page,
                page_size: page_size,
                total_items: parseInt(total_items),
            },
            items: rows
        })
    } catch (error) {
        next({ error });
    }
}


// ----------------------------------------
// Get Lessons as Select Options
// ----------------------------------------
async function getLessonOptions(req, res, next) {
    try {
        // Query Params
        const id_module = req.query.id_module; // Obligatorio por ahora    

        console.log("lesson options: ", id_module);
        // Obtiene las Clases
        const text = 'SELECT id_class, description FROM classes WHERE id_module = $1';
        const values = [id_module];
        const { rows } = await pool.query(text, values);

        // Envía la Respuesta
        res.json(rows);
    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Create Lesson
// ----------------------------------------
async function createLesson(req, res, next) {

    try {
        // Body Params
        const {
            id_module,
            description,
            date
        } = req.body;

        const text = 'INSERT INTO classes(id_module, description, date) VALUES($1, $2, $3) RETURNING id_module, description, status, date, created_at, updated_at';
        const values = [id_module, description, date];
        const { rows } = await pool.query(text, values);
        // Envía la Respuesta
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

async function deleteLesson(req, res, next) {
    
    try {
        const id_lesson = req.params.lessonId;
        console.log("delete lesson: ", id_lesson);

        // Ve si tiene Actividades asociadas

        const text = 'DELETE FROM classes WHERE id_class = $1';
        const values = [id_lesson];
        await pool.query(text, values);

        res.sendStatus(204);
    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getLessons,
    getLessonOptions,
    createLesson,
    updateLesson,
    deleteLesson
}