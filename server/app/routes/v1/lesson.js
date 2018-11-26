'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const _lessonController = require('../../controllers')._lesson;
const _validation = require('../../validations/calendar.validation');
const _validate = require('../../middlewares/validation-result');

var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
//api.get('/', _lessonController.getCalendars);
api.get('/', _lessonController.getLessons);
api.post('/', _lessonController.createLesson);
api.put('/:lessonId', _lessonController.updateLesson);
// api.delete(':activityId', _activityController.deleteActivity);
// api.get('/count', _activityController.countActivity);

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;