'use strict'

const express = require('express');
const userController = require('../../controllers').user;
const { ensureAuth } = require('../../middlewares/authenticated');
var api = express.Router();

api.get('/', ensureAuth, userController.getUsers);
api.get('/:userId', userController.getUserByUserId);
api.post('/create', userController.createUser);
api.put('/update/:userId', userController.updateUser);
api.delete('/delete/:userId', userController.deleteUser);
//api.get('/:userId/:page?', colorController.getColorsByUserId);
//api.put('update-color/:i')

module.exports = api;