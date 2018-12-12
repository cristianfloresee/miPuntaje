'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const _activityParticipationController = require('../../controllers')._activityParticipation;
//const _validation = require('../../validations/calendar.validation');
//const _validate = require('../../middlewares/validation-result');

var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
//api.get('/select_options', _lessonController.getLessonOptions); //Opciones para el Selector
//api.get('/', _lessonController.getLessons);
//api.post('/', _lessonController.createLesson);
api.put('/:activityId/:userId', _activityParticipationController.updateActivityParticipation);
//api.delete('/:lessonId', _lessonController.deleteLesson);


// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;