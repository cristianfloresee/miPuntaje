'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');

//FRAGMENTOS DE CONSULTA
//const SUBCATEGORIES = 'SELECT id_category, id_user, id_subject, name, created_at, updated_at, count(*) OVER() AS count FROM categories';
const SUBCATEGORY_OPTIONS = `SELECT id_subcategory, name FROM subcategories`;
const PAGINATION = ' ORDER BY id_category LIMIT $1 OFFSET $2';



async function getSubcategories(req, res) {

    try {
        const subject = req.params.subject;
        const teacher = req.params.teacher;
        const search = req.query.search;
        const category_options = req.query.category_options;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);
        const last_by_techer = req.query.last_by_teacher;

        let values, query;

        if (last_by_techer) {
            const query = `SELECT su.name AS subject, c.name AS category, s.id_subcategory, s.name, s.created_at, s.updated_at FROM subcategories AS s INNER JOIN categories AS c ON s.id_category = c.id_category INNER JOIN subjects AS su ON su.id_subject = c.id_subject WHERE id_user = $1 ORDER BY s.updated_at DESC LIMIT 5;`;
            const values = [last_by_techer];
            const { rows } = await pool.query(query, values);
            return res.send(rows)
        }

        if (category_options) {
            const query = `${SUBCATEGORY_OPTIONS} WHERE id_category = $1 ORDER BY name`;
            const values = [category_options]
            const { rows } = await pool.query(query, values);
            return res.send(rows)
        }

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
        next({ error });
    }
}

async function createSubcategory(req, res) {

    try {
        const {
            id_category,
            name
        } = req.body;

        if (id_category && name) {

            const {
                rows
            } = await pool.query('INSERT INTO subcategories(id_category, name) VALUES($1, $2)', [id_category, name]);
            res.status(201).send(rows[0])
        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Delete Subcategory
// ----------------------------------------
async function deleteSubcategory(req, res) {
    try {
        const id_subcategory = req.params.subcategoryId;

        const text = 'DELETE FROM subcategories WHERE id_subcategory = $1';
        const values = [id_subcategory]
        const { rows } = await pool.query(text, values);
        res.sendStatus(204);

    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getSubcategories,
    createSubcategory,
    deleteSubcategory
}