const { Pool } = require('pg');
var config_db = require('../config/config_db');
config_db = config_db[process.env.NODE_ENV] || config_db['development'];
const pool = new Pool(config_db);

async function query (q, ...args) {
  const client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q, args)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err;
    }
  } finally {
    client.release()
  }
  return res;
}

module.exports = query;