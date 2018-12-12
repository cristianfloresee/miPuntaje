'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');

async function getEnrollments(req, res) {

    try {
        const id_course = req.params.id_course;

        console.log("id cou8rse: ", id_course);
        const text1 = 'SELECT id_user FROM course_student WHERE id_course = $1';
        const values1 = [id_course];
        const res1 = (await pool.query(text1, values1)).rows[0];

        //const res2 = (await pool.query(text2, values2)).rows[0];
        console.log(res1)
        res.json(res1)

    } catch (error) {
        next({ error });
    }

}

// ----------------------------------------
// Update Lesson
// ----------------------------------------
async function updateActivityParticipation(req, res, next) {
    console.log("cami...");
    try {
        const id_activity = req.params.activityId;
        const id_user = req.params.userId;

        const {
            status
        } = req.body;

        // Comprobar si existe el registro antes??

        const text2 = 'UPDATE activity_student SET status = $1 WHERE id_activity = $2 AND id_user = $3';
        const values2 = [status, id_activity, id_user];
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
    updateActivityParticipation
}