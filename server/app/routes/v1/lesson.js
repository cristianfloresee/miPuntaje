'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const _lessonController = require('../../controllers')._lesson;
//const _validation = require('../../validations/calendar.validation');
//const _validate = require('../../middlewares/validation-result');

var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
api.get('/select_options', _lessonController.getLessonOptions); //Opciones para el Selector
api.get('/:classId', _lessonController.getClassById);
api.get('/', _lessonController.getLessons);
api.post('/', _lessonController.createLesson);
api.put('/:lessonId', _lessonController.updateLesson);
api.delete('/:lessonId', _lessonController.deleteLesson);


// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;