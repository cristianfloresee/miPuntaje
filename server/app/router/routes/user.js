'use strict'

const express = require('express');
const userController = require('../../controllers').user;

var api = express.Router();

api.get('/', userController.getUsers);
api.get('/:userId', userController.getUserByUserId);
api.post('/create', userController.createUser);
// api.put('/update/:colorId', colorController.updateColor);
// api.delete('/delete/:colorId', colorController.deleteColor);
//api.get('/:userId/:page?', colorController.getColorsByUserId);
//api.put('update-color/:i')

module.exports = api;