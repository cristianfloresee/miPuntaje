'use strict'

// ----------------------------------------
// Load Modules
// ----------------------------------------
const express = require('express');
const status = require('http-status');

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
const lessons = require('./lesson');
const activities = require('./activity');

// ----------------------------------------
// Define express app
// ----------------------------------------
const app = express();

// ----------------------------------------
// Routes and Controllers
// ----------------------------------------
//const file_upload = require('express-fileupload');

//app.use(file_upload());
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
app.use('/lessons', lessons);
app.use('/activities', activities);

//app.use(require('./upload'));
//app.use(require('./images'));
// app.use(function(err,req,res,next) {
//     console.log(err.stack);
//     res.status(500).send({"Error" : err.stack});
//   });


module.exports = app;

// ----------------------------------------
// Server Status
// ----------------------------------------
app.get('/status', (req, res) => res.send('OK'));

// ----------------------------------------
// Documentation
// ----------------------------------------
//router.use('/docs', express.static('docs'));
