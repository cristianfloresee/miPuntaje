'use strict'
// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const moduleController = require('../../controllers')._module;

var api = express.Router();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
api.get('/', moduleController.getModules);
api.get('/select_options', moduleController.getModuleOptions); //Opciones para el Selector
api.post('/create', moduleController.createModule); // -Corregir
api.put('/update/:moduleId', moduleController.updateModule); // -Corregir
api.delete('/delete/:moduleId', moduleController.deleteModule); // -Corregir
// api.get('/count', calendarController.countCalendar);

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;