'use strict'

const pool = require('../database/pool');
//const Color = require('../models/color');

async function getColors(req, res) {
    try {
        const {
            rows
        } = await pool('SELECT id_color, name, hexadecimal FROM colors');
        res.json(rows)
    } catch (error) {
        res.status(500).json({
            'message': 'error in obtaining colors',
            'error': error
        });
    }
}

async function getColorsByUserId(req, res) {

    let id_user = req.params.userId
    try {
        const {
            rows    
        } = await pool('SELECT id_color, name, haxadecimal FROM colors WHERE id_color IN (SELECT id_color FROM user_subject_color WHERE id_user = $1)', user_id);
        res.json(rows)
    } catch (error) {
        res.status(500).json({
            'message': 'error in obtaining user colors',
            'error': error
        });
    }
}

async function createColor(req, res) {

    try {
        const {
            name,
            hexadecimal
        } = req.body;

        if (name && hexadecimal) {
            const result_search = await Promise.all([
                pool('SELECT id_color FROM colors WHERE name = $1', name),
                pool('SELECT id_color FROM colors WHERE hexadecimal = $1', hexadecimal)
            ]);
            const rows_name = result_search[0].rows;
            const rows_hexadecimal = result_search[1].rows;
            if (rows_name.length !== 0 && rows_hexadecimal.length !== 0) {
                return res.status(500).json({
                    status: 0,
                    message: 'this color name and color hexadecimal has been taken'
                })
            } else if (rows_name.length !== 0) {
                return res.status(500).send({
                    status: 1,
                    message: 'this color name has been taken'
                })
            } else if (rows_hexadecimal.length !== 0) {
                return res.status(500).send({
                    status: 2,
                    message: 'this color hexadecimal has been taken'
                })
            } else {
                const { rows } = await pool('INSERT INTO colors(name, hexadecimal) VALUES($1, $2)', name, hexadecimal);
                res.json({message: 'successfully created color'})
            }
        } else {
            res.status(400).json({
                message: 'send all necessary fields'
            })
        }
    } catch (error) {
        console.log(`${error}`)
        res.status(500).json({
            message: 'error when saving the color',
            error: error
        })
    }
}

async function updateColor(req, res) {
    try {
        const id_color = req.params.colorId;
        const {
            name,
            hexadecimal
        } = req.body;
        if (id_color) {
            return res.status(500).send({
                message: 'No tienes permiso para actualizar los datos del usuario'
            });
        }
        const {
            rows
        } = await pool('UPDATE colors SET name = $1, hexadecimal = $2 WHERE id_color = $3 ', name, hexadecimal, id_color);

        if (!rows) return res.status(400).send({
            message: 'No se ha podido actualizar el color'
        })
        return res.status(200).send({
            color: rows
        });
    } catch (error) {
        console.log(`database ${error}`)
        res.json({
            'success': false,
            'error': error
        });
    }
}

async function deleteColor(req, res) {
    try {
        const id_color = req.params.colorId;
        const {
            rows
        } = await pool('DELETE FROM colors WHERE id_color = $1', id_color);
        res.json({message: 'successfully deleted color'});
    } catch (err) {
        console.log(`database ${err}`)
        res.json({
            'success': false,
            'err': err
        });
    }
}

module.exports = {
    getColors,
    getColorsByUserId,
    createColor,
    updateColor,
    deleteColor
}