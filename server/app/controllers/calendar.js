'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const status = require('http-status');
//const uuid4 = require('uuid/v4');
const pool = require('../database');


//FRAGMENTOS DE CONSULTA
const CALENDARS = 'SELECT id_calendar, year, semester, created_at, updated_at, count(*) OVER() AS count FROM calendars';
const CALENDARS_OPTIONS = `SELECT id_calendar, year, semester FROM calendars`;
const PAGINATION = ' ORDER BY id_calendar LIMIT $1 OFFSET $2';

// ----------------------------------------
// Get Calendars
// ----------------------------------------
async function getCalendars(req, res) {
    try {

        const page = (parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1; //(NaN OR <0 == 1)
        const page_size = (parseInt(req.query.page_size) > 0) ? parseInt(req.query.page_size) : 10;
        //const sort_by = string(req.query.sort_by) || 'year';
        //const sort_order = string(req.query.sort_order) == 'desc' ? 'desc' : 'asc';

        //calculado:
        //const from = (page - 1) * page_size;

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
        } else {
            query = `${CALENDARS_OPTIONS} ORDER BY year, semester`;
            promises.push(pool.query(query));
        }


        const {
            rows
        } = (await Promise.all(promises))[0];

        const text2 = 'SELECT count(*) FROM calendars'
        const total_items = (await pool.query(text2)).rows[0].count;

        // console.log("query: ", query);
        // console.log("values: ", values);
        // console.log("rows: ", rows)
        // const {
        //     rows
        // } = await pool.query(query, values);


        res.status(status.OK).json({
            page: page,
            page_size: page_size,
            total_items: parseInt(total_items),
            items: rows
        });

    } catch (error) {
        next({ error});
    }
}

// ----------------------------------------
// Create Calendar
// ----------------------------------------
async function createCalendar(req, res) {

    try {
        const {
            year,
            semester
        } = req.body;

        const text = 'INSERT INTO calendars(year, semester) VALUES($1, $2)';
        const values = [year, semester];
        const result = (await pool.query(text, values)).rows[0];
        res.status(status.CREATED)
            .send();


    } catch (error) {
        next({ error});
    }
}

// ----------------------------------------
// Update Calendar
// ----------------------------------------
async function updateCalendar(req, res) {
    try {
        const id_calendar = req.params.calendarId;
        const {
            year,
            semester
        } = req.body;

        const text1 = 'SELECT id_calendar FROM calendars WHERE id_calendar = $1';
        const values1 = [id_calendar];
        const res1 = (await pool.query(text1, values1)).rows[0];
        // next({ status: 404, message: 'Calendar not Found.' })
        if (!res1) {
            return res.status(status.NOT_FOUND)
                .send({ message: 'calendar not found' })
        }

        const text2 = 'UPDATE calendars SET year = $1, semester = $2 WHERE id_calendar = $3 RETURNING id_calendar, year, semester, created_at, updated_at';
        const values2 = [year, semester, id_calendar];
        const res2 = (await pool.query(text2, values2)).rows[0];
        res.json(res2)

    } catch (error) {
        next({ error});
    }
}

// ----------------------------------------
// Delete Calendar
// ----------------------------------------
async function deleteCalendar(req, res) {
    try {
        const id_calendar = req.params.calendarId;
        const text = `DELETE FROM calendars WHERE id_calendar = $1`;
        const values = [id_calendar];
        const {
            rows
        } = await pool.query(text, values);
        res.sendStatus(204);
    } catch (error) {
        next({ error});
    }
}

// ----------------------------------------
// Get Count Calendar
// ----------------------------------------
async function countCalendar(req, res) {
    try {
        const year = req.query.year;
        const semester = req.query.semester;

        const text = 'SELECT count(*) FROM calendars';
        const {
            rows
        } = await pool.query(text);

        res.json({
            total_items: rows[0].count
        });
    } catch (error) {
        next({ error});
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getCalendars,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    countCalendar
}