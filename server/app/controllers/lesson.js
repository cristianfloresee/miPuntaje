'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');
var socket = require('../../index');
// ----------------------------------------
// Get Lessons
// ----------------------------------------
async function getLessons(req, res, next) {
    try {
        // Query Params
        const id_course = req.query.id_course || null;
        const id_module = req.query.id_module || null;
        const status = req.query.status || null;
        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        // Obtiene las clases
        const text = `SELECT m.name AS module, c.id_class, c.id_module, c.description, c.status, c.date, c.created_at, c.updated_at 
        FROM modules AS m 
        INNER JOIN classes AS c 
        ON m.id_module = c.id_module 
        WHERE ($1::int IS NULL OR m.id_course = $1) 
        AND ($2::int IS NULL OR m.id_module = $2) 
        AND ($3::int IS NULL OR c.status = $3) 
        LIMIT $4 
        OFFSET $5`;
        const values = [id_course, id_module, status, page_size, from];
        const {
            rows
        } = await pool.query(text, values);

        // Obtiene la cantidad total de clases (de acuerdo a los parámetros de filtro)
        const text2 = `
        SELECT count(*) 
        FROM classes 
        WHERE ($1::int IS NULL OR id_module = $1) 
        AND ($2::int IS NULL OR id_module IN (
            SELECT id_module 
            FROM modules 
            WHERE id_course = $2)
            ) 
        AND ($3::int IS NULL OR status = $3)`;
        const values2 = [id_module, id_course, status];
        const total_items = (await pool.query(text2, values2)).rows[0].count;

        // Envía la respuesta al cliente
        res.json({
            info: {
                total_pages: Math.ceil(total_items / page_size),
                page: page,
                page_size: page_size,
                total_items: parseInt(total_items),
            },
            items: rows
        })
    } catch (error) {
        next({
            error
        });
    }
}

async function getClassById(req, res, next) {

    try {

        const id_class = req.params.classId;
        // Obtiene las clases
        const text = `
        SELECT c.id_class, c.id_module, c.description, c.date, c.created_at, c.updated_at, c.status, m.name AS module, co.name AS course, s.name AS subject
        FROM classes AS c
        INNER JOIN modules AS m
        ON c.id_module = m.id_module
        INNER JOIN courses AS co
        ON m.id_course = co.id_course
        INNER JOIN subjects AS s
        ON co.id_subject = s.id_subject
        WHERE c.id_class = $1`;
        const values = [id_class];
        const {
            rows
        } = await pool.query(text, values);

        res.send(rows[0]);
    } catch (error) {
        next({
            error
        });
    }
}


