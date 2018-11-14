'use strict'

const express = require('express');
const enrollmentController = require('../../controllers').enrollment;

var api = express.Router();

api.get('/', enrollmentController.getEnrollments);
api.get('/courses/:courseId', enrollmentController.getEnrollmentsByCourseId);
api.post('/', enrollmentController.createEnrollment);
api.put('/courses/:courseId/users/:userId', enrollmentController.updateEnrollment);
api.delete('/courses/:courseId/users/:userId', enrollmentController.deleteEnrollment);
//api.get('/count', calendarController.countCalendar);


module.exports = api;