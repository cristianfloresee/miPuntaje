'use strict'

const jwt = require('jsonwebtoken');
const moment = require('moment');

exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).json({
            message: 'The request does not have the authentication header'
        });
    }

    let token = req.get('authorization');
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                success: false,
                error: 'invalid token'
            })
        }
        req.users = decoded.users;
    })

    /*
    if (!req.headers.authorization) return res.status({
        message: 'La petición no tiene la cabecera de autentificación'
    });


    var token = req.header.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, seed);
        if (payload.exp <= moment.unix()) {
            return res.status(401).send({
                message: 'token expired'
            })
        }
    } catch (ex) {
        return res.status(401).send({
            message: 'invalid token'
        })
    }

    req.user = payload;*/
    next();
}

// let ensureAdminRole = (req, res, next) => {
//     let user = req,user;
// }