// ----------------------------------------
// Get Lessons as Select Options
// ----------------------------------------
async function getLessonOptions(req, res, next) {
    try {
        // Query Params
        const id_module = req.query.id_module; // Obligatorio por ahora    

        // Consulta que obtiene las clases
        const text = 'SELECT id_class, description FROM classes WHERE id_module = $1';
        const values = [id_module];
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

// ----------------------------------------
// Create Lesson
// ----------------------------------------
async function createLesson(req, res, next) {

    try {
        // Body Params
        const {
            id_module,
            description,
            date
        } = req.body;

        const text = 'INSERT INTO classes(id_module, description, date) VALUES($1, $2, $3) RETURNING id_module, description, status, date, created_at, updated_at';
        const values = [id_module, description, date];
        const {
            rows
        } = await pool.query(text, values);

        // Obtiene el id_course para emitir evento a la sala del curso
        const text2 = `
            SELECT id_course 
            FROM modules
            WHERE id_module = $1`;
        const values2 = [id_module];
        const id_course = (await pool.query(text2, values2)).rows[0].id_course;
        console.log("ID COURSE: ", id_course);

        // Obtiene el websocket
        let io = socket.getSocket();
        console.log(`Emite evento a la sala: ${id_course+'class-section-room'}`)
        io.in(id_course + 'class-section-room').emit('classCreated');

        // Envía la Respuesta
        res.status(201).send(rows[0]);
    } catch (error) {
        next({
            error
        });
    }
}

// ----------------------------------------
// Update Lesson
// ----------------------------------------
async function updateLesson(req, res, next) {
    try {
        const id_class = req.params.lessonId;
        const {
            id_module,
            description,
            date,
            status
        } = req.body;

        // Si es que se va a iniciar una clase
        
        if (status == 2) {
            // + Primero obtener el id_course
            const text7 = `
            SELECT id_course 
            FROM modules
            WHERE id_module = $1`
            const values7 = [id_module];
            const id_course = (await pool.query(text7, values7)).rows[0].id_course;

            // + comprobar que no halla otra clase iniciada en el curso.
            const text8 = `
        SELECT CASE WHEN EXISTS (
            SELECT c.status 
            FROM classes AS c
            INNER JOIN modules AS m
            ON c.id_module = m.id_module
            WHERE m.id_course = $1
            AND c.id_class != $2
            AND c.status = 2
            ) THEN TRUE ELSE FALSE END AS any_class_started`;
            const values8 = [id_course, id_class];
            const any_class_started = (await pool.query(text8, values8)).rows[0].any_class_started;
            console.log("another_class_started: ", any_class_started);

            // Si es que ya hay una pregunta iniciada, enviar null para que no se inicie la clase
            if(any_class_started) return res.send(null);
                
        }

        // Necesito saber si el estado de la clase cambio
        // También comprobar si existe el registro??
        const text3 = `SELECT status FROM classes WHERE id_class = $1`;
        const values3 = [id_class];
        const original_status = (await pool.query(text3, values3)).rows[0];

        // Actualiza la clase
        const text = `
        UPDATE classes 
        SET id_module = $1, description = $2, date = $3, status = $4 
        WHERE id_class = $5 
        RETURNING *`;
        const values = [id_module, description, date, status, id_class];
        const res2 = (await pool.query(text, values)).rows[0];

        // Obtiene el id_course y el subject para emitir el evento a la sala del curso
        const text2 = `
          SELECT m.id_course, s.name AS subject 
          FROM modules AS m
          INNER JOIN courses AS c
          ON m.id_course = c.id_course
          INNER JOIN subjects AS s
          ON c.id_subject = s.id_subject
          WHERE id_module = $1`;
        const values2 = [id_module];
        const {
            id_course,
            subject
        } = (await pool.query(text2, values2)).rows[0];

        // Obtiene el websocket
        let io = socket.getSocket();

        // Emite evento a todos los estudiantes que esten en la sección de clases de este curso.
        io.in(id_course + 'class-section-room').emit('classUpdated', {
            
        });

        // Si el estado de la clase es 2 (iniciada) y cambia, se le notifica a los estudiantes del curso.
        if (status == 2 && original_status != status) {
            console.log(" + notifica a estudiantes el inicio de una clase");
            

            // Saber que estudiantes están en la sala
            io.of('/').in(id_course + 'students').clients((error, clients) => {
                console.log("CHIMUELO: ", clients);
            });

            // Emite evento a todos los usuarios (estudiantes) que pertenezcan al curso.
            // Necesito: id_course, subject, 
            io.in(id_course + 'students').emit('classStarted', {
                id_course,
                subject
            });

        }

        res.json(res2)

    } catch (error) {
        next({
            error
        });
    }
}

// ----------------------------------------
// Delete Lesson
// ----------------------------------------
async function deleteLesson(req, res, next) {

    try {
        // Params
        const id_lesson = req.params.lessonId;

        // Elimina la clase en base al 'id_lesson'
        const text = 'DELETE FROM classes WHERE id_class = $1 RETURNING id_module';
        const values = [id_lesson];
        const id_module = (await pool.query(text, values)).rows[0].id_module;

        console.log("ID MODULE (ALIMINAR): ", id_module);
        // Obtiene el id_class para emitir evento socket
        const text2 = `
        SELECT id_course 
        FROM modules
        WHERE id_module = $1`;
        const values2 = [id_module];
        const id_course = (await pool.query(text2, values2)).rows[0].id_course;
        // Obtiene el websocket
        let io = socket.getSocket();
        //console.log(`Emite evento a la sala: ${id_course+'class-section-room'}`)

        // Emite evento a todos los estudiantes que esten en la sección de clases de este curso.    
        io.in(id_course + 'class-section-room').emit('classDeleted');

        // Envía la respuesta al cliente
        res.sendStatus(204);
    } catch (error) {
        next({
            error
        });
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getLessons,
    getClassById,
    getLessonOptions,
    createLesson,
    updateLesson,
    deleteLesson
}