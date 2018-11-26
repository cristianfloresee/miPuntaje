'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');

async function getModules(req, res) {
    try {
        const {
            id_course,
        } = req.query;

        console.log(`id_course: ${id_course}`);
        if (id_course) {
            const text = `SELECT id_module, id_course, name, position, created_at, updated_at FROM modules WHERE id_course = $1`;
            const values = [id_course];
            const {
                rows
            } = await pool.query(text, values);
            //const total_items = rows.length != 0 ? rows[0].count : 0;
            res.json(rows)
        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }

    } catch (error) {
        next({ error });
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
        next({ error });
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
        res.sendStatus(204);

    } catch (error) {
        next({ error });
    }
}

async function updateModule(req, res) {
    try {
        console.log("update module..");
        const id_module = req.params.moduleId;
        const {
            name
        } = req.body;

        const text = 'UPDATE modules SET name = $1 WHERE id_module = $2 RETURNING id_module, id_course, name, position, created_at, updated_at';
        const values = [name, id_module];
        const { rows } = await pool.query(text, values);

        res.json(rows[0])


        res.status()
    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getModules,
    createModule,
    deleteModule,
    updateModule
}