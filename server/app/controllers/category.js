'use strict'

const pool = require('../database/pool');

//FRAGMENTOS DE CONSULTA
const CATEGORIES = 'SELECT id_category, id_user, id_subject, name, created_at, updated_at, count(*) OVER() AS count FROM categories';
//const CALENDARS_OPTIONS = `SELECT id_category, name FROM categories`;
const PAGINATION = ' ORDER BY id_category LIMIT $1 OFFSET $2';



async function getCategories(req, res) {

    try {
        const subject = req.params.subject;
        const teacher = req.params.teacher;
        const search = req.query.search;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);

        let values, query;
        let promises = [];

        query = CATEGORIES;

        if (subject || teacher || search) query += ` WHERE `;

        if (subject) {
            query += `id_subject = $3`;
            values.push(`${techer}`);
        }

        if (teacher) {
            query += `id_user = $3`;
            values.push(`${techer}`);
        }

        if ((from != undefined) && limit) {
            values = [...values, limit, from];
            query += `${PAGINATION}`;


        }
        else {
            query = `${CALENDARS_OPTIONS} ORDER BY year, semester`;
            promises.push(pool.query(query));
        }


        const { rows } = (await Promise.all(promises))[0];

        const total = rows.length != 0 ? rows[0].count : 0;

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

async function createCategory(req, res) {

    try {
        const {
            id_user, id_subject, name
        } = req.body;

        if (id_user && id_subject && name) {

            const { rows } = await pool.query('INSERT INTO categories(id_user, id_subject, name) VALUES($1, $2, $3)', [id_user, id_subject, name]);
            res.status(201).send(rows[0])
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
    createCategory
}