'use strict'

const pool = require('../database/pool');

//FRAGMENTOS DE CONSULTA
const CATEGORIES = 'SELECT id_category, id_user, id_subject, name, created_at, updated_at, count(*) OVER() AS count FROM categories';
const CATEGORIES_OPTIONS = `SELECT id_category, name FROM categories`;
const PAGINATION = ' ORDER BY id_category LIMIT $1 OFFSET $2';



async function getCategories(req, res) {

    try {
        const subject = req.params.subject;
        const teacher = req.params.teacher;
        const search = req.query.search;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);

        let values, query;

        if ((from != undefined) && limit) {
            query = CATEGORIES;
            values = [limit, from];

            if (subject || teacher || search) query += ` WHERE `;
            if (subject) {
                query += `id_subject = $${values.length + 1}`;
                values.push(`${subject}`);
            }
            if (teacher) {
                query += `id_user = $${values.length + 1}`;
                values.push(`${teacher}`);
            }
            if (search) {
                query += `name = $${values.length + 1}`;
                values.push(`${search}`);
            }
            query += `${PAGINATION}`;

        } else {
            query = `${CATEGORIES_OPTIONS} ORDER BY name`;
        } 
        
        console.log("QUERY: ", query);
        console.log("VALUE: ", values);
        const { rows } = await pool.query(query, values);


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
            id_user,
            id_subject,
            name
        } = req.body;

        if (id_user && id_subject && name) {

            const {
                rows
            } = await pool.query('INSERT INTO categories(id_user, id_subject, name) VALUES($1, $2, $3)', [id_user, id_subject, name]);
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


async function deleteCategory(req, res) {
    try {
        const id_category = req.params.categoryId;

        const { rows } = await pool.query('DELETE FROM categories WHERE id_category = $1', [id_category]);
        res.status(204).send();

    } catch (error) {
        console.log(`database ${error}`)
        res.status(500).json({
            success: false,
            error
        });
    }
}


module.exports = {
    getCategories,
    createCategory,
    deleteCategory
}