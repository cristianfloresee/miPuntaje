'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const express = require('express');

// ----------------------------------------
// Load controllers
// ----------------------------------------
const questionController = require('../../controllers').question;

var api = express.Router();

// ----------------------------------------
// Routes and controllers
// ----------------------------------------

api.get('/', questionController.getQuestions);
//api.get('/:userId', colorController.getColorsByUserId);
api.post('/create', questionController.createQuestion);
//api.put('/update/:categoryId', categoryController.updateCategory);
//api.delete('/delete/:subcategoryId', subcategoryController.deleteSubcategory);
//api.get('/count', categoryController.countCategory);


module.exports = api;