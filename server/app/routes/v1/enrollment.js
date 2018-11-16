'use strict'

const express = require('express');
const enrollmentController = require('../../controllers').enrollment;

var api = express.Router();

api.get('/', enrollmentController.getEnrollments);
api.get('/courses/:courseId', enrollmentController.getEnrollmentsByCourseId);
api.post('/', enrollmentController.createEnrollment);
api.put('/:courseId/:userId', enrollmentController.updateEnrollment);
api.delete('/:courseId/:userId', enrollmentController.deleteEnrollment);
//api.get('/count', calendarController.countCalendar);


module.exports = api;