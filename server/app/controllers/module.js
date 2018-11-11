'use strict'

const pool = require('../database');

async function getModules(req, res) {
    try {
        const {
            id_course,
        } = req.query;

        console.log(`id_course: ${id_course}`);
        if (id_course) {
            const text = `SELECT id_module, id_course, name, position, created_at, updated_at, count(*) OVER() AS count FROM modules WHERE id_course = $1`;
            const values = [id_course];
            const {
                rows
            } = await pool.query(text, values);
            const total = rows.length != 0 ? rows[0].count : 0;
            res.json({
                total,
                results: rows
            })
        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }

    } catch (error) {
        console.log(`${error}`)
        res.status(500).json({
            message: 'error in obtaining calendars',
            error
        });
    }
}

async function createModule(req, res) {

    try {
        const {
            id_course,
            name
        } = req.body;

        if (id_course, name) {

            const {
                rows
            } = await pool.query('INSERT INTO modules(id_course, name) VALUES($1, $2)', [id_course, name]);
            res.json({
                message: 'successfully created module'
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

async function deleteModule(req, res) {
    try {
        console.log("entro al delete module");
        const id_module = req.params.moduleId;

        const text = 'DELETE FROM modules WHERE id_module = $1';
        const values = [id_module];
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


module.exports = {
    getModules,
    createModule,
    deleteModule
}