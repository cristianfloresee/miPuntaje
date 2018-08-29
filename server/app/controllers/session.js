'use strict'

const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const pool = require('../database/pool');
//var _ = require('lodash');

async function login(req, res) {
    try {
        const {
            username,
            password
        } = req.body;

        const {
            rows
        } = await pool('SELECT id_user, name, last_name, middle_name, document_no, email, phone_no, username, password, active, profile_image, created_at, updated_at FROM users WHERE username = $1', username);

        if (rows.length == 0) {
            return res.status(400).json({
                success: false,
                message: '(username) or password incorrect.',
            })
        }

        let user = rows[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({
                success: false,
                message: 'user or (password) incorrect.'
            })
        }

        const roles = (await pool('SELECT id_role FROM user_role WHERE id_user = $1', user.id_user)).rows;
        console.log("roles: ", roles);

        let token = jwt.sign({
            user: user
        }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

        //DEVOLVER USUARIO SIN CONTRASEÑA!
        delete user.password;
        return res.json({
            success: true,
            token,
            user
        })

    } catch (error) {
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