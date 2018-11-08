'use strict'

const pool = require('../database');

async function createEnrollment(req, res) {

    try {
        const {
            id_user,
            id_course
        } = req.body;

        if (id_user && id_course) {
            const text = `INSERT INTO course_student(id_user, id_course) VALUES($1, $2)`;
            const values = [id_user, id_course];
            await pool.query(text, values);

            //ENVIO RESPUESTA....
            const text2 = `SELECT u.id_user, u.name FROM users AS u INNER JOIN course_student AS cs ON cs.id_user = u.id_user INNER JOIN courses AS c ON cs.id_course = c.id_course WHERE cu.id_user = $1 AND cu.id_course = $2`;
            const values2 = [id_user, id_course];
            const { rows } = await pool.query(text2, values2);
            res.send(rows[0]);

        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        console.log(`${error}`)
        res.status(500).json({
            //message: 'error when saving the color',
            message: error.message,
            code: error.code,
            severity: error.severity
        })
    }
}


module.exports = {
    //getCalendars,
    //getEnrollments,
    createEnrollment,
    // updateCalendar,
    // deleteCalendar,
    // countCalendar
}