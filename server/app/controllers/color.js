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
            message: 'error in obtaining colors',
            error
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
            message: 'error in obtaining user colors',
            error
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

            let combination = `${rows_name.length}${rows_hexadecimal.length}`;

            switch (combination) {
                case '11':
                    return res.status(500).json({
                        status: '11',
                        message: `this name and hexadecimal has been taken`
                    })
                case '10':
                    return res.status(500).json({
                        status: '10',
                        message: `this name has been taken`
                    })
                case '01':
                    return res.status(500).json({
                        status: '01',
                        message: `this hexadecimal has been taken`
                    })
                default:
                    const {
                        rows
                    } = await pool('INSERT INTO colors(name, hexadecimal) VALUES($1, $2)', name, hexadecimal);
                    res.json({
                        message: 'successfully created color'
                    })
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
            error
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
            return res.status(500).json({
                message: 'No tienes permiso para actualizar los datos del usuario'
            });
        }
        const {
            rows
        } = await pool('UPDATE colors SET name = $1, hexadecimal = $2 WHERE id_color = $3 ', name, hexadecimal, id_color);

        res.status(200).json({
            message: 'successfully updated color',
            color: rows
        });
    } catch (error) {
        console.log(`database ${error}`)
        res.json({
            success: false,
            error
        });
    }
}

async function deleteColor(req, res) {
    try {
        const id_color = req.params.colorId;
        const {
            rows
        } = await pool('DELETE FROM colors WHERE id_color = $1', id_color);
        res.json({
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

module.exports = {
    getColors,
    getColorsByUserId,
    createColor,
    updateColor,
    deleteColor
}