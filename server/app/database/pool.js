//ESTRUCTURA DE NODE-POSTGRES BASADA EN LA DOC.
//https://node-postgres.com/guides/project-structure
//CONSEJOS DEL CREADOR DE NODE-POSTGRES:
//https://gist.github.com/brianc/f906bacc17409203aee0
//CONSEJOS COMPLEMENTAR PG CON 
//https://engineering.smrxt.com/tinypg-for-postgres-queries/
//https://www.wlaurance.com/2016/09/node.js-postgresql-transactions-and-query-examples/
//https://stackoverflow.com/questions/52787289/how-to-pool-postgresql-connections-in-nodejs-with-facade-design-pattern
//https://www.wlaurance.com/2016/09/node.js-postgresql-transactions-and-query-examples/
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

//EXPORTAR TRANSACCIONES
/*
(async () => {
  // note: we don't try/catch this because if connecting throws an exception
  // we don't need to dispose of the client (it will be undefined)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const {
      rows
    } = await client.query('INSERT INTO users(name) VALUES($1) RETURNING id', ['brianc'])

    const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
    const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
    await client.query(insertPhotoText, insertPhotoValues)
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})().catch(e => console.error(e.stack))
*/

/*
async function transaction(q) {
  const client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res
}
*/

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}