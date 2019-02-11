'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');
const _file = require('../services/file');
var socket = require('../../index');

// ----------------------------------------
// Obtiene las preguntas que ya han sido agregadas a la clase.
// + Enviar atributo winners: true/false
// ----------------------------------------
async function getLessonQuestions(req, res, next) {

    try {
        // Query Params
        const id_lesson = req.query.id_lesson;
        const id_category = req.query.id_category || null;
        const id_subcategory = req.query.id_subcategory || null;
        const difficulty = req.query.difficulty || null;
        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        console.log(`id_lesson: ${id_lesson}, id_category: ${id_category}, id_subcategory: ${id_subcategory}, difficulty: ${difficulty}, page_size: ${page_size}, page: ${page}`);

        /*
         CASE WHEN EXISTS (
            SELECT id_user 
            FROM activity_user AS au 
            WHERE id_activity = a.id_activity 
            AND status = 2
        ) THEN TRUE ELSE FALSE END AS winners

        */

        // Obtiene las preguntas por id de usuario (profesor) y id de asignatura 
        const text = `SELECT c.id_category, c.name AS category, s.id_subcategory, s.name AS subcategory, q.id_question, q.description, q.difficulty, q.shared, q.image, cq.status, cq.added_at, cq.updated_at,

        CASE WHEN EXISTS (
            SELECT id_user
            FROM user_question_class
            WHERE id_question = q.id_question
            AND id_class = cq.id_class
            AND status = 4
        ) THEN TRUE ELSE FALSE END AS winners

        FROM questions AS q
        INNER JOIN class_question AS cq
        ON q.id_question = cq.id_question
        INNER JOIN subcategories AS s 
        ON q.id_subcategory = s.id_subcategory 
        INNER JOIN categories AS c 
        ON s.id_category = c.id_category
        WHERE cq.id_class = $1
        AND ($2::int IS NULL OR c.id_category = $2)
        AND ($3::int IS NULL OR s.id_subcategory = $3)
        AND ($4::int IS NULL OR q.difficulty = $4)
        ORDER BY q.updated_at DESC
        LIMIT $5 
        OFFSET $6`;
        const values = [id_lesson, id_category, id_subcategory, difficulty, page_size, from];
        const {
            rows
        } = await pool.query(text, values);

        // Obtiene la cantidad total de preguntas (de acuerdo a los parámetros de filtro)
        const text2 = `
        SELECT count(*)
        FROM questions AS q
        INNER JOIN class_question AS cq
        ON q.id_question = cq.id_question
        INNER JOIN subcategories AS s 
        ON q.id_subcategory = s.id_subcategory 
        INNER JOIN categories AS c 
        ON s.id_category = c.id_category
        WHERE id_class = $1
        AND ($2::int IS NULL OR c.id_category = $2)
        AND ($3::int IS NULL OR s.id_subcategory = $3)
        AND ($4::int IS NULL OR q.difficulty = $4)`;
        const values2 = [id_lesson, id_category, id_subcategory, difficulty];
        const total_items = (await pool.query(text2, values2)).rows[0].count;

        // Envía la respuesta al cliente
        return res.send({
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

// Obtiene las preguntas de la biblioteca de la asignatura e indica cuales han sido agregadas a la clase.
async function getAllQuestionsForLesson(req, res, next) {
    try {

        // Query Params
        const id_user = req.query.id_user;
        const id_subject = req.query.id_subject;
        const id_lesson = req.query.id_lesson;

        const id_category = req.query.id_category || null;
        const id_subcategory = req.query.id_subcategory || null;
        const difficulty = req.query.difficulty || null;

        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        console.log(`id_lesson: ${id_lesson}, id_category: ${id_category}, id_subcategory: ${id_subcategory}, difficulty: ${difficulty}, page_size: ${page_size}, page: ${page}`);

        // Obtiene las preguntas por id de usuario (profesor) y id de asignatura 
        // Me sirve { id_course}
        const text = `SELECT c.id_category, c.name AS category, s.id_subcategory, s.name AS subcategory, q.id_question, q.description, q.difficulty, q.shared, q.image, q.updated_at, 
        
        CASE WHEN EXISTS (
            SELECT id_question 
            FROM class_question AS cq
            WHERE cq.id_question = q.id_question
            AND cq.id_class = $6
        ) THEN TRUE ELSE FALSE END AS added 
        
        FROM questions AS q 
        INNER JOIN subcategories AS s 
        ON q.id_subcategory = s.id_subcategory 
        INNER JOIN categories AS c 
        ON s.id_category = c.id_category 
        INNER JOIN subjects AS su 
        ON c.id_subject = su.id_subject 
        WHERE id_user = $1 

        AND ($2::int IS NULL OR su.id_subject = $2)
        AND ($3::int IS NULL OR c.id_category = $3)
        AND ($4::int IS NULL OR s.id_subcategory = $4)
        AND ($5::int IS NULL OR q.difficulty = $5) 
        ORDER BY q.updated_at DESC
        LIMIT $7 
        OFFSET $8`;

        const values = [id_user, id_subject, id_category, id_subcategory, difficulty, id_lesson, page_size, from];
        const {
            rows
        } = await pool.query(text, values);

        // Obtiene la cantidad total de preguntas (de acuerdo a los parámetros de filtro)
        const text2 = `
        SELECT count(*)
        FROM questions AS q 
        INNER JOIN subcategories AS s 
        ON q.id_subcategory = s.id_subcategory 
        INNER JOIN categories AS c 
        ON s.id_category = c.id_category 
        INNER JOIN subjects AS su 
        ON c.id_subject = su.id_subject 
        WHERE id_user = $1 
        AND ($2::int IS NULL OR su.id_subject = $2)
        AND ($3::int IS NULL OR c.id_category = $3)
        AND ($4::int IS NULL OR s.id_subcategory = $4)
        AND ($5::int IS NULL OR q.difficulty = $5) `;
        const values2 = [id_user, id_subject, id_category, id_subcategory, difficulty];
        const total_items = (await pool.query(text2, values2)).rows[0].count;

        // Envía la respuesta al cliente
        return res.send({
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

async function getQuestionByCourse(req, res, next) {
    try {


        const id_course = req.params.courseId;
        console.log("BY COURSE: ", id_course)
        const id_category = req.query.id_category || null;
        const id_subcategory = req.query.id_subcategory || null;
        const difficulty = req.query.difficulty || null;
        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        const text = `
        SELECT cl.id_class, cl.description AS class, c.id_category, c.name AS category, s.id_subcategory, s.name AS subcategory, q.id_question, q.description, q.difficulty, q.shared, q.image, cq.status, cq.added_at, cq.updated_at
        FROM questions AS q
        INNER JOIN class_question AS cq
        ON q.id_question = cq.id_question
        INNER JOIN classes AS cl
        ON cq.id_class = cl.id_class
        INNER JOIN modules AS m
        ON cl.id_module = m.id_module
        INNER JOIN subcategories AS s 
        ON q.id_subcategory = s.id_subcategory 
        INNER JOIN categories AS c 
        ON s.id_category = c.id_category
        WHERE m.id_course = $1
        AND ($2::int IS NULL OR c.id_category = $2)
        AND ($3::int IS NULL OR s.id_subcategory = $3)
        AND ($4::int IS NULL OR q.difficulty = $4)
        ORDER BY q.updated_at DESC
        LIMIT $5
        OFFSET $6`;
        const values = [id_course, id_category, id_subcategory, difficulty, page_size, from];
        const {
            rows
        } = await pool.query(text, values);

        const text2 = `
        SELECT count(*)
        FROM questions AS q
        INNER JOIN class_question AS cq
        ON q.id_question = cq.id_question
        INNER JOIN classes AS cl
        ON cq.id_class = cl.id_class
        INNER JOIN modules AS m
        ON cl.id_module = m.id_module
        INNER JOIN subcategories AS s 
        ON q.id_subcategory = s.id_subcategory 
        INNER JOIN categories AS c 
        ON s.id_category = c.id_category
        WHERE m.id_course = $1
        AND ($2::int IS NULL OR c.id_category = $2)
        AND ($3::int IS NULL OR s.id_subcategory = $3)
        AND ($4::int IS NULL OR q.difficulty = $4)`
        const values2 = [id_course, id_category, id_subcategory, difficulty];
        const total_items = (await pool.query(text2, values2)).rows[0].count;

        return res.send({
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
        })
    }
}

// Crea o elimina múltiples preguntas en una clase
// + Asegurarse que una pregunta no este en otra clase?
async function updateLessonQuestions(req, res, next) {
    const client = await pool.pool.connect();

    try {
        // Body Params
        const {
            id_lesson,
            add_questions,
            delete_questions
        } = req.body;

        console.log("add_works: ", add_questions);
        console.log("delete_works: ", delete_questions);
        // Inicia la transacción
        client.query('BEGIN');

        // Array para ejecutar consultas en paralelo
        let promises = [];

        if (add_questions && add_questions.length > 0) {
            // Inserción del workspace
            const {
                text,
                values
            } = insertLessonQuestions(add_questions, id_lesson);
            // Agrega la query al array 'promises'
            promises.push(client.query(text, values));
        }

        if (delete_questions && delete_questions.length > 0) {
            const {
                text,
                values
            } = deleteLessonQuestions(delete_questions, id_lesson);
            promises.push(client.query(text, values));
        }

        const result_update = await Promise.all(promises);

        // Finaliza la transacción
        await client.query('COMMIT')

        res.json({})

    } catch (error) {
        await client.query('ROLLBACK');
        next({
            error
        });
    } finally {
        client.release();
    }
}


// Actualiza el estado de una pregunta
// + Estados: 1: no iniciada, 2: activa, 3: detenida, 4: finalizada
async function updateLessonQuestion(req, res, next) {
    const id_class = req.params.classId;
    const id_question = req.params.questionId;

    try {
        // Body Params
        const {
            status
        } = req.body;

        // Si es que se va a iniciar una pregunta
        // + comprobar que no halla otra pregunta iniciada o detenida en la clase.
        if (status == 2) {
            const text8 = `
        SELECT CASE WHEN EXISTS (
            SELECT status 
            FROM class_question
            WHERE id_class = $1
            AND id_question != $2
            AND (status = 2 OR status = 3)
            ) THEN TRUE ELSE FALSE END AS any_question_started`;
            const values8 = [id_class, id_question];
            const any_question_started = (await pool.query(text8, values8)).rows[0].any_question_started;
            console.log("another_question_started: ", any_question_started);

            // Si es que ya hay una pregunta iniciada, enviar null para que no se inicie la clase
            if (any_question_started) return res.send(null);
        }

        // Si es que se va a reiniciar la pregunta (estado no iniciada).
        if (status == 1) {
            // Eliminar los registros de participación de la pregunta de clase
            const text9 = `
            DELETE FROM user_question_class
            WHERE id_question = $1
            AND id_class = $2`;
            const values9 = [id_question, id_class];
            await pool.query(text9, values9);



            //console.log("WETA: ", socket.getStudentsInClassroom(id_class));



        }

        // Si es que finaliza la pregunta
        if (status == 4) {

            // Vacía el array global de participantes.
            socket.setStudentParticipants({
                id_class: id_class,
                data: null
            });

            // Modifica el estado de los estudiantes en clase
            let students_in_class = socket.getStudentsInClassroom(id_class);
            students_in_class.forEach(student => {
                student.participation_status = 1;
            });

            // Emite nuevo array de participantes a estudiantes
            // + Creo que no es necesario, lo puedo hacer desde el mismo cliente y dando un tiempo para que el
            //   estudiante alcance a ver quien gano.
            // let io = socket.getSocket();
            // io.in(id_class + 'play-question-section')
            //     .emit('studentHasEnteredToTheClassroom',
            //         socket.getStudentsInClassroom(id_class)
            //     );

        }

        // Necesito asegurarme que el estado de la pregunta cambio (antes de actualizar)
        const text3 = `
        SELECT status 
        FROM class_question 
        WHERE id_class = $1
        AND id_question = $2`;
        const values3 = [id_class, id_question];
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
         WHERE cl.id_class = $1`;
        const values4 = [id_class];
        const {
            id_course,
            subject
        } = (await pool.query(text4, values4)).rows[0];

        // Actualiza la pregunta de clase (class_question)
        const text2 = `
        UPDATE class_question 
        SET status = $1 
        WHERE id_class = $2 
        AND id_question = $3 
        RETURNING *`;
        const values2 = [status, id_class, id_question];
        const {
            rows
        } = await pool.query(text2, values2);

        // Obtiene los datos de la pregunta
        const text5 = `
        SELECT id_question, difficulty, description 
        FROM questions
        WHERE id_question = $1`;
        const values5 = [id_question];
        const question = (await pool.query(text5, values5)).rows[0];

        question.status = status;

        // Obtiene el socket
        let io = socket.getSocket();
        // Emite evento a los estudiantes que esten en la sección de juego
        io.in(id_class + 'play-question-section').emit('playingTheClassQuestion', {
            question
        });

        // Emite evento cuando inicia la pregunta
        if (status == 2 && original_status != status) {
            console.log(" + notifica a estudiantes el inicio de una clase de pregunta.");

            console.log("MY QUESTION: ", question);
            io.in(id_course + 'students').emit('classQuestionStarted', {
                id_course,
                subject,
                //question
                // Necesito pasar la descripción de la pregunta
                // id_question, description, difficulty, image, id_category, category, id_subcategory, subcategory
            });
        }

        res.json(rows[0]);

    } catch (error) {
        next({
            error
        });
    }
}


function deleteLessonQuestions(array_questions, id_lesson) {
    const text = `
    DELETE FROM class_question 
    WHERE (id_question, id_class) 
    IN (SELECT * FROM UNNEST ($1::int[], $2::int[]))`;
    const values = formatWorkspaceArray(array_questions, id_lesson);
    return {
        text,
        values
    }
}

function insertLessonQuestions(array_questions, id_lesson) {
    const text = `
    INSERT INTO class_question (id_question, id_class) 
    SELECT * FROM UNNEST ($1::int[], $2::int[])`;
    const values = formatWorkspaceArray(array_questions, id_lesson);
    return {
        text,
        values
    }
}

function formatWorkspaceArray(array_questions, id_lesson) {
    let values1 = []; //[id_lesson, id_lesson, id_lesson]
    let values2 = []; //[id_question1, id_question2, id_question3]

    array_questions.map((id_question) => {
        values1.push(id_question);
        values2.push(id_lesson);
    });

    return [values1, values2]
}


// ----------------------------------------
// Delete Question
// ----------------------------------------
async function deleteClassQuestion(req, res, next) {
    try {
        const id_class = req.params.classId;
        const id_question = req.params.questionId;

        const text = 'DELETE FROM class_question WHERE id_class = $1 AND id_question = $2';
        const values = [id_class, id_question]
        await pool.query(text, values);

        res.sendStatus(204);

    } catch (error) {
        next({
            error
        });
    }
}

async function getCourseQuestions(req, res, next) {
    try {

        // Query Params
        const id_user = req.query.id_user;
        const id_subject = req.query.id_subject;
        const id_course = req.query.id_course;

        const id_category = req.query.id_category || null;
        const id_subcategory = req.query.id_subcategory || null;
        const difficulty = req.query.difficulty || null;

        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        const text = `
        SELECT t1.subject, t1.id_category, t1.category, t1.id_subcategory, t1.subcategory, t1.id_question, t1.question, t1.difficulty, t1.image, t1.updated_at, t2.id_class, t2.class, t2.module, t2.course
        FROM (   
            SELECT su.name AS subject, c.id_category, c.name AS category, s.id_subcategory, s.name AS subcategory, q.id_question, q.description AS question, q.difficulty, q.image, q.updated_at
            FROM questions AS q 
            INNER JOIN subcategories AS s 
            ON q.id_subcategory = s.id_subcategory 
            INNER JOIN categories AS c 
            ON s.id_category = c.id_category 
            INNER JOIN subjects AS su 
            ON c.id_subject = su.id_subject 
            WHERE c.id_user = $1
            AND su.id_subject = $2
        ) AS t1
        LEFT JOIN (
            SELECT q.id_question, cq.id_class, cl.description AS class, m.name AS module, co.name AS course
            FROM questions AS q 
            INNER JOIN class_question AS cq
            ON q.id_question = cq.id_question
            INNER JOIN classes AS cl
            ON cq.id_class = cl.id_class
            INNER JOIN modules AS m 
            ON cl.id_module = m.id_module   
            INNER JOIN courses AS co
            ON m.id_course = co.id_course
            WHERE co.id_course = $3
        ) AS t2
        ON t1.id_question = t2.id_question
        WHERE ($4::int IS NULL OR t1.id_category = $4)
        AND ($5::int IS NULL OR t1.id_subcategory = $5)
        AND ($6::int IS NULL OR t1.difficulty = $6)
        ORDER BY t1.updated_at DESC
        LIMIT $7
        OFFSET $8
        `;
        const values = [id_user, id_subject, id_course, id_category, id_subcategory, difficulty, page_size, from];
        const {
            rows
        } = await pool.query(text, values);

        // Obtiene la cantidad de registros

        const text2 = `
        SELECT count(*)
        FROM (   
            SELECT su.name AS subject, c.id_category, c.name AS category, s.id_subcategory, s.name AS subcategory, q.id_question, q.description AS question, q.difficulty, q.image, q.updated_at
            FROM questions AS q 
            INNER JOIN subcategories AS s 
            ON q.id_subcategory = s.id_subcategory 
            INNER JOIN categories AS c 
            ON s.id_category = c.id_category 
            INNER JOIN subjects AS su 
            ON c.id_subject = su.id_subject 
            WHERE c.id_user = $1
            AND su.id_subject = $2
        ) AS t1
        LEFT JOIN (
            SELECT q.id_question, cq.id_class, cl.description AS class, m.name AS module, co.name AS course
            FROM questions AS q 
            INNER JOIN class_question AS cq
            ON q.id_question = cq.id_question
            INNER JOIN classes AS cl
            ON cq.id_class = cl.id_class
            INNER JOIN modules AS m 
            ON cl.id_module = m.id_module   
            INNER JOIN courses AS co
            ON m.id_course = co.id_course
            WHERE co.id_course = $3
        ) AS t2
        ON t1.id_question = t2.id_question
        WHERE ($4::int IS NULL OR t1.id_category = $4)
        AND ($5::int IS NULL OR t1.id_subcategory = $5)
        AND ($6::int IS NULL OR t1.difficulty = $6)
        `;
        const values2 = [id_user, id_subject, id_course, id_category, id_subcategory, difficulty];
        const total_items = (await pool.query(text2, values2)).rows[0].count;


        // Envía la respuesta al cliente
        return res.send({
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



// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getCourseQuestions,
    getLessonQuestions,
    getAllQuestionsForLesson,
    getQuestionByCourse,
    updateLessonQuestions,
    updateLessonQuestion,
    deleteClassQuestion
}