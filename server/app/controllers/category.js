'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const pool = require('../database');

//FRAGMENTOS DE CONSULTA
const CATEGORIES = 'SELECT id_category, id_user, id_subject, name, created_at, updated_at, count(*) OVER() AS count FROM categories';
const CATEGORIES_OPTIONS = `SELECT id_category, name FROM categories`;
const PAGINATION = ' ORDER BY id_category LIMIT $1 OFFSET $2';



async function getCategories(req, res) {

    try {
        const subject = req.params.subject;
        const teacher_options = req.params.teacher_options;
        const search = req.query.search;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);
        const last_by_techer = req.query.last_by_teacher;


        const id_user = req.query.id_user;
        const id_subject = req.query.id_subject;
        console.log(`kilawa.. id_user: ${id_user}, id_subject: ${id_subject}`);
        //OBTIENE LAS CATEGORIAS DE UN PROFESOR, PARA UNA ASIGNATURA ESPECÍFICA
        if(id_user && id_subject){
            const text = `SELECT id_category, name FROM categories WHERE id_user = $1 AND id_subject = $2;`;
            const values = [id_user, id_subject];
            console.log("chorizo: ", text);
            const { rows } = await pool.query(text, values);
            return res.send(rows)
        }


        let values, query;

        if (last_by_techer) {
            const query = `SELECT s.name AS subject, c.id_category, c.name, c.created_at, c.updated_at FROM categories AS c INNER JOIN subjects AS s ON s.id_subject = c.id_subject WHERE id_user = $1 ORDER BY c.updated_at DESC LIMIT 5`;
            const values = [last_by_techer];
            const { rows } = await pool.query(query, values);
            return res.send(rows)
        }


        if(teacher_options){
            const query = `${CATEGORIES_OPTIONS} WHERE id_user = $1 ORDER BY name`;
            const values = [teacher_options]
            const { rows } = await pool.query(query, values);
            return res.send(rows[0])
        }
        else if ((from != undefined) && limit) {
            query = CATEGORIES;
            values = [limit, from];

            if (subject || search) query += ` WHERE `;
            if (subject) {
                query += `id_subject = $${values.length + 1}`;
                values.push(`${subject}`);
            }
            if (search) {
                query += `name = $${values.length + 1}`;
                values.push(`${search}`);
            }
            query += `${PAGINATION}`;

        } 
        else {
            query = `${CATEGORIES_OPTIONS} ORDER BY name`;
        } 
        
        //console.log("QUERY: ", query);
        //console.log("VALUE: ", values);
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