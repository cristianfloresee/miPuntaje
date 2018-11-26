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

async function createEnrollment(req, res) {

    try {
        const {
            id_user,
            id_course
        } = req.body;

        console.log("create enrollment...: ", id_user, id_course);
        if (id_user && id_course) {
            const text = `INSERT INTO course_student(id_user, id_course) VALUES($1, $2)`;
            const values = [id_user, id_course];
            await pool.query(text, values);

            //ENVIO RESPUESTA....
            const text2 = `SELECT u.id_user, u.name FROM users AS u INNER JOIN course_student AS cs ON cs.id_user = u.id_user INNER JOIN courses AS c ON cs.id_course = c.id_course WHERE cs.id_user = $1 AND cs.id_course = $2`;
            const values2 = [id_user, id_course];
            const { rows } = await pool.query(text2, values2);
            res.send(rows[0]);

        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        next({ error });
    }
}

async function getEnrollmentsByCourseId(req, res) {
    try {
        const id_course = req.params.courseId;

        const text1 = ' SELECT cs.enrollment_date, cs.disabled, u.id_user, u.name, u.last_name, u.middle_name, u.document_no, u.email, u.phone_no, u.username FROM course_student AS cs INNER JOIN users AS u ON cs.id_user = u.id_user WHERE id_course = $1';
        const values1 = [id_course];
        const { rows } = (await pool.query(text1, values1));

        //const res2 = (await pool.query(text2, values2)).rows[0];
        //console.log(res1)
        res.json({
            items: rows
        })

    } catch (error) {
        next({ error });
    }
}

async function updateEnrollment(req, res) {

    try {
        const id_course = req.params.courseId;
        const id_user = req.params.userId;
        const disabled = req.body.disabled;

        const text = 'UPDATE course_student SET disabled = $1 WHERE id_course = $2 AND id_user = $3';
        const values = [disabled, id_course, id_user];

        await pool.query(text, values);
        res.status(204).send();

    } catch (error) {
        next({ error });
    }

}


async function getCountEnrollments() {

}

async function deleteEnrollment(req, res) {
    try {

        const id_course = req.params.courseId;
        const id_user = req.params.userId;

        const text = 'DELETE FROM course_student WHERE id_course = $1 AND id_user = $2';
        const values = [id_course, id_user];
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
    //getCalendars,
    getEnrollments,
    getEnrollmentsByCourseId,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    // countCalendar
}