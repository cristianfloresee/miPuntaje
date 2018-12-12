'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');

// ----------------------------------------
// Crear Actividad
// ----------------------------------------
async function createActivity(req, res, next) {

    try {
        // Body Params
        const {
            id_lesson,
            name,
            mode
        } = req.body;

        const text = 'INSERT INTO activities(id_class, name, mode) VALUES($1, $2, $3)';
        const values = [id_lesson, name, mode];
        await pool.query(text, values);

        //res.sendStatus(201); // Error: Unexpected token JSON at position 0
        res.status(201).send(); // Funciona
    } catch (error) {
        next({ error });
    }
}


// ----------------------------------------
// Get Activities
// ----------------------------------------
async function getActivities(req, res, next) {

    try {
        // Query Params
        const id_course = req.query.id_course;
        const mode = req.query.mode || null;
        const status = req.query.status || null;
        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        // Obtiene las Actividades por ID Curso (Parámetros de Filtro Opcionales)
        const text = 'SELECT a.id_activity, a.name, a.mode, a.status, a.created_at, a.updated_at, c.id_class, c.description AS lesson, m.id_module, m.name AS module, CASE WHEN EXISTS (SELECT id_user FROM activity_student AS au WHERE id_activity = a.id_activity AND status = TRUE) THEN TRUE ELSE FALSE END AS winners FROM activities AS a INNER JOIN classes AS c ON c.id_class = a.id_class INNER JOIN modules AS m ON m.id_module = c.id_module WHERE id_course = $1 AND ($2::int is null or a.mode = $2) AND ($3::bool is null or a.status = $3) LIMIT $4 OFFSET $5';
        const values = [id_course, mode, status, page_size, from];
        const { rows } = await pool.query(text, values);

        // Obtiene la cantidad total de Actividades por ID Curso (Parámetros de Filtro Opcionales)
        const text2 = 'SELECT count(*) FROM activities WHERE id_class IN (SELECT id_class FROM classes WHERE id_module IN (SELECT id_module FROM modules WHERE id_course = $1)) AND ($2::int is null or mode = $2) AND ($3::bool is null or status = $3)';
        const values2 = [id_course, mode, status];
        const total_items = (await pool.query(text2, values2)).rows[0].count;

        // Envía la Respuesta
        res.json({
            info: {
                total_pages: Math.ceil(total_items / page_size),
                page: page,
                page_size: page_size,
                total_items: parseInt(total_items),
            },
            items: rows
        });
    } catch (error) {
        next({ error });
    }
}

async function updateActivity(req, res, next) {

    try {
        // Revisar esto...
        const client = await pool.pool.connect();

        const id_activity = parseInt(req.params.activityId);
        // Body Params
        const id_class = req.body.id_lesson;
        const name = req.body.name;
        const mode = req.body.mode;
        const status = req.body.status;
        const array_participation = req.body.array_participation;

        console.log(`id_activity: ${id_activity}, id_class: ${id_class}, name: ${name}, mode: ${mode}, status: ${status}`)

        // Inicia la transacción
        client.query('BEGIN');

        // Array para ejecutar consultas en paralelo
        let promises = [];
        
        // Actualiza los datos de la actividad
        if (id_class && name && mode && status != undefined) {
            const text1 = 'UPDATE activities SET id_class = $1, name = $2, mode = $3, status = $4 WHERE id_activity = $5';
            const values1 = [id_class, name, mode, status, id_activity];
            // Agrega la query al array 'promises'
            promises.push(client.query(text1, values1));
        }

        // Actualiza la participación en la actividad
        if (array_participation.length > 0) {
            const { text2, values2 } = updateParticipation(id_activity, array_participation);
            // Agrega la query al array 'promises'
            promises.push(client.query(text2, values2));
        }

        // Ejecuta las consultas en paralelo
        const result_update = await Promise.all(promises);
        // Finaliza la transacción
        await client.query('COMMIT');
        // Envía la respuesta
        res.sendStatus(204);
    } catch (error) {
        next({ error });
    }

}


async function getCountActivities() {

}

async function getStudentsByActivityID(req, res, next) {
    try {
        const id_activity = req.query.id_activity;
        console.log("get students by activity: ", id_activity);
        const text = 'SELECT u.id_user, u.name, u.last_name, u.middle_name, au.status FROM activity_student AS au INNER JOIN users AS u ON au.id_user = u.id_user WHERE id_activity = $1';
        const values = [id_activity];
        const { rows } = await pool.query(text, values);

        // Envía la Respuesta
        res.json(rows);
    } catch (error) {
        next({ error });
    }
}

async function deleteActivity(req, res) {
    try {
        const id_activity = req.params.activityId;

        const text = 'DELETE FROM activities WHERE id_activity = $1';
        const values = [id_activity];
        await pool.query(text, values);

        res.sendStatus(204);
    } catch (error) {
        next({ error });
    }
}


// ----------------------------------------
// Actualiza la Participación en la Actividad
// ----------------------------------------
function updateParticipation(id_activity, array_participation) {

    // Actualizar múltiples registros en una query: https://stackoverflow.com/questions/37048772/update-multiple-rows-from-multiple-params-in-nodejs-pg
    // Actualizar múltiples registros pasando un array de objetos: https://stackoverflow.com/questions/37059187/convert-object-array-to-array-compatible-for-nodejs-pg-unnest

    // Inserta el 'id_activity' en cada registro (Object) del array 'array_participation'
    array_participation.map(participation => Object.assign(participation, { id_activity }));

    const text2 = `
	UPDATE activity_student AS au 
	SET status = s.status 
	FROM (
		SELECT (a->>'id_activity')::int AS id_activity, (a->>'id_user')::int AS id_user, (a->>'status')::bool AS status
		FROM (
        	SELECT jsonb_array_elements(a) AS a
        	FROM (values (($1)::jsonb)) s(a)
    	) AS s 
	) AS s
	WHERE au.id_activity = s.id_activity 
	AND au.id_user = s.id_user`;
    const values2 = [JSON.stringify(array_participation)];
    return {
        text2,
        values2
    }
}


// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getActivities,
    getStudentsByActivityID,
    createActivity,
    updateActivity,
    deleteActivity,
    // countCalendar
}