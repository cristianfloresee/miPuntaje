'use strict'

const pool = require('../database/pool');

//FRAGMENTOS DE CONSULTA
const CALENDARS = 'SELECT id_calendar, year, semester, created_at, updated_at, count(*) OVER() AS count FROM calendars';
const CALENDARS_OPTIONS = `SELECT id_calendar, year, semester FROM calendars`;
const PAGINATION = ' ORDER BY id_calendar LIMIT $1 OFFSET $2';


async function getCalendars(req, res) {
    try {
        console.log("getCalendars...");
        const search = req.query.search;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);

        let values, query;
        let promises = [];

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
        }
        else {
            query = `${CALENDARS_OPTIONS} ORDER BY year, semester`;
            promises.push(pool.query(query));
        }

 
        const  { rows } = (await Promise.all(promises))[0];

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

async function createCalendar(req, res) {

    try {
        const {
            year,
            semester
        } = req.body;

        if (year && semester) {

            const { rows } = await pool.query('INSERT INTO calendars(year, semester) VALUES($1, $2)', [year, semester]);
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

async function updateCalendar(req, res) {
    try {
        const id_calendar = req.params.calendarId;
        const {
            year,
            semester
        } = req.body;

        let text = 'UPDATE calendars SET year = $1, semester = $2 WHERE id_calendar = $3 RETURNING id_calendar, year, semester, created_at, updated_at';
        let values = [year, semester, id_calendar];
        const { rows } = await pool.query(text, values);
        res.json(rows)

    } catch (error) {
        console.log(`database ${error}`)
        res.status(500).json({
            message: error.message,
            code: error.code,
            severity: error.severity
        });
    }
}

async function deleteCalendar(req, res) {
    try {
        const id_calendar = req.params.calendarId;
        const {
            rows
        } = await pool.query('DELETE FROM calendars WHERE id_calendar = $1', [id_calendar]);
        res.json({
            message: 'successfully deleted calendar'
        });
    } catch (error) {
        console.log(`database ${error}`)
        res.status(500).json({
            success: false,
            error
        });
    }
}

async function countCalendar(req, res) {
    try {
        const { rows } = await pool.query('SELECT count(*) AS count FROM calendars');
        console.log(rows);
        res.json({
            result: rows[0].count
        });
    }
    catch(error) {
        console.log(`${error}`)
        res.status(500).json({
            success: false,
            error
        });
    }
}



module.exports = {
    getCalendars,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    countCalendar
}