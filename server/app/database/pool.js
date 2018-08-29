const {
  Pool
} = require('pg');
const config_db = require('../config/config');
const pool = new Pool(config_db);

/*
(async () => {
  const text = 'SELECT * FROM colrs'

  try {
    const res = await pool.query(text)
    console.log(res.rows[0])
  } catch (err) {
    console.log(typeof(err.stack))
    console.log(err.stack)
  }
})()*/

module.exports = {
  query: (text, params) => pool.query(text, params)
}