'use strict'

const express = require('express');
const sesionController = require('../../controllers').sesion;
var api = express.Router();

api.post('/login', sesionController.login);

module.exports = api;