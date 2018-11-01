'use strict'

const express = require('express');
const courseController = require('../../controllers').course;

var api = express.Router();

api.get('/', courseController.getCourses);
// api.get('/:userId', colorController.getColorsByUserId);
api.post('/create', courseController.createCourse);
// api.put('/update/:calendarId', calendarController.updateCalendar);
// api.delete('/delete/:calendarId', calendarController.deleteCalendar);
// api.get('/count', calendarController.countCalendar);


module.exports = api;