'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');

async function getEnrollments(req, res) {

    try {
        const id_course = req.params.id_course;

        const text1 = 'SELECT id_user FROM course_user WHERE id_course = $1';
        const values1 = [id_course];
        const res1 = (await pool.query(text1, values1)).rows[0];

        //const res2 = (await pool.query(text2, values2)).rows[0];

        res.json(res1)

    } catch (error) {
        next({
            error
        });
    }
}

// ----------------------------------------
// Update Lesson
// ----------------------------------------
async function updateActivityParticipation(req, res, next) {

    try {
        const id_activity = req.params.activityId;
        const id_user = req.params.userId;

        const {
            status
        } = req.body;

        // Comprobar si existe el registro antes??
        const text2 = `
        UPDATE activity_user 
        SET status = $1 
        WHERE id_activity = $2 
        AND id_user = $3`;
        const values2 = [status, id_activity, id_user];
        const res2 = (await pool.query(text2, values2)).rows[0];

        res.json(res2)

    } catch (error) {
        next({
            error
        });
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
async function updateActivityParticipations(req, res, next) {
    console.log("UPDATE ACTIVITY PARTICIPATIONS");
    try {
        const id_activity = parseInt(req.params.activityId);
        const array_participation = req.body.array_participation;
        // array_participation: {id_user, status}
        // Actualizar múltiples registros en una query: https://stackoverflow.com/questions/37048772/update-multiple-rows-from-multiple-params-in-nodejs-pg
        // Actualizar múltiples registros pasando un array de objetos: https://stackoverflow.com/questions/37059187/convert-object-array-to-array-compatible-for-nodejs-pg-unnest

        // Inserta el 'id_activity' en cada registro (Object) del array 'array_participation'
        array_participation.map(participation => Object.assign(participation, {
            id_activity
        }));
        // [ {id_user, id_activity, status} ]

        
        const text = `
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
        const values = [JSON.stringify(array_participation)];
        const res2 = (await pool.query(text, values)).rows;
        res.json({});

    } catch (error) {
        next({
            error
        })
    }

}

function deleteWinners(array_students, id_activity) {
    const text = `DELETE FROM class_question WHERE (id_question, id_class) IN (SELECT * FROM UNNEST ($1::int[], $2::int[]))`;
    const values = formatWorkspaceArray(array_students, id_activity);
    return {
        text,
        values
    }
}

//ARREGLAR THIS
function insertWinners(array_students, id_activity) {
    const text = `
        UPDATE activity_user 
        SET status = 2
        WHERE id_activity = $2 
        AND id_user = $3`;
    const text = `
        INSERT INTO class_question (id_question, id_class) 
        SELECT * FROM UNNEST ($1::int[], $2::int[])`;
    const values = formatWorkspaceArray(array_students, id_activity);
    return {
        text,
        values
    }
}

module.exports = {
    updateActivityParticipation,
    updateActivityParticipations
}