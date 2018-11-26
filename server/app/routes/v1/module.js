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
//api.get('/', calendarController.getCalendars);
api.get('/', moduleController.getModules);
api.post('/create', moduleController.createModule);
api.put('/update/:moduleId', moduleController.updateModule);
api.delete('/delete/:moduleId', moduleController.deleteModule);
// api.get('/count', calendarController.countCalendar);

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = api;