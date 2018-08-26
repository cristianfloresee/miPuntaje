'use strict'

const express = require('express');
const calendarController = require('../../controllers').calendar;

var api = express.Router();

api.get('/', calendarController.getCalendars);
// api.get('/:userId', colorController.getColorsByUserId);
// api.post('/create', colorController.createColor);
// api.put('/update/:colorId', colorController.updateColor);
// api.delete('/delete/:colorId', colorController.deleteColor);
//api.get('/:userId/:page?', colorController.getColorsByUserId);

module.exports = api;