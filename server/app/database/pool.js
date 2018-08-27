const { Pool } = require('pg');
const config_db = require('../config/config');
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