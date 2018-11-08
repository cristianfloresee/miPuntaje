'use strict'

const pool = require('../database');

async function getRoles(req, res) {
    try {
        const text = `SELECT * FROM role`;
        const { rows } = await pool.query(text);
        res.json(rows)
    } catch (err) {
        console.log(`database ${err}`)
        res.json({'success':false, 'err':err});
    }
}

module.exports = {
    getRoles
}