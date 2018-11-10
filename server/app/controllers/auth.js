'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const status = require('http-status');
const pool = require('../database');


async function login(req, res) {
    try {
        const {
            email,
            password
        } = req.body;


        if (email && password) {
            const text = `SELECT id_user, name, last_name, middle_name, document_no, email, phone_no, username, password, active, profile_image, created_at, updated_at FROM users WHERE email = $1`;
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

            const text2 = `SELECT id_role FROM user_role WHERE id_user = $1 ORDER BY id_role`;
            const values = [user.id_user];
            const roles = (await pool.query(text2, values)).rows.map(role => role.id_role);
            user.roles = roles;

            delete user.password; //ELIMINA LA PASSWORD DEL OBJETO USUARIO

            //GENERA TOKEN(ID)
            let token = jwt.sign({
                user: user
            }, process.env.SEED, {
                expiresIn: process.env.TOKEN_EXPIRATION
            });

            return res.json({
                token,
                user
            })
        } else {
            return res.status(status.BAD_REQUEST)
                .send({
                    'message': 'Some values are missing'
                });
        }


    } catch (error) {
        console.log(error);
        res.status(status.INTERNAL_SERVER_ERROR)
            .send({
                message: 'error in login',
                error
            });
    }
}

module.exports = {
    login
}