'use strict'

const pool = require('../database/pool');

async function getCalendars(req, res) {
    try {
        const {
            rows
        } = await pool('SELECT id_calendar, year, semester, created_at, updated_at FROM calendars');
        res.json(rows)
    } catch (error) {
        res.status(500).json({
            message: 'error in obtaining calendars',
            error
        });
    }
}

async function createCalendar(req, res) {

    try {
        const {
            year,
            semester
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
            error
        })
    }
}

async function updateCalendar(req, res) {
    try {
        const { rows } = await pool('SELECT * FROM calendar');
        res.json(rows)
    } catch (error) {
        console.log(`database ${error}`)
        res.json({'success':false, 'err':error});
    }
}

async function deleteCalendar(req, res) {
    try {
        const id_calendar = req.params.calendarId;
        const {
            rows
        } = await pool('DELETE FROM calendars WHERE id_calendar = $1', id_calendar);
        res.json({
            message: 'successfully deleted calendar'
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
    getCalendars,
    //createCalendar,
    //updateCalendar,
    deleteCalendar
}