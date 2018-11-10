'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const pool = require('../database');

// =====================================================
// Obtiene todos los COLORES
// =====================================================
async function getColors(req, res, next) {
    try {
        const text = 'SELECT id_color, name, hexadecimal FROM coors ORDER BY name ASC';
        const {
            rows
        } = await pool.query(text);
        res.json({
            colors: rows
        })
    } catch (error) {
        return next(error);

        // res.status(500).json({
        //     message: 'error in obtaining colors',
        //     error: {
        //         message: error.message,
        //         code: error.code,
        //         severity: error.severity
        //     }
        // });
        
    }
}

// =====================================================
// Obtiene los COLORES de un USUARIO
// =====================================================
async function getColorsByUserId(req, res) {

    try {
        const id_user = req.params.userId

        
        const text = 'SELECT id_color, name, haxadecimal FROM colors WHERE id_color IN (SELECT id_color FROM user_subject_color WHERE id_user = $1)';
        const values = [id_user];
        const {
            rows
        } = await pool.query(text, values);
        res.json({
            success: true,
            colors: rows
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'error in obtaining user colors',
            error: {
                message: error.message,
                code: error.code,
                severity: error.severity
            }
        });
    }
}

// =====================================================
// Crea un COLOR
// =====================================================
async function createColor(req, res) {

    try {
        const {
            name,
            hexadecimal
        } = req.body;

        if (name && hexadecimal) {

            let color_exist = await checkColorExists(name, hexadecimal);
            if (color_exist) {
                color_exist.success = false;
                return res.status(500).json(color_exist)
            }

            const text = 'INSERT INTO colors(name, hexadecimal) VALUES(lower($1), upper($2)) RETURNING id_color, name, hexadecimal';
            const values = [name, hexadecimal];
            const {
                rows
            } = await pool.query(text, values);
            return res.json({
                success: true,
                message: 'successfully created color',
                color: rows[0]
            })

        } else {
            res.status(400).json({
                success: false,
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'error when saving the color',
            success: false,
            error: {
                message: error.message,
                code: error.code,
                severity: error.severity,
                detail: error.detail
            }
        })
    }
}

// =====================================================
// Actualiza un COLOR
// =====================================================
async function updateColor(req, res) {
    try {
        const id_color = req.params.colorId;
        const {
            name,
            hexadecimal
        } = req.body;

        if (name && hexadecimal) {
            let color_exist = await checkColorExists(name, hexadecimal);
            if (color_exist) {
                color_exist.success = false;
                return res.status(500).json(color_exist)
            }

            const text = 'UPDATE colors SET name = lower($1), hexadecimal = upper($2) WHERE id_color = $3 RETURNING id_color, name, hexadecimal';
            const values = [name, hexadecimal, id_color];
            const {
                rows
            } = await pool.query(text, values);

            if (rows.length > 0) {
                res.json({
                    success: true,
                    message: 'successfully updated color',
                    color: rows[0]
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'this color does not exist'
                });
            }

        } else {
            res.status(400).json({
                success: false,
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        console.log(`database ${error}`)
        res.json({
            success: false,
            error: {
                message: error.message,
                code: error.code,
                severity: error.severity,
                detail: error.detail
            }
        });
    }
}

// =====================================================
// Elimina un COLOR
// =====================================================
async function deleteColor(req, res) {
    try {
        const id_color = req.params.colorId;

        const text = 'DELETE FROM colors WHERE id_color = $1';
        const values = [id_color];
        const {
            rows
        } = await pool.query(text, values);
        res.json({
            success: true,
            message: 'successfully deleted color'
        });
    } catch (error) {
        console.log(`database ${error}`)
        res.json({
            success: false,
            error
        });
    }
}

// =====================================================
// Chequea si el nombre o hexadecimal del COLOR existe
// =====================================================
function checkColorExists(name, hexadecimal) {
    return new Promise(async (resolve, reject) => {
        try {
            const result_search = await Promise.all([
                pool.query('SELECT id_color FROM colors WHERE name = lower($1)', [name]),
                pool.query('SELECT id_color FROM colors WHERE hexadecimal = upper($1)', [hexadecimal])
            ]);
            const rows_name = result_search[0].rows;
            const rows_hexadecimal = result_search[1].rows;

            let combination = `${rows_name.length}${rows_hexadecimal.length}`;

            switch (combination) {
                case '11':
                    return resolve({
                        status: '11',
                        message: `this name and hexadecimal has been taken`
                    })
                case '10':
                    return resolve({
                        status: '10',
                        message: `this name has been taken`
                    })
                case '01':
                    return resolve({
                        status: '01',
                        message: `this hexadecimal has been taken`
                    })
                default:
                    return resolve(null);
            }
        } catch (error) {
            return reject(error);
        }
    })


}

module.exports = {
    getColors,
    getColorsByUserId,
    createColor,
    updateColor,
    deleteColor
}