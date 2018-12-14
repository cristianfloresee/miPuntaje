'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const _lessonQuestionController = require('../../controllers')._lessonQuestion;

var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
api.get('/', _lessonQuestionController.getLessonQuestions);
api.get('/all', _lessonQuestionController.getAllQuestionsForLesson);
//api.get('/select_options', _questionController.getQuestionOptions); //Opciones para el Selector
//api.get('/:userId', colorController.getColorsByUserId);
api.post('/', _lessonQuestionController.updateLessonQuestions);
//api.put('/:questionId', _questionController.updateQuestion);
//api.delete('/:questionId', _questionController.deleteQuestion);
//api.get('/count', categoryController.countCategory);

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;