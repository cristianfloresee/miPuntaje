'use strict'

const pool = require('../database/pool');

async function getCalendars(req, res) {
    try {
        const from = Number(req.query.from || 0);
        const limit = Number(req.query.limit || 10);

        //PARÁMETROS DE FILTRO OPCIONAL:
        const search = req.query.search;

        //FRAGMENTOS DE CONSULTA
        const SELECT = 'SELECT id_calendar, year, semester, created_at, updated_at, count(*) OVER() AS count FROM calendars';
        const PAGINATION = 'ORDER BY id_calendar LIMIT $1 OFFSET $2';

        let query;
        let values = [limit, from];

        if (search) {
            query = `${SELECT} WHERE year = $3 ${PAGINATION}`;
            values.push(search);
        }
        else {
            query = `${SELECT} ${PAGINATION}`
        }

        const {
            rows
        } = await pool.query(query, values);

        const total = rows.length != 0 ? rows[0].count : 0;

        console.log("ROW: ", rows);
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



module.exports = {
    getCalendars,
    createCalendar,
    updateCalendar,
    deleteCalendar
}