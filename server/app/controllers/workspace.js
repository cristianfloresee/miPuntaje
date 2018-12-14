'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const pool = require('../database');



// Si necesito las últimas 5 del profe debo enviar page_size=5 y solo el user_id
// ----------------------------------------
// Get Categories
// ----------------------------------------
async function getWorkspaces(req, res, next) {
    try {
        // Query Params
        const id_user = req.query.id_user; // Obligatorio

        // Calcula el from a partir de los params 'page' y 'page_size'
        //const from = (page - 1) * page_size;

        // Obtiene las clases
        const text = `SELECT us.id_subject, s.name
        FROM user_subject AS us 
        INNER JOIN subjects AS s
        ON us.id_subject = s.id_subject
        WHERE us.id_user = $1`;
        const values = [id_user];
        const { rows } = await pool.query(text, values);


        // Envía la respuesta al cliente
        res.json(rows)
    } catch (error) {
        next({ error });
    }
}


// ----------------------------------------
// Get Categories as Select Options
// ----------------------------------------
async function getCategoryOptions(req, res, next) {
    try {
        // Query Params
        const id_user = req.query.id_user; // Obligatorio por ahora    
        const id_subject = req.query.id_subject; // Obligatorio por ahora  

        // Obtiene las categorías
        const text = 'SELECT id_category, name FROM categories WHERE id_user = $1 AND id_subject = $2 ORDER BY name';
        const values = [id_user, id_subject];
        const { rows } = await pool.query(text, values);

        // Envía la respuesta al cliente
        res.json(rows);
    } catch (error) {
        next({ error });
    }
}


// ----------------------------------------
// Create Category
// ----------------------------------------
async function createCategory(req, res, next) {

    try {
        const {
            id_user,
            id_subject,
            name
        } = req.body;

        if (id_user && id_subject && name) {

            const text = 'INSERT INTO categories(id_user, id_subject, name) VALUES($1, $2, $3)';
            const values = [id_user, id_subject, name]
            const {
                rows
            } = await pool.query(text, values);

            // Envía la respuesta al cliente
            res.status(201).send(rows[0])
        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Update Workspaces
// ----------------------------------------
async function updateWorkspaces(req, res, next) {

    const client = await pool.pool.connect();

    try {

        const {
            id_user,
            add_workspaces,
            delete_workspaces
        } = req.body;

        console.log("add_works: ", add_workspaces);
        console.log("delete_works: ", delete_workspaces);
        // Inicia la transacción
        client.query('BEGIN');

        // Array para ejecutar consultas en paralelo
        let promises = [];

        if (add_workspaces && add_workspaces.length > 0) {
            // Inserción del workspace
            const {
                text,
                values
            } = insertWorkspaces(add_workspaces, id_user);
            // Agrega la query al array 'promises'
            promises.push(client.query(text, values));


            //LEFT(uuid_generate_v4()::text, 8)


            // Crea la categoría por defecto
            const text2 = `INSERT INTO categories(id_user, id_subject) SELECT * FROM UNNEST ($1::int[], $2::int[]) RETURNING id_category`;
            let categories_created = (await client.query(text2, values)).rows;

            categories_created = categories_created.map(item => item.id_category);
            console.log("CATEGORY CREATED: ", categories_created);
            // Crea la subcategoría por defecto
            const text3 = `INSERT INTO subcategories(id_category) SELECT * FROM UNNEST ($1::int[])`;
            await client.query(text3, [categories_created]);
            //console.log("CATEGORY");

            //const text2 = `INSERT INTO categories(id_category, id_user, id_subject, name) VALUES(CONCAT('_', LEFT(uuid_generate_v4()::text, 7)) ,$1, $2, $3)`;
            //const text2 = `INSERT INTO categories(id_user, id_subject, name) VALUES($1, $2, 'DEFAULT')`; // Podría poner nombre por defecto en la db
            //const values2 = [id_user, id_subject];
            //promises.push(client.query(text2, values2));

        }

        if (delete_workspaces && delete_workspaces.length > 0) {
            const {
                text,
                values
            } = deleteWorkspaces(delete_workspaces, id_user);
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

// ----------------------------------------
// Delete Category
// ----------------------------------------
async function deleteCategory(req, res) {
    try {
        const id_category = req.params.categoryId;
        const text = 'DELETE FROM categories WHERE id_category = $1';
        const values = [id_category];
        await pool.query(text, values);

        // Envía la respuesta al cliente
        res.sendStatus(204);
    } catch (error) {
        next({ error });
    }
}

function insertWorkspaces(array_workspaces, id_user) {
    const text = `INSERT INTO user_subject (id_user, id_subject) SELECT * FROM UNNEST ($1::int[], $2::int[])`;
    const values = formatWorkspaceArray(array_workspaces, id_user);
    // Crea la categoría por defecto
    const text2 = `INSERT INTO categories(id_user, id_subject) SELECT * FROM UNNEST ($1::int[], $2::int[])`;
    // Crea la subcategoría por defecto
    return {
        text,
        values,
        text2,
    }
}

function deleteWorkspaces(array_workspaces, id_user) {
    const text = `DELETE FROM user_subject WHERE (id_user, id_subject) IN (SELECT * FROM UNNEST ($1::int[], $2::int2[]))`;
    const values = formatWorkspaceArray(array_workspaces, id_user);
    return {
        text,
        values
    }
}

function formatWorkspaceArray(array_workspaces, id_user) {
    let values1 = []; //[id_user, id_user, id_user]
    let values2 = []; //[workspace1, workspace2, workspace3]

    array_workspaces.map((workspace) => {
        values1.push(id_user);
        values2.push(workspace);
    });

    return [values1, values2]
}

function formatForSubcategory(id_category) {
    let values1 = []; //[id_user, id_user, id_user]

    array_workspaces.map((workspace) => {
        values1.push(id_category);
    });

    return [values1]
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    getWorkspaces,
    updateWorkspaces
    // getCategoryOptions,
    //createCategory,
    //updateCategory,
    //deleteCategory
}