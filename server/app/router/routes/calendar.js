'use strict'

const express = require('express');
const calendarController = require('../../controllers').calendar;

var api = express.Router();

api.get('/', calendarController.getCalendars);
// api.get('/:userId', colorController.getColorsByUserId);
api.post('/create', calendarController.createCalendar);
api.put('/update/:calendarId', calendarController.updateCalendar);
api.delete('/delete/:calendarId', calendarController.deleteCalendar);


module.exports = api;