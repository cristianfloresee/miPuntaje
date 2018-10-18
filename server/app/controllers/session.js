'use strict'

const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const pool = require('../database/pool');
//var _ = require('lodash');

async function login(req, res) {
    try {
        const {
            email,
            password
        } = req.body;

        const {
            rows
        } = await pool.query('SELECT id_user, name, last_name, middle_name, document_no, email, phone_no, username, password, active, profile_image, created_at, updated_at FROM users WHERE email = $1', [email]);

        if (rows.length == 0) {
            return res.status(400).json({
                success: false,
                message: '(email) or password incorrect.',
            })
        }
        let user = rows[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({
                success: false,
                message: 'email or (password) incorrect.'
            })
        }

        //const roles = (await pool.query('SELECT ur.id_role, r.name FROM user_role AS ur INNER JOIN roles AS r ON ur.id_role = r.id_role WHERE ur.id_user = $1', [user.id_user])).rows;
        const roles = (await pool.query('SELECT id_role FROM user_role WHERE id_user = $1 ORDER BY id_role', [user.id_user])).rows.map(role => role.id_role);
        user.roles = roles;

        delete user.password; //ELIMINA LA PASSWORD DEL OBJETO USUARIO
        let token = jwt.sign({
            user: user
        }, process.env.SEED, {
                expiresIn: process.env.TOKEN_EXPIRATION
            });

        return res.json({
            success: true,
            token,
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'error in login',
            error
        });
    }
}

module.exports = {
    login
}