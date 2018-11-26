'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const courseController = require('../../controllers').course;

var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
api.get('/', courseController.getCourses);
// api.get('/:userId', colorController.getColorsByUserId);
api.post('/create', courseController.createCourse);
api.put('/update/:courseId', courseController.updateCourse);
api.delete('/delete/:courseId', courseController.deleteCourse);
// api.get('/count', calendarController.countCalendar);

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;