'use strict'

const express = require('express');
const enrollmentController = require('../../controllers').enrollment;

var api = express.Router();

//api.get('/', enrollmentController.getEnrollments);
// api.get('/:userId', colorController.getColorsByUserId);
api.post('/', enrollmentController.createEnrollment);
//api.put('/update/:calendarId', calendarController.updateCalendar);
//api.delete('/delete/:calendarId', calendarController.deleteCalendar);
//api.get('/count', calendarController.countCalendar);


module.exports = api;