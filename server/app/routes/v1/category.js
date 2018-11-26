'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const categoryController = require('../../controllers').category;

var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
api.get('/', categoryController.getCategories);
//api.get('/:userId', colorController.getColorsByUserId);
api.post('/create', categoryController.createCategory);
//api.put('/update/:categoryId', categoryController.updateCategory);
api.delete('/delete/:categoryId', categoryController.deleteCategory);
//api.get('/count', categoryController.countCategory);

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;