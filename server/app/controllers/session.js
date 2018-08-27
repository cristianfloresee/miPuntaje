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
        } = await pool('SELECT * FROM users WHERE username = $1', username);

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

        let token = jwt.sign({
            user: user
        }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

        return res.json({
            success: true,
            token,
            user
        })

    } catch (error) {
        res.status(500).json({
            message: 'error in login',
            error
        });
    }
}

module.exports = {
    login
}