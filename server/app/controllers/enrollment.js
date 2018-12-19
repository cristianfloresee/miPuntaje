'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');
const socket = require('../../server');

async function getEnrollments(req, res, next) {

    try {
        const id_course = req.params.id_course;

        console.log("id cou8rse: ", id_course);
        const text1 = 'SELECT id_user FROM course_user WHERE id_course = $1';
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

       // Body Params
        const {
            id_user,
            id_course
        } = req.body;

        console.log("create enrollment...: ", id_user, id_course);

        // Query para crear la matrícula
        const text = `INSERT INTO course_user(id_user, id_course) VALUES($1, $2) RETURNING enrolled_at`;
        const values = [id_user, id_course];
        const enrollment_created = (await pool.query(text, values)).rows[0];

        console.log("enrollment created: ", enrollment_created);
        //necesito el id 

       // Query para obtener toda la data de la matrícula y estudiante
        const text2 = `SELECT u.id_user, u.name 
        FROM users AS u 
        INNER JOIN course_user AS cs 
        ON cs.id_user = u.id_user 
        INNER JOIN courses AS c 
        ON cs.id_course = c.id_course 
        WHERE cs.id_user = $1 
        AND cs.id_course = $2`;
        const values2 = [id_user, id_course];
        const { rows } = await pool.query(text2, values2);
        console.log("ROWI: ", rows)
        // Emite el evento por Web Socket (enviando la data del nuevo usuario creado)
        let io = socket.getSocket();
        io.emit('enrollments_add', {enrollment: rows[0]});

        // Envía respuesta al cliente
        res.send({});
    
    } catch (error) {
    next({ error });
}
}

async function getEnrollmentsByCourseId(req, res, next) {
    try {
        const id_course = req.params.courseId;

        const text1 = 'SELECT cs.enrolled_at, cs.active, u.id_user, u.name, u.last_name, u.middle_name, u.document, u.email, u.phone, u.username FROM course_user AS cs INNER JOIN users AS u ON cs.id_user = u.id_user WHERE id_course = $1';
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
        const active = req.body.active;

        const text = 'UPDATE course_user SET active = $1 WHERE id_course = $2 AND id_user = $3';
        const values = [active, id_course, id_user];
        await pool.query(text, values);

        let io = socket.getSocket();
        io.emit('update_enrollment', {id_user, id_class});

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

        const text = 'DELETE FROM course_user WHERE id_course = $1 AND id_user = $2';
        const values = [id_course, id_user];
        await pool.query(text, values);

        let io = socket.getSocket();
        io.emit('delete_enrollment');

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