'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const status = require('http-status');
const pool = require('../database');
const socket = require('../..');

// ----------------------------------------
// Login
// ----------------------------------------
async function login(req, res, next) {
    try {
        // Body Params 
        const {
            email,
            password
        } = req.body;


        const text = 'SELECT id_user, name, last_name, middle_name, document, email, phone, username, password, active, profile_image, created_at, updated_at FROM users WHERE email = $1';
        const values = [email];
        const {
            rows
        } = await pool.query(text, values);

        if (rows.length == 0) {
            return res.status(status.BAD_REQUEST)
                .send({
                    message: '(email) or password incorrect.',
                })
        }

        let user = rows[0];
        //COMPARA PASSWORDS()
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(status.BAD_REQUEST) //UNATHORIZED??
                .send({
                    message: 'email or (password) incorrect.'
                })
        }

        const text2 = 'SELECT role FROM roles WHERE id_user = $1 ORDER BY role';
        const values2 = [user.id_user];
        const roles = (await pool.query(text2, values2)).rows.map(role => role.role);
        user.roles = roles;

        delete user.password; //ELIMINA LA PASSWORD DEL OBJETO USUARIO

        //GENERA TOKEN(ID)
        let token = jwt.sign({
            user: user
        }, process.env.SEED, {
                expiresIn: process.env.TOKEN_EXPIRATION
            });


        // No puedo insertar directamente el socket 
        //let io = socket.getSocket();
        //io.emit('delete_enrollment');

        res.json({
            token,
            user
        })

    } catch (error) {
        next({ error });
    }
}

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    login
}