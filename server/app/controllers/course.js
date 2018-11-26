'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');

async function getCourses(req, res) {
    try {
        const search = req.query.search;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);
        const last_by_techer = req.query.last_by_teacher;
        const all_courses_by_teacher = req.query.all_courses_by_teacher;


        let values, query;
        let promises = [];


        //OBTENER DETALLES DEL CURSO
        const id_user = req.query.id_user;
        const id_course = req.query.id_course;
        if (id_user && id_course) {
            const query = `SELECT s.id_subject, s.name AS subject, c.id_course, c.active, c.name, c.code, c.course_goal, c.student_goal, ca.id_calendar, ca.year, ca.semester, c.created_at, c.updated_at FROM courses AS c INNER JOIN subjects AS s ON s.id_subject = c.id_subject INNER JOIN calendars as ca ON ca.id_calendar = c.id_calendar WHERE id_user = $1 AND id_course = $2;`;
            const values = [id_user, id_course];
            const { rows } = await pool.query(query, values);
            if (rows.length > 0) {
                return res.send(rows[0])
            }
            else {
                return res.status(400).json({
                    message: 'No corresponde'
                })
            }
        }

        if (last_by_techer) {
            const query = `SELECT s.name AS subject, c.id_course, c.name, c.code, c.course_goal, c.student_goal, ca.year, ca.semester, c.created_at, c.updated_at FROM courses AS c INNER JOIN subjects AS s ON s.id_subject = c.id_subject INNER JOIN calendars as ca ON ca.id_calendar = c.id_calendar WHERE id_user = $1 ORDER BY c.updated_at DESC LIMIT 5`;
            const values = [last_by_techer];
            const { rows } = await pool.query(query, values);
            console.log(rows);
            return res.send(rows)
        }

        if (all_courses_by_teacher) {
            //console.log("PIKACHUUUUUUUUU");
            const query = `SELECT s.name AS subject, c.id_course, c.name, c.code, c.course_goal, c.student_goal, ca.year, ca.semester, c.created_at, c.updated_at FROM courses AS c INNER JOIN subjects AS s ON s.id_subject = c.id_subject INNER JOIN calendars as ca ON ca.id_calendar = c.id_calendar WHERE id_user = $1`;
            const values = [all_courses_by_teacher]
            const { rows } = await pool.query(query, values);
            return res.send(rows)
        }

        if ((from != undefined) && limit) {
            values = [limit, from];
            query = CALENDARS;
            if (search) {
                query += ` WHERE year = $3`;
                values.push(`${search}`);
            }
            query += `${PAGINATION}`;

            console.log("query: ", query);
            console.log("values: ", values);

            promises.push(pool.query(query, values));
        } else {
            query = `${CALENDARS_OPTIONS} ORDER BY year, semester`;
            promises.push(pool.query(query));
        }


        const {
            rows
        } = (await Promise.all(promises))[0];

        // console.log("query: ", query);
        // console.log("values: ", values);
        // console.log("rows: ", rows)
        // const {
        //     rows
        // } = await pool.query(query, values);

        const total = rows.length != 0 ? rows[0].count : 0;

        //console.log("ROW: ", rows);
        res.json({
            total,
            results: rows
        })
    } catch (error) {
        next({ error});
    }
}



async function createCourse(req, res) {

    try {
        const {
            id_calendar,
            id_user,
            id_subject,
            name,
            course_goal,
            student_goal
        } = req.body;

        if (id_calendar && id_user && id_subject && name && course_goal && student_goal) {

            const text = `WITH user_subject AS (INSERT INTO user_subject(id_user,id_subject) VALUES($1,$2) ON CONFLICT ON CONSTRAINT pk_user_subject DO NOTHING) INSERT INTO courses(id_calendar, id_user, id_subject, name, course_goal, student_goal, code) VALUES($3, $4, $5, $6, $7, $8, LEFT(uuid_generate_v4()::text, 8))`
            const values = [id_user, id_subject, id_calendar, id_user, id_subject, name, course_goal, student_goal]
            const {
                rows
            } = await pool.query(text, values);
            res.json({
                message: 'successfully created calendar'
            })
        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        next({ error});
    }
}


async function updateCourse(req, res) {
    try {
        const id_course = req.params.courseId;
        const {
            id_calendar,
            id_subject,
            name,
            course_goal,
            student_goal,
            active
        } = req.body;

        let text = 'UPDATE courses SET id_calendar = $1, id_subject = $2, name = $3, course_goal = $4, student_goal = $5, active = $6 WHERE id_course = $7 RETURNING id_course, id_calendar, id_user, id_subject, name, course_goal, student_goal, created_at, updated_at, code, active';
        let values = [id_calendar, id_subject, name, course_goal, student_goal, active, id_course];
        const { rows } = await pool.query(text, values);
        //EL PROBLEMA ES QUE NECESITO DEVOLVER UNA RESPUESTA CON JOIN DE TABLAS (courses, calendars, subjects)
        res.json(rows)

    } catch (error) {
        next({ error});
    }
}

async function deleteCourse(req, res) {
    try {
        const id_course = req.params.courseId;
        const {
            rows
        } = await pool.query('DELETE FROM courses WHERE id_course = $1', [id_course]);
        res.sendStatus(204);
    } catch (error) {
        next({ error});
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
}