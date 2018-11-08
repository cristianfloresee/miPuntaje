const user = require('./user');
const color = require('./color');
const calendar = require('./calendar');
const category = require('./category');
const subcategory = require('./subcategory');
const auth = require('./auth');
const subject = require('./subject');
const course = require('./course');
const question = require('./question');
const class_module = require('./module');
const enrollment = require('./enrollment');

module.exports = {
    user,
    color,
    calendar,
    category,
    subcategory,
    course,
    auth,
    subject,
    question,
    class_module,
    enrollment
};