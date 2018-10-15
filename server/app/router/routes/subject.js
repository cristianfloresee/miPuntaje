'use strict'

const express = require('express');
const subjectController = require('../../controllers').subject;
const { checkToken } = require('../../middlewares/authenticated');
var api = express.Router();

api.get('/', checkToken, subjectController.getSubjects);
api.post('/create', subjectController.createSubject);
api.put('/update/:subjectId', subjectController.updateSubject);
api.delete('/delete/:subjectId', subjectController.deleteSubject);
api.get('/count', checkToken, subjectController.countSubject);

module.exports = api;