'use strict'

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const pool = require('../database/pool');
//const User = require('../models/user');

async function getUsers(req, res) {
    try {
        const {
            rows
        } = await pool('SELECT id_user, name, last_name, middle_name, document_no, email, phone_no, username, active, profile_image, created_at, updated_at FROM users');
        res.json(rows)
    } catch (error) {
        res.status(500).json({
            'message': 'error in obtaining users',
            'error': error
        });
    }
}

async function getUserByUserId(req, res) {
    var id_user = req.params.userId;
    try {
        const {
            rows
        } = await pool('SELECT id_user, name, last_name, middle_name, document_no, email, phone_no, username, active, profile_image, created_at, updated_at FROM users WHERE id_user = $1', id_user);
        res.json(rows)
    } catch (error) {
        res.status(500).json({
            'message': 'error in obtaining users',
            'error': error
        });
    }
}

function createUser(req, res) {
    var params = req.body;
    //var user = new User(); CREO MODELOS O NO? EN MONGO SI SE HACE

    //SI ME ENVIAN TODOS LOS DATOS OBLIGATORIOS
    if (params.name && params.last_name && params.middle_name && params.email && params.password) {
        //user.name = 
        //COMPRUEBO QUE EL RUT,USERNAME E EMAIL NO EXISTAN  EN LA BASE DE DATOS user.rut.toLowerCase()

        bcrypt.hash(params.password, null, null, (error, hash) => {
            user.password = hash;
        });
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        })
    }
}


function updateUser(req, res) {
    var user_id = req.params.id;
    //BUSCAR ID EN LA BASE DE DATOS...
}


function deleteUser(req, res) {
    var user_id = req.params.id;
    //BUSCAR ID EN LA BASE DE DATOS...
}

function login(req, res) {
    var params = req.body;

    var rut = params.rut;
    var password = params.password;

    //COMPROBAR SI EL RUT Y LA CONTRASEÑA QUE ME ESTAN ENVIANDO COINCIDEN CON ALGUNA EN LA BASE DE DATOS
    if (user) {
        //bcrypt.compare() password que le paso y password almacenada en al db
    }

}

function logout(req, res) {
    var params = req.body;
}


async function getStudentsByCourse(){

}
module.exports = {
    getUsers,
    getUserByUserId,
    createUser,
    updateUser,
    deleteUser
}