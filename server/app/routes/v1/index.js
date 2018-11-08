'use strict'

// ----------------------------------------
// Load modules
// ----------------------------------------
const express = require('express');
        
// ----------------------------------------
// Load routes
// ----------------------------------------
const auth = require('./auth');
const colors = require('./color');
const users = require('./user');
const subjects = require('./subject');
const calendars = require('./calendar');
const categories = require('./category');
const subcategories = require('./subcategory');
const courses = require('./course');
const questions = require('./question');
const modules = require('./module');
const enrollments = require('./enrollment');

// ----------------------------------------
// Define express app
// ----------------------------------------
const app = express();

// ----------------------------------------
// Routes
// ----------------------------------------
app.use(auth);
app.use('/colors', colors);
app.use('/users', users);
app.use('/subjects', subjects);
app.use('/calendars', calendars);
app.use('/categories', categories);
app.use('/subcategories', subcategories);
app.use('/courses', courses);
app.use('/questions', questions);
app.use('/modules', modules);
app.use('/enrollments', enrollments);
app.use(require('./upload'));
app.use(require('./images'));

module.exports = app;

// ----------------------------------------
// Server status
// ----------------------------------------
//app.get('/status', (req, res) => res.send('OK'));

// ----------------------------------------
// Documentation
// ----------------------------------------
//router.use('/docs', express.static('docs'));
