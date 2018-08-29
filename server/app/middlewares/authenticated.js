'use strict'

const jwt = require('jsonwebtoken');

// ============================
// Verifica Token
// ============================
let checkToken = (req, res, next) => {
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
        req.user_payload = decoded.user;
    })
    next();
}



// ============================
// Verifica Token de Imagen
// ============================
let checkTokenImage = (req, res, next) => {

    let token = req.query.authorization;
    
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                success: false,
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
 let checkAdminRole = (req, res, next) => {
     let user = req.user_payload;
//'SELECT * FROM user_role WHERE id_user = $1 && id_role = 1'
 }

module.exports = {
    checkToken,
    checkTokenImage,
    checkAdminRole
}