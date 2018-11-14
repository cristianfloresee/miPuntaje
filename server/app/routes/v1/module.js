'use strict'

const express = require('express');
const moduleController = require('../../controllers').class_module;

var api = express.Router();

//api.get('/', calendarController.getCalendars);
api.get('/', moduleController.getModules);
api.post('/create', moduleController.createModule);
api.put('/update/:moduleId', moduleController.updateModule);
api.delete('/delete/:moduleId', moduleController.deleteModule);
// api.get('/count', calendarController.countCalendar);


module.exports = api;