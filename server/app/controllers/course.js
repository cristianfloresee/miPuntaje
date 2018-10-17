'use strict'

const pool = require('../database/pool');

async function createCourse(req, res) {

    try {
        const { id_calendar, id_user, id_subject, name, course_goal, student_goal } = req.body;

        if (id_calendar && id_user && id_subject && name && course_goal && student_goal) {
            const { rows } = await pool.query('INSERT INTO courses(id_calendar, id_user, id_subject, name, course_goal, student_goal) VALUES($1, $2, $3, $4, $5, $6)', [id_calendar, id_user, id_subject, name, course_goal, student_goal]);
            res.json({ message: 'successfully created calendar' })
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
    createCourse
}