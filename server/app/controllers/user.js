'use strict'

//LIBRERÍAS*************************************************************************************
const bcrypt = require('bcrypt-nodejs');
const pool = require('../database/pool');



//SEGMENTOS DE CONSULTA*************************************************************************
const ROLES =
    `SELECT id_user, array_agg(id_role ORDER BY id_role) AS roles
    FROM user_role
    GROUP BY id_user`;

const ROLES_FILTER =
    `SELECT id_user, array_agg(id_role ORDER BY id_role) AS roles 
    FROM user_role 
    GROUP BY id_user 
    HAVING $3 = ANY(array_agg(id_role))
    ORDER BY id_user`;

const PAGINATION =
    `ORDER BY id_user LIMIT $1 OFFSET $2`;

const USERS_ROLES =
    `SELECT u.id_user, u.name, u.last_name, u.middle_name, u.document_no, u.email, u.phone_no, u.username, u.active, u.profile_image, u.created_at, u.updated_at, r.roles, count(*) OVER() AS total_users 
    FROM users AS u 
    INNER JOIN (${ROLES}) AS r 
    ON u.id_user = r.id_user`;

const USERS_ROLES_WFILTER =
    `SELECT u.id_user, u.name, u.last_name, u.middle_name, u.document_no, u.email, u.phone_no, u.username, u.active, u.profile_image, u.created_at, u.updated_at, r.roles, count(*) OVER() AS total_users 
    FROM users AS u 
    INNER JOIN (${ROLES_FILTER}) AS r 
    ON u.id_user = r.id_user`;

//FUNCIONES************************************************************************************
async function getUsers(req, res) {
    try {
        const from = Number(req.query.from || 0);
        const limit = Number(req.query.limit || 10);

        //PARÁMETROS DE FILTRO OPCIONAL:
        const search = req.query.search;
        const role = Number(req.query.role);
        const status = req.query.status;

        let values = [limit, from];
        let query;

        //********************************************************************************************************************************************************* */     

        //SABER SI PONER EL AND EN EL WHERE
        if (role) {
            query = `${USERS_ROLES_WFILTER}`;
            values.push(role);
        } else query = `${USERS_ROLES}`;
        console.log("role...")

        if (status || search) query += ` WHERE `;

        if (status) {
            query += `u.active = $${values.length + 1}`;
            values.push(status);
            console.log("status...");
        }


        if (search) {
            let {
                mquery,
                mvalues
            } = searchAnything(search, values.length + 1);
            query += status ? ` AND ${mquery}` : mquery;
            values = [...values, ...mvalues];
            console.log("search...");
        }


        //********************************************************************************************************************************************************* */

        query += ` ${PAGINATION}`;

        console.log("QUERY: ", query);
        console.log("VALUE: ", values);
        const {
            rows
        } = await pool.query(query, values);

        const total = rows.length != 0 ? rows[0].total_users : 0;
        res.json({
            user_payload: req.user_payload,
            users: rows,
            total
        })
    } catch (error) {
        console.log("ERROR: ", error);
        res.status(500).json({
            message: 'error in obtaining users1',
            error
        });
    }
}

async function getUserByUserId(req, res) {
    try {
        var id_user = req.params.userId;
        const {
            rows
        } = await pool.query('SELECT id_user, name, last_name, middle_name, document_no, email, phone_no, username, active, profile_image, created_at, updated_at FROM users WHERE id_user = $1', [id_user]);
        res.json(rows)
    } catch (error) {
        res.status(500).json({
            message: 'error in obtaining users2',
            error
        });
    }
}

