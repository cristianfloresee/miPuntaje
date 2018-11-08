'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const status = require('http-status');
const pool = require('../database');

//FRAGMENTOS DE CONSULTA
const CALENDARS = 'SELECT id_calendar, year, semester, created_at, updated_at, count(*) OVER() AS count FROM calendars';
const CALENDARS_OPTIONS = `SELECT id_calendar, year, semester FROM calendars`;
const PAGINATION = ' ORDER BY id_calendar LIMIT $1 OFFSET $2';


async function getCalendars(req, res) {
    try {

        //const page = (parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1;
        //const page_size = (parseInt(req.query.page_size) > 0) ? parseInt(req.query.page_size) : 10;
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

        // console.log("query: ", query);
        // console.log("values: ", values);
        // console.log("rows: ", rows)
        // const {
        //     rows
        // } = await pool.query(query, values);

        const total = rows.length != 0 ? rows[0].count : 0;

        res.status(status.OK).send({
            total,
            results: rows
        });

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

            const {
                rows
            } = await pool.query('INSERT INTO calendars(year, semester) VALUES($1, $2)', [year, semester]);
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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function updateCalendar(req, res) {
    try {
        const id_calendar = req.params.calendarId;
        const {
            year,
            semester
        } = req.body;

        let text = 'UPDATE calendars SET year = $1, semester = $2 WHERE id_calendar = $3 RETURNING id_calendar, year, semester, created_at, updated_at';
        let values = [year, semester, id_calendar];
        const {
            rows
        } = await pool.query(text, values);
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

/**
 * 
 * @success {String}  tokenType     Access Token's type
 * @success {String}  accessToken   Authorization Token
 * @error (Bad Request 400) ValidationError:  Some parameters may contain invalid values
 */
async function deleteCalendar(req, res) {
    try {
        const id_calendar = req.params.calendarId;
        const text = `DELETE FROM calendars WHERE id_calendar = $1`;
        const values = [id_calendar];
        const {
            rows
        } = await pool.query(text, values);
        res.status(204).send();
    } catch (error) {
        console.log(`database ${error}`)
        res.status(500).json({
            success: false,
            error
        });
    }
}


/**
 * @API GET v1/calendars/count
 * @DESCRIPTION Get 
 * @ERROR
 */
async function countCalendar(req, res) {
    try {

        //QUERY STRING
        const year = string(req.query.year);
        const semester = string(req.query.semester);

        //QUERY DATABASE
        const text = `SELECT count(*) AS count FROM calendars`;
        const {
            rows
        } = await pool.query(text);

        //HTTP RESPONSE
        console.log(rows);
        res.json({
            result: rows[0].count
        });
    } catch (error) {
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


/** MODELO Y VALIDACIÓN
 
const productSchema = Joi.object().keys({
  name: Joi.required(),
  price: Joi.required(),
  weight: Joi.required()
});

// …

app.post("/products", async (req, res) => {
  const { error } = Joi.validate(req.body, productSchema, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map(({ message, context }) => { message, context });
    return res.status(400).send({ data: errorMessage });
  }
});

 */