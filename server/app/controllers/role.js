'use strict'

const pool = require('../database/pool');

async function getRoles(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM role');
        res.json(rows)
    } catch (err) {
        console.log(`database ${err}`)
        res.json({'success':false, 'err':err});
    }
}

module.exports = {
    getRoles
}