'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const jwt = require('jsonwebtoken');
const status = require('http-status');
const pool = require('../database');

// ----------------------------------------
// Check Token
// ----------------------------------------
let checkToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(status.UNAUTHORIZED)
            .send({
                message: 'The request does not have the authentication header'
            });
    }

    let token = req.get('authorization');
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

// ----------------------------------------
// Check Role
// ----------------------------------------
async function checkAdminRole(req, res, next) {

    let role = 1;
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
        next({ error });
    }

}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    checkToken,
    checkAdminRole
}