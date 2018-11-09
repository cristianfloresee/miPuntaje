'use strict'

const express = require('express');
const calendarController = require('../../controllers').calendar;

var api = express.Router();

api.get('/', calendarController.getCalendars);
// api.get('/:userId', colorController.getColorsByUserId);
api.post('/create', calendarController.createCalendar);
api.put('/update/:calendarId', calendarController.updateCalendar);
api.delete('/delete/:calendarId', calendarController.deleteCalendar);
api.get('/count', calendarController.countCalendar);


module.exports = api;


/** POST /api/users - Create new user */
//api.get('/', checkToken, subjectController.getSubjects);
//.post(validate(paramValidation.createUser), userCtrl.create);


/** PUT /api/users/:userId - Update user */
//.put(validate(paramValidation.updateUser), userCtrl.update