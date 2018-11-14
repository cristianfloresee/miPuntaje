'use strict'

const jwt = require('jsonwebtoken');
const status = require('http-status');
const pool = require('../database');

let checkToken = (req, res, next) => {
//    console.log("token: ", token);
    if (!req.headers.authorization) {
        return res.status(status.UNAUTHORIZED)
            .send({
                message: 'The request does not have the authentication header'
            });
    }

    let token = req.get('authorization');
    console.log("token: ", token);
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(status.UNAUTHORIZED)
                .send({
                    error: 'invalid token'
                })
        }
        req.user_payload = decoded.user;
        next();
    })

}



// ============================
// Verifica Token de Imagen
// ============================
let checkTokenImage = (req, res, next) => {

    let token = req.query.authorization;

    console.log("token image: ", token);
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(401)
                .json({
                    error: 'invalid token'
                })
        }
        req.user = decoded.user;
        next();
    })
}

// ============================
// Verifica Role Administrador
// ============================
async function checkAdminRole(req, res, next) {

    try {
        let user = req.user_payload;
        const text = 'SELECT role FROM roles WHERE id_user = $1 AND role = $2';
        const values = [1]

        const result = await pool.query(text, values);
        if (result) {
            return res.status(status.FORBIDDEN)
                .send({
                    message: 'You arenot a admin'
                });
        }
        next();
    } catch (error) {

    }

}

module.exports = {
    checkToken,
    checkTokenImage,
    checkAdminRole
}