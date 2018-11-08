'use strict'

const express = require('express');
const subcategoryController = require('../../controllers').subcategory;

var api = express.Router();

api.get('/', subcategoryController.getSubcategories);
//api.get('/:userId', colorController.getColorsByUserId);
api.post('/create', subcategoryController.createSubcategory);
//api.put('/update/:categoryId', categoryController.updateCategory);
api.delete('/delete/:subcategoryId', subcategoryController.deleteSubcategory);
//api.get('/count', categoryController.countCategory);


module.exports = api;