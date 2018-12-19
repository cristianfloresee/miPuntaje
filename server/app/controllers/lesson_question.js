'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');
const _file = require('../services/file');
const socket = require('../../server');


// ----------------------------------------
// Get Questions
// ----------------------------------------
async function getLessonQuestions(req, res, next) {

    try {


        // Query Params
        const id_lesson = req.query.id_lesson; // Obligatorio
        const id_category = req.query.id_category || null;
        const id_subcategory = req.query.id_subcategory || null;
        const difficulty = req.query.difficulty || null;
        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        console.log(`id_lesson: ${id_lesson}, id_category: ${id_category}, id_subcategory: ${id_subcategory}, difficulty: ${difficulty}, page_size: ${page_size}, page: ${page}`);

        // Obtiene las preguntas por id de usuario (profesor) y id de asignatura 
        const text = `SELECT c.id_category, c.name AS category, s.id_subcategory, s.name AS subcategory, q.id_question, q.description, q.difficulty, q.shared, q.image, cq.status, cq.added_at, cq.updated_at
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
        next({ error });
    }
}


async function getAllQuestionsForLesson(req, res, next) {
    try {

        console.log("GET LESSON QUESTIONS..");
        // Query Params
        //const search = req.query.search;
        const id_user = req.query.id_user;
        const id_subject = req.query.id_subject;
        const id_lesson = req.query.id_lesson; // Obligatorio por el momento
        const id_category = req.query.id_category || null;
        const id_subcategory = req.query.id_subcategory || null;
        const difficulty = req.query.difficulty || null;
        const page_size = req.query.page_size || 20;
        const page = req.query.page || 1;

        // Calcula el from a partir de los params 'page' y 'page_size'
        const from = (page - 1) * page_size;

        console.log(`id_lesson: ${id_lesson}, id_category: ${id_category}, id_subcategory: ${id_subcategory}, difficulty: ${difficulty}, page_size: ${page_size}, page: ${page}`);

        // Obtiene las preguntas por id de usuario (profesor) y id de asignatura 
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
        next({ error });
    }
}

// Crea o elimina múltiples preguntas en una clase
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
        next({ error });
    } finally {
        client.release();
    }
}


// Actualiza el estado de una pregunta
async function updateLessonQuestion(req, res, next) {
    const id_class = req.params.classId;
    const id_question = req.params.questionId;

    try {
        // Body Params
        const {
            status
        } = req.body;

        const text2 = 'UPDATE class_question SET status = $1 WHERE id_class = $2 AND id_question = $3 RETURNING *';
        const values2 = [status, id_class, id_question];
        const { rows } = await pool.query(text2, values2);
        // Activar socket...
        let io = socket.getSocket();
        io.emit('init_question', rows[0]);
        res.json(rows[0])

    } catch (error) {
        next({ error });
    } 
}


function deleteLessonQuestions(array_questions, id_lesson) {
    const text = `DELETE FROM class_question WHERE (id_question, id_class) IN (SELECT * FROM UNNEST ($1::int[], $2::int[]))`;
    const values = formatWorkspaceArray(array_questions, id_lesson);
    return {
        text,
        values
    }
}

function insertLessonQuestions(array_questions, id_lesson) {
    const text = `INSERT INTO class_question (id_question, id_class) SELECT * FROM UNNEST ($1::int[], $2::int[])`;
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
        next({ error });
    }
}




// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getLessonQuestions,
    getAllQuestionsForLesson,
    updateLessonQuestions,
    updateLessonQuestion,
    deleteClassQuestion
}