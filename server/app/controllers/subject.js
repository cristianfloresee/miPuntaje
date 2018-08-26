'use strict'

const pool = require('../database/pool');

async function getSubjects(req, res) {
    try {
        const {
            rows
        } = await pool('SELECT * FROM subject');
        res.json(rows)
    } catch (err) {
        console.log(`database ${err}`)
        res.send({
            error: err
        })
    }
}

async function setSubject(req, res) {
    try {
        const {
            rows
        } = await pool('INSERT INTO subject (nombre_asignatura) VALUES (?)', [req.body.name]);
        //res.json(rows)
        res.json({
            'success': true,
            'id_asignatura': rows.insertId
        });
    } catch (err) {
        console.log(`database ${err}`)
        res.json({
            'success': false,
            'err': error
        });
    }
}

module.exports = {
    getColors
}