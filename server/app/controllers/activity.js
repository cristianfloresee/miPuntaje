'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');
var socket = require('../../index');
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

        const text2 = `
        SELECT m.id_course 
        FROM modules AS m
        INNER JOIN classes AS c
        ON m.id_module = c.id_module
        WHERE c.id_class = $1`;
        const values2 = [id_lesson];
        const id_course = (await pool.query(text2, values2)).rows[0].id_course;

        // Obtiene el websocket
        let io = socket.getSocket();
        //console.log(`Emite evento a la sala: ${id_course+'class-section-room'}`)
        io.in(id_course + 'activity-section-room').emit('activityCreated');

        //res.sendStatus(201); // Error: Unexpected token JSON at position 0
        res.status(201).send(); // Funciona
    } catch (error) {
        next({
            error
        });
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
        // En una parte utiliza status = 2 para mostrar si en una actividad hubieron ganadores
        const text = `SELECT a.id_activity, a.name, a.mode, a.status, a.created_at, a.updated_at, c.id_class, c.description AS lesson, m.id_module, m.name AS module, 
        CASE WHEN EXISTS (
            SELECT id_user 
            FROM activity_user AS au 
            WHERE id_activity = a.id_activity 
            AND status = 2
        ) THEN TRUE ELSE FALSE END AS winners 
        FROM activities AS a 
        INNER JOIN classes AS c 
        ON c.id_class = a.id_class 
        INNER JOIN modules AS m 
        ON m.id_module = c.id_module 
        WHERE id_course = $1 
        AND ($2::int is null or a.mode = $2) 
        AND ($3::int is null or a.status = $3) 
        LIMIT $4 OFFSET $5`;
        const values = [id_course, mode, status, page_size, from];
        const {
            rows
        } = await pool.query(text, values);

        // Obtiene la cantidad total de Actividades por ID Curso (Parámetros de Filtro Opcionales)
        const text2 = 'SELECT count(*) FROM activities WHERE id_class IN (SELECT id_class FROM classes WHERE id_module IN (SELECT id_module FROM modules WHERE id_course = $1)) AND ($2::int is null or mode = $2) AND ($3::int is null or status = $3)';
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
        next({
            error
        });
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

        // Necesito saber si el estado de la actividad cambio
        const text3 = `SELECT status FROM activities WHERE id_activity = $1`;
        const values3 = [id_activity];
        const original_status = (await pool.query(text3, values3)).rows[0];

        // Obtiene el id_course y el subject para emitir el evento a la sala del curso
        const text4 = `
         SELECT m.id_course, s.name AS subject 
         FROM modules AS m
         INNER JOIN classes AS cl
         ON cl.id_module = m.id_module
         INNER JOIN courses AS c
         ON m.id_course = c.id_course
         INNER JOIN subjects AS s
         ON c.id_subject = s.id_subject
         WHERE id_class = $1`;
        const values4 = [id_class];
        const {
            id_course,
            subject
        } = (await pool.query(text4, values4)).rows[0];


        // Inicia la transacción
        client.query('BEGIN');

        // Array para ejecutar consultas en paralelo
        let promises = [];

        // Actualiza los datos de la actividad
        if (id_class && name && mode && status != undefined) {
            const text1 = `
            UPDATE activities 
            SET id_class = $1, name = $2, mode = $3, status = $4 
            WHERE id_activity = $5`;
            const values1 = [id_class, name, mode, status, id_activity];
            // Agrega la query al array 'promises'
            promises.push(client.query(text1, values1));
        }

        // Actualiza la participación en la actividad
        if (array_participation.length > 0) {
            const {
                text2,
                values2
            } = updateParticipation(id_activity, array_participation);
            // Agrega la query al array 'promises'
            promises.push(client.query(text2, values2));
        }

        // Ejecuta las consultas en paralelo
        const result_update = await Promise.all(promises);
        // Finaliza la transacción
        await client.query('COMMIT');


        // Obtiene el websocket
        let io = socket.getSocket();

        // Emite evento a todos los estudiantes que esten en la sección de clases de este curso.
        io.in(id_course + 'activity-section-room').emit('activityUpdated');

        // Si el estado de la actividad es 2 (iniciada) y cambia, se le notifica a los estudiantes del curso.
        if (status == 2 && original_status != status) {
            console.log(" + notifica a estudiantes el inicio de una actividad");
            
            io.in(id_course + 'students').emit('activityStarted', {
                id_course,
                subject
            });
        }

        // Envía la respuesta
        res.sendStatus(204);
    } catch (error) {
        next({
            error
        });
    }

}


async function getCountActivities() {

}

async function getStudentsByActivityID(req, res, next) {
    try {
        const id_activity = req.query.id_activity;
        //console.log("get students by activity: ", id_activity);
        const text = `SELECT u.id_user, u.document, u.name, u.last_name, u.middle_name, au.status 
        FROM activity_user AS au 
        INNER JOIN users AS u 
        ON au.id_user = u.id_user 
        WHERE id_activity = $1`;
        const values = [id_activity];
        const {
            rows
        } = await pool.query(text, values);

        // Envía la Respuesta
        res.json(rows);
    } catch (error) {
        next({
            error
        });
    }
}

async function deleteActivity(req, res, next) {
    try {
        const id_activity = req.params.activityId;

        const text = 'DELETE FROM activities WHERE id_activity = $1 RETURNING id_class';
        const values = [id_activity];
        const id_class = (await pool.query(text, values)).rows[0].id_class;

        // Obtiene el id_course
        const text2 = `
        SELECT m.id_course 
        FROM modules AS m
        INNER JOIN classes AS c
        ON m.id_module = c.id_module
        WHERE c.id_class = $1`;
        const values2 = [id_class];
        const id_course = (await pool.query(text2, values2)).rows[0].id_course;

        // Obtiene el websocket
        let io = socket.getSocket();
        //console.log(`Emite evento a la sala: ${id_course+'class-section-room'}`)
        io.in(id_course + 'activity-section-room').emit('activityDeleted');

        res.sendStatus(204);
    } catch (error) {
        next({
            error
        });
    }
}


// ----------------------------------------
// Actualiza la Participación en la Actividad
// ----------------------------------------
function updateParticipation(id_activity, array_participation) {
    // array_participation: {id_user, status}

    // Actualizar múltiples registros en una query: https://stackoverflow.com/questions/37048772/update-multiple-rows-from-multiple-params-in-nodejs-pg
    // Actualizar múltiples registros pasando un array de objetos: https://stackoverflow.com/questions/37059187/convert-object-array-to-array-compatible-for-nodejs-pg-unnest

    // Inserta el 'id_activity' en cada registro (Object) del array 'array_participation'
    array_participation.map(participation => Object.assign(participation, {
        id_activity
    }));
    // [ {id_user, id_activity, status} ]

    const text2 = `
	UPDATE activity_user AS au 
	SET status = s.status 
	FROM (
		SELECT (a->>'id_activity')::int AS id_activity, (a->>'id_user')::int AS id_user, (a->>'status')::int AS status
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