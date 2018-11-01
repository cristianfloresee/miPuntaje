'use strict'

const pool = require('../database/pool');



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
         if(id_user && id_course){
             const query = `SELECT s.name AS subject, c.id_course, c.active, c.name, c.code, c.course_goal, c.student_goal, ca.year, ca.semester, c.created_at, c.updated_at FROM courses AS c INNER JOIN subjects AS s ON s.id_subject = c.id_subject INNER JOIN calendars as ca ON ca.id_calendar = c.id_calendar WHERE id_user = $1 AND id_course = $2;`;
             const values = [id_user, id_course];
             const { rows } = await pool.query(query, values);
             if(rows.length > 0){
                 return res.send(rows[0])
             }
             else{
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

        if(all_courses_by_teacher){
            console.log("PIKACHUUUUUUUUU");
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
        console.log(`${error}`)
        res.status(500).json({
            message: 'error in obtaining calendars',
            error
        });
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
            const {
                rows
            } = await pool.query('INSERT INTO courses(id_calendar, id_user, id_subject, name, course_goal, student_goal, code) VALUES($1, $2, $3, $4, $5, $6, LEFT(uuid_generate_v4()::text, 8))', [id_calendar, id_user, id_subject, name, course_goal, student_goal]);;
            res.json({
                message: 'successfully created calendar'
            })
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
    getCourses,
    createCourse
}