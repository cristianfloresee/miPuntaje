'use strict'

const bcrypt = require('bcrypt-nodejs');
//const jwt = require('../services/jwt');
const pool = require('../database/pool');

//const valid_roles = {};

async function getUsers(req, res) {
    try {
        const from = Number(req.query.from || 0);
        const limit = Number(req.query.limit || 10);

        //PARÁMETROS DE FILTRO OPCIONAL:
        const search = req.query.search;
        const role = Number(req.query.role);
        const status = req.query.status;

        //SEGMENTOS CONSULTA
        const SELECT = 'SELECT id_user, name, last_name, middle_name, document_no, email, phone_no, username, active, profile_image, created_at, updated_at, count(*) OVER() AS total_users FROM users AS u';
        const PAGINATION = 'ORDER BY id_user LIMIT $1 OFFSET $2';
        let values = [limit, from];
        let query;

        if (role && status && search) {
            query = `${SELECT} WHERE roles = $3 AND active = $4 AND CONCAT(u.name, ' ', u.last_name, ' ', u.middle_name) LIKE %$5% ${PAGINATION}`;
            values = [...values, role, status, `%${search}%`];
        }
        else if (role && status) {
            query = `${SELECT} WHERE roles = $3 AND active = $4 ${PAGINATION}`;
            values = [...values, role, status];
        }
        else if (role && search) {
            query = `${SELECT} WHERE roles = $3 AND CONCAT(u.name, ' ', u.last_name, ' ', u.middle_name) LIKE $4 ${PAGINATION}`;
            values = [...values, role, `%${search}%`];
        }
        else if (status && search) {
            query = `${SELECT} WHERE active = $3 AND CONCAT(u.name, ' ', u.last_name, ' ', u.middle_name) LIKE $4 ${PAGINATION}`;
            values = [...values, status, `%${search}%`];
        }
        else if (search) {
            //SI TIENE @ ENTONCES ES CORREO ELECTRÓNICO
            if (/[0-9a-zA-Z_.-]*@[0-9a-zA-Z]*.?[a-z]*/.test(search)) {
                console.log("EMAIL...");
                query = `${SELECT} WHERE email LIKE $3 ${PAGINATION}`;
                values = [...values, `%${search}%`];
            }
            //SI ES SOLO NUMERO ENTONCES ES RUT
            else if (/[0-9]+/.test(search)) {
                console.log("ENTRA A RUT...");
                query = `${SELECT} WHERE document_no LIKE $3 ${PAGINATION}`;
                values = [...values, `${search}%`];
            }
            //SI TIENE 2 O 3 PALABRAS ENTONCES ES NOMBRE
            else if (/([a-zA-Z]+( [a-zA-Z]+){1,2})/.test(search)) {
                ({ query, values } = searchName(SELECT, PAGINATION, search, values));
            }
            //SI TIENE LETRAS, NÚMEROS Y CARÁCTERES ESPECIALES ES USUARIO
            else if (/[0-9a-zA-Z-_.]+[-_.]+[0-9a-zA-Z]*/.test(search)) {
                console.log("ENTRA A USER...");
                query = `${SELECT} WHERE username LIKE $3 ${PAGINATION}`;
                values = [...values, `%${search}%`];
            }
            //SI TIENE LETRAS Y NÚMEROS ES USUARIO O RUT
            else if (/[0-9a-zA-Z-_.]+[0-9]+[0-9a-zA-Z]*/.test(search)) {
                console.log("ENTRA A USER Y RUT...");
                query = `${SELECT} WHERE username LIKE $3 OR document_no LIKE $3 ${PAGINATION}`;
                values = [...values, `%${search}%`];
            }
            //POR DEFECTO BUSCA SOLO EN NOMBRE
            else {
                ({ query, values } = searchName(SELECT, PAGINATION, search, values));
            }
        }
        else if (role) {
            //query = `${SELECT} WHERE u.id_user roles = $3 ${PAGINATION}`;
            //query = `SELECT u.id_user, u.name, u.last_name, u.middle_name, u.document_no, u.email, u.phone_no, u.username, u.active, u.profile_image, u.created_at, u.updated_at, r.roles, count(*) OVER() AS total_users  FROM users AS u INNER JOIN (SELECT id_user, array_agg(id_role) AS roles FROM user_role GROUP BY id_user) AS r ON u.id_user = r.id_user WHERE u ${PAGINATION}`;
            query = `SELECT u.id_user, u.name, u.last_name, u.middle_name, u.document_no, u.email, u.phone_no, u.username, u.active, u.profile_image, u.created_at, u.updated_at, r.roles, count(*) OVER() AS total_users  FROM users AS u INNER JOIN (SELECT id_user, array_agg(id_role ORDER BY id_role) AS roles FROM user_role WHERE id_user IN (SELECT id_user FROM user_role WHERE id_role = $3) GROUP BY id_user ORDER BY id_user) AS r ON u.id_user = r.id_user ${PAGINATION}`;
            values.push(role);
        }
        else if (status) {
            query = `${SELECT} WHERE active = $3 ${PAGINATION}`;
            values.push(status);
        }
        else {
            query = `SELECT u.id_user, u.name, u.last_name, u.middle_name, u.document_no, u.email, u.phone_no, u.username, u.active, u.profile_image, u.created_at, u.updated_at, r.roles, count(*) OVER() AS total_users  FROM users AS u INNER JOIN (SELECT id_user, array_agg(id_role) AS roles FROM user_role GROUP BY id_user) AS r ON u.id_user = r.id_user ${PAGINATION}`;
        }

        //console.log("QUERY: ", query);
        //console.log("VALUE: ", values);
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
            message: 'error in obtaining users',
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
            message: 'error in obtaining users',
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




//SI ES DUEÑO DEL PERFIL / SI ES ADMIN
async function updateUser(req, res) {

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

        let user; //VAR DONDE SE ALOJARA EL USUARIO
        if (req.user_payload.roles.includes(1)) { //SI SOY ADMIN: PUEDO MODIFICAR EL ACTIVE Y LOS ROLES
            //MODIFICAR ROLES //EN ROLES VIENEN LAS QUE SE INSERTARAN O ELIMINARAN
            let q_update_us = 'UPDATE users SET name = $1, last_name = $2, middle_name = $3, document_no = $4, email = $5, phone_no = $6, username = $7, active = $8 WHERE id_user = $9 RETURNING id_user, name, last_name, middle_name, document_no, email, phone_no, username, password, active, profile_image, created_at, updated_at';
            let v_update_us = [name, last_name, middle_name, document_no, email, phone_no, username, active, id_user];

            let promises = [];
            promises.push(pool.query(q_update_us, v_update_us));

            if (add_roles.length != 0) {
                let q_add_ro = 'INSERT INTO user_role (id_user, id_role) VALUES ';
                let v_add_ro = [];
                add_roles.map((role, index) => {
                    //q_add_ro += `(${id_user},${role}),`; //CONSULTA DIRECTA...
                    q_add_ro += `($${index * 2 + 1},$${index * 2 + 2}),`;
                    v_add_ro.push(...[id_user, role])
                })
                q_add_ro = q_add_ro.slice(0, -1);
                promises.push(pool.query(q_add_ro, v_add_ro));
            }
            if (delete_roles.length != 0) {
                let q_delete_ro = 'DELETE FROM user_role WHERE (id_user, id_role) IN (';
                let v_delete_ro = [];
                delete_roles.map((role, index) => {
                    q_delete_ro += `($${index * 2 + 1},$${index * 2 + 2}),`;
                    v_delete_ro.push(...[id_user, role])
                })
                q_delete_ro = `${q_delete_ro.slice(0, -1)})`;
                promises.push(pool.query(q_delete_ro, v_delete_ro));
            }

            const result_update = await Promise.all(promises);
            user = result_update[0].rows[0];
        }
        else if (id_user != req.user_payload.id_user) { //SI SOY DUEÑO DEL ID
            let text = 'UPDATE users SET name = $1, last_name = $2, middle_name = $3, document_no = $4, email = $5, phone_no = $6, username = $7 WHERE id_user = $8 RETURNING id_user, name, last_name, middle_name, document_no, email, phone_no, username, password, active, profile_image, created_at, updated_at';
            let values = [name, last_name, middle_name, document_no, email, phone_no, username, id_user];

            user = await pool.query(text, values);
        }
        else {
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
        console.log(`error: ${error}`)
        res.status(500).json({
            success: false,
            error: error
        });
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
        res.json({
            success: false,
            error
        });
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


async function getStudentsByCourse() {
}


function searchName(SELECT, PAGINATION, search, values) {

    let query;
    let array_search = search.split(' ');

    if (array_search.length == 2) {
        query = `${SELECT} WHERE (u.name = $3 OR u.last_name = $3) AND (u.last_name LIKE $4 OR u.middle_name LIKE $4) ${PAGINATION}`;
        values = [...values, `${array_search[0]}`, `%${array_search[1]}%`]
    }
    else if (array_search.length == 3) {
        query = `${SELECT} WHERE u.name = $3 AND u.last_name = $4 AND u.middle_name LIKE $5 ${PAGINATION}`;
        values = [...values, `${array_search[0]}`, `${array_search[1]}`, `%${array_search[2]}%`]
    }
    else {   //EXCELENTE: PARA CUANDO SEA 1 STRING O MAS DE 3
        query = `${SELECT} WHERE CONCAT(u.name, ' ', u.last_name, ' ', u.middle_name) LIKE $3 ${PAGINATION}`;
        values.push(`%${array_search[0]}%`);
    }

    return { query, values }
}

module.exports = {
    getUsers,
    getUserByUserId,
    createUser,
    updateUser,
    deleteUser,
    disableUser
}