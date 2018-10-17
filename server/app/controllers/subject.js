'use strict'

//LIBRERIAS
const pool = require('../database/pool');
const SUBJECTS = `SELECT id_subject, name, created_at, updated_at FROM subjects`;
const SUBJECTS_OPTIONS = `SELECT id_subject, name FROM subjects`
const PAGINATION = ` ORDER BY id_subject LIMIT $1 OFFSET $2`;

async function getSubjects(req, res) {
    try {

        //PARÁMETROS DE FILTRO OPCIONAL:
        const search = req.query.search;
        const from = Number(req.query.from);
        const limit = Number(req.query.limit);
        
        let values, query;
        let promises = [];
    
        if ((from != undefined) && limit) {
            values = [limit, from];
            query = SUBJECTS;
            if (search) {
                query += ` WHERE name LIKE $3`;
                values.push(`%${search}%`);
            }
            query += `${PAGINATION}`;
            promises.push(pool.query(query, values));
        }
        else {
            query = `${SUBJECTS_OPTIONS} ORDER BY id_subject`;
            promises.push(pool.query(query));
        }


        const  { rows }  = (await Promise.all(promises))[0];

        // console.log("query: ", query);
        // console.log("values: ", values);
        // console.log("rows: ", rows)
        // const {
        //     rows
        // } = await pool.query(query, values);
        res.json({
            subjects: rows
        })
    } catch (error) {
        console.log(`database ${error}`)
        res.status(500).json({
            message: 'error in obtaining subjects',
            error: error
        })
    }
}



async function createSubject(req, res) {

    try {
        const {
            name
        } = req.body;

        const { rows } = await pool.query('INSERT INTO subjects(name) VALUES($1)', [name]);
        res.json({ message: 'successfully created subject' })

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

async function updateSubject(req, res) {
    try {
        const id_subject = req.params.subjectId;
        const {
            name
        } = req.body;

        let text = 'UPDATE subjects SET name = $1 WHERE id_subject = $2 RETURNING id_subject, name, created_at, updated_at';
        let values = [name, id_subject];
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

async function countSubject(req, res) {
    try {
        const { rows } = await pool.query('SELECT count(*) AS count FROM subjects');
        res.json({
            result: rows[0].count
        });
    }
    catch (error) {
        console.log(`${error}`)
        res.status(500).json({
            success: false,
            error
        });
    }
}

async function deleteSubject(req, res) {
    try {
        const id_subject = req.params.subjectId;
        const {
            rows
        } = await pool.query('DELETE FROM subjects WHERE id_subject = $1', [id_subject]);
        res.json({
            message: 'successfully deleted subject'
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
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    countSubject
}