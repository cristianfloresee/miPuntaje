'use strict'

const pool = require('../database/pool');

async function getSubjects(req, res) {
    try {
        const {
            rows
        } = await pool.query('SELECT * FROM subjects');
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

// async function setSubject(req, res) {
//     try {
//         const {
//             rows
//         } = await pool.query('INSERT INTO subject (nombre_asignatura) VALUES (?)', [req.body.name]);
//         //res.json(rows)
//         res.json({
//             'success': true,
//             'id_asignatura': rows.insertId
//         });
//     } catch (err) {
//         console.log(`database ${err}`)
//         res.json({
//             'success': false,
//             'err': error
//         });
//     }
// }

module.exports = {
    getSubjects,
    //setSubject
}