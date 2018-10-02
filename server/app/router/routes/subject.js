'use strict'

const express = require('express');
const subjectController = require('../../controllers').subject;
const { checkToken } = require('../../middlewares/authenticated');
var api = express.Router();

api.get('/', checkToken, subjectController.getSubjects);

module.exports = api;