async function createUser(req, res) {

    try {

        Object.keys(req.body).map(key => req.body[key] = req.body[key].toLowerCase()); //PASA TODOS LOS PARÁMETROS DEL BODY A LOWER, MEJORAR SOLO PASANDO ALGUNOS PÁRAMS? CREAR MÉTODO?

        const {
            name,
            last_name,
            middle_name,
            document_no,
            email,
            phone_no,
            username,
            profile_image,
            password
        } = req.body;

        if (name && last_name && middle_name && document_no && email && phone_no && username && password) {
            //COMPRUEBO QUE EL RUT,USERNAME E EMAIL NO EXISTAN  EN LA BASE DE DATOS user.rut.toLowerCase()
            const result_search = await Promise.all([
                pool.query('SELECT id_user FROM users WHERE document_no = $1', [document_no]),
                pool.query('SELECT id_user FROM users WHERE username = $1', [username]),
                pool.query('SELECT id_user FROM users WHERE email = $1', [email]),
            ]);

            const rows_document_no = result_search[0].rows;
            const rows_username = result_search[1].rows;
            const rows_email = result_search[2].rows;
            let combination = `${rows_document_no.length}${rows_username.length}${rows_email.length}`;

            switch (combination) {
                case '111':
                    return res.status(500).json({
                        status: '111',
                        message: `this document_no, username and email has been taken`
                    })
                case '110':
                    return res.status(500).json({
                        status: '110',
                        message: `this document_no and username has been taken`
                    })
                case '101':
                    return res.status(500).json({
                        status: '101',
                        message: `this document_no and email has been taken`
                    })
                case '011':
                    return res.status(500).json({
                        status: '011',
                        message: `this username and email has been taken`
                    })
                case '100':
                    return res.status(500).json({
                        status: '100',
                        message: `this document_no has been taken`
                    })
                case '010':
                    return res.status(500).json({
                        status: '010',
                        message: `this username has been taken`
                    })
                case '001':
                    return res.status(500).json({
                        status: '001',
                        message: `this email has been taken`
                    })
                default:
                    let salt = bcrypt.genSaltSync(10);
                    const text = 'INSERT INTO users(name, last_name, middle_name, document_no, email, phone_no, username, password) VALUES($1, $2, $3, $4, $5, $6, $7, $8)  RETURNING id_user';
                    const values = [name, last_name, middle_name, document_no, email, phone_no, username, bcrypt.hashSync(password, salt)];
                    const {
                        rows
                    } = await pool.query(text, values);
                    const roles = await pool.query('INSERT INTO user_role(id_user, id_role) VALUES($1, $2)', [rows[0].id_user, '3']);
                    //GENERO EL TOKEN CON DATOS DE USUARIO Y ROLES
                    res.json({
                        message: 'successfully created user'
                    })
            }
        } else {
            res.status(400).send({
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        console.log(`${error}`)
        res.status(500).json({
            message: 'error when saving the user',
            error
        })
    }
}




async function updateUser(req, res) {

    const client = await pool.pool.connect();

    try {
        const id_user = req.params.userId;
        const {
            name,
            last_name,
            middle_name,
            document_no,
            email,
            phone_no,
            username,
            active,
            add_roles,
            delete_roles
        } = req.body;

        let user;


        if (req.user_payload.roles.includes(1)) { //SI SOY ADMIN: PUEDO MODIFICAR EL ACTIVE Y LOS ROLES

            let q_update_us = 'UPDATE users SET name = $1, last_name = $2, middle_name = $3, document_no = $4, email = $5, phone_no = $6, username = $7, active = $8 WHERE id_user = $9 RETURNING id_user, name, last_name, middle_name, document_no, email, phone_no, username, password, active, profile_image, created_at, updated_at';
            let v_update_us = [name, last_name, middle_name, document_no, email, phone_no, username, active, id_user];

            let promises = [];
            promises.push(client.query('BEGIN'));
            promises.push(client.query(q_update_us, v_update_us));

            if (add_roles && add_roles.length != 0) {
                let q_add_ro = 'INSERT INTO user_role (id_user, id_role) VALUES ';
                let v_add_ro = [];
                add_roles.map((role, index) => {
                    q_add_ro += `($${index * 2 + 1},$${index * 2 + 2}),`;
                    v_add_ro.push(...[id_user, role])
                })
                q_add_ro = q_add_ro.slice(0, -1);
                promises.push(client.query(q_add_ro, v_add_ro));
            }
            if (delete_roles && delete_roles.length != 0) {
                let q_delete_ro = 'DELETE FROM user_role WHERE (id_user, id_role) IN (';
                let v_delete_ro = [];
                delete_roles.map((role, index) => {
                    q_delete_ro += `($${index * 2 + 1},$${index * 2 + 2}),`;
                    v_delete_ro.push(...[id_user, role])
                })
                q_delete_ro = `${q_delete_ro.slice(0, -1)})`;
                promises.push(client.query(q_delete_ro, v_delete_ro));
            }

            const result_update = await Promise.all(promises);
            await client.query('COMMIT')

            user = result_update[1].rows[0];
        } else if (id_user != req.user_payload.id_user) { //SI SOY DUEÑO DEL ID
            let text = 'UPDATE users SET name = $1, last_name = $2, middle_name = $3, document_no = $4, email = $5, phone_no = $6, username = $7 WHERE id_user = $8 RETURNING id_user, name, last_name, middle_name, document_no, email, phone_no, username, password, active, profile_image, created_at, updated_at';
            let values = [name, last_name, middle_name, document_no, email, phone_no, username, id_user];

            user = await pool.query(text, values);
        } else {
            return res.status(500).json({
                success: false,
                message: `you don't have permission to update user data`
            })
        }



        //BIEN: RECUPERO ROLES, QUITO LA CONTRASEÑA Y ENVIO RESPONSE...
        const _roles = (await pool.query('SELECT array_agg(id_role ORDER BY id_role) AS roles FROM user_role WHERE id_user = $1', [id_user])).rows;
        user.roles = _roles[0].roles;
        delete user.password;

        res.json({
            success: true,
            user: user
        })

    } catch (error) {
        await client.query('ROLLBACK');
        console.log(`error: ${error}`)
        res.status(500).json({
            success: false,
            error: error
        });
    } finally {
        client.release();
    }
}

//NO ME DEJA BORRAR PORQUE DEPENDE DE TABLA ROLE...
async function deleteUser(req, res) {
    try {
        const id_user = req.params.userId;
        const {
            rows
        } = await pool.query('DELETE FROM users WHERE id_user = $1', [id_user]);
        res.json({
            message: 'successfully deleted user'
        });
    } catch (error) {
        console.log(`database ${error}`)
        res.status(204).send()
    }
}

async function disableUser(req, res) {
    try {
        const id_user = req.params.userId;
        const {
            rows
        } = await pool.query('UPDATE users SET active = false WHERE id_user = $1', [id_user]);
        res.json({
            message: 'successfully disabled user'
        });
    } catch (error) {
        console.log(`database ${error}`)
        res.json({
            success: false,
            error
        });
    }
}
// function login(req, res) {
//     var params = req.body;

//     var rut = params.rut;
//     var password = params.password;

//     //COMPROBAR SI EL RUT Y LA CONTRASEÑA QUE ME ESTAN ENVIANDO COINCIDEN CON ALGUNA EN LA BASE DE DATOS
//     if (user) {
//         //bcrypt.compare() password que le paso y password almacenada en al db
//     }

// }

// function logout(req, res) {
//     var params = req.body;
// }


async function getStudentsByCourse() {}



//FUNCIONES NO EXPORTABLES************************************************************************************

function searchName(search_value, index) {

    let mquery, mvalues;
    let array_search = search_value.split(' ');

    if (array_search.length == 2) {
        mquery = `(u.name = $${index} OR u.last_name = $${index}) AND (u.last_name LIKE $${index + 1} OR u.middle_name LIKE $${index + 1})`;
        mvalues = [`${array_search[0]}`, `%${array_search[1]}%`]
    } else if (array_search.length == 3) {
        mquery = `u.name = $${index} AND u.last_name = $${index + 1} AND u.middle_name LIKE $${index + 2}`;
        mvalues = [`${array_search[0]}`, `${array_search[1]}`, `%${array_search[2]}%`]
    } else { //EXCELENTE: PARA CUANDO SEA 1 STRING O MAS DE 3
        mquery = `CONCAT(u.name, ' ', u.last_name, ' ', u.middle_name) LIKE $${index}`;
        mvalues = [`%${array_search[0]}%`];
    }

    return {
        mquery,
        mvalues
    }
}

function searchAnything(search_value, index) {
    let mquery, mvalues;
    if (/^[0-9a-zA-Z_.-]*@[0-9a-zA-Z]*.?[a-z]*$/.test(search_value)) {
        mquery = `email LIKE $${index}`;
        mvalues = [`%${search_value}%`];
    }
    //SI ES "SOLO" NUMERO ENTONCES ES RUT
    else if (/^[0-9]+$/.test(search_value)) {
        mquery = `document_no LIKE $${index}`;
        mvalues = [`${search_value}%`];
    }
    //SI TIENE 2 O 3 PALABRAS ENTONCES ES NOMBRE
    else if (/^([a-zA-Z]+( [a-zA-Z]+){1,2}$)/.test(search_value)) {
        ({
            mquery,
            mvalues
        } = searchName(search_value, index));
    }
    //SI TIENE LETRAS, NÚMEROS Y CARÁCTERES ESPECIALES ES USUARIO
    else if (/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[-_.])/.test(search_value)) { //ESTOY DICIENDO SI TIENE SOLAMENTE LETRAS O NUMEROS PERO NO OBLIGO A QUE TENGA AMBAS (DIGO LETRAS, NUMEROS "O" CARACTERES EPSECIALES)
        mquery = `username LIKE $${index}`;
        mvalues = [`%${search_value}%`];
    }
    //SI TIENE LETRAS Y NÚMEROS ES USUARIO O RUT (WARN: el rut lo puede buscar con punto y guion)
    else if (/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(search_value)) {
        mquery = `(username LIKE $${index} OR document_no LIKE $${index})`;
        mvalues = [`%${search_value}%`];
    }
    //POR DEFECTO BUSCA SOLO EN NOMBRE
    else {
        ({
            mquery,
            mvalues
        } = searchName(search_value, index));
    }

    return {
        mquery,
        mvalues
    }
}

async function countUser(req, res) {
    try {
        const {
            rows
        } = await pool.query('SELECT count(*) AS count FROM users');
        res.json({
            result: rows[0].count
        });
    } catch (error) {
        console.log(`${error}`)
        res.status(500).json({
            success: false,
            error
        });
    }
}

module.exports = {
    getUsers,
    getUserByUserId,
    createUser,
    updateUser,
    deleteUser,
    disableUser,
    countUser
}