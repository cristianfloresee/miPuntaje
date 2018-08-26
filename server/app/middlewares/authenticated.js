'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const seed = 'secret_string_crsoq';

exports.ensureAuth = function (req, res, next) {
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

    req.user = payload;
    next();
}