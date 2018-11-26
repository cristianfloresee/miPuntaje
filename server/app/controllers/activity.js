'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');


// ----------------------------------------
// Crear Actividad
// ----------------------------------------
async function createActivity(req, res, next) {

    try {
        const {
            id_lesson,
            name,
            mode
        } = req.body;

        const text = 'INSERT INTO activities(id_class, name, mode) VALUES($1, $2, $3)';
        const values = [id_lesson, name, mode];
        await pool.query(text, values);

        //res.sendStatus(201); // Error: Unexpected token JSON at position 0
        res.status(201).send(); // Funciona
    } catch (error) {
        next({ error });
    }
}


// ----------------------------------------
// Get Activities
// ----------------------------------------
async function getActivities(req, res, next) {
    try {
        const id_course = req.query.id_course;

        // Obtiene las Actividades por ID Curso
        const text = 'SELECT a.id_activity, a.name, a.mode, a.status, a.created_at, a.updated_at, c.id_class, c.description AS lesson, m.id_module, m.name AS module, CASE WHEN EXISTS (SELECT id_user FROM activity_student AS au WHERE id_activity = a.id_activity) THEN TRUE ELSE FALSE END AS winners FROM activities AS a INNER JOIN classes AS c ON c.id_class = a.id_class INNER JOIN modules AS m ON m.id_module = c.id_module WHERE id_course = $1';
        const values = [id_course];
        const { rows } = await pool.query(text, values);
        res.json(rows)
    } catch (error) {
        next({ error });
    }
}

async function updateActivity(req, res, next) {

    try {
        const id_activity = req.params.activityId;
        // name, status, mode
        const id_class = req.body.id_lesson;
        const name = req.body.name;
        const mode = req.body.mode;
        const status = req.body.status;

        const text = 'UPDATE activities SET id_class = $1, name = $2, mode = $3, status = $4 WHERE id_activity = $5';
        const values = [id_class, name, mode, status, id_activity];
        await pool.query(text, values);

        res.sendStatus(204);
    } catch (error) {
        next({ error });
    }

}


async function getCountActivities() {

}

async function deleteActivity(req, res) {
    try {
        const id_activity = req.params.activityId;

        const text = 'DELETE FROM activities WHERE id_activity = $1';
        const values = [id_activity];
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
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    // countCalendar
}