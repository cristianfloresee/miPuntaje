const express = require('express');
const app = express();

app.use(require('./routes/sesion'));
app.use('/colors', require('./routes/color'));
app.use('/users', require('./routes/user'));
app.use('/subjects', require('./routes/subject'));
app.use('/calendars', require('./routes/calendar'));
app.use('/categories', require('./routes/category'));
app.use('/subcategories', require('./routes/subcategory'));
app.use('/courses', require('./routes/course'));
app.use('/questions', require('./routes/question'));
app.use(require('./routes/upload'));
app.use(require('./routes/images'));

module.exports = app;

//const subjectController = require('../controllers').subject;
// const courseController = require('../controllers').course;
// const calendarController = require('../controllers').calendar;
// const courseController = require('../controllers').class;
// const questionController = require('../controllers').question;