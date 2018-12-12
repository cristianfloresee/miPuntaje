// ----------------------------------------
// Load Modules
// ----------------------------------------
const user = require('./user');
const color = require('./color');
const calendar = require('./calendar');
const category = require('./category');
const subcategory = require('./subcategory');
const auth = require('./auth');
const subject = require('./subject');
const course = require('./course');
const question = require('./question');
const _module = require('./module');
const enrollment = require('./enrollment');
const _lesson = require('./lesson');
const _activity = require('./activity');
const _activityParticipation = require('./activity_participation');
const _image = require('./image');
const _workspace = require('./workspace');

// ----------------------------------------
// Export Modules
// ----------------------------------------
module.exports = {
    _activity,
    _activityParticipation,
    user,
    color,
    calendar,
    category,
    subcategory,
    course,
    auth,
    subject,
    question,
    _module,
    _lesson,
    enrollment,
    _image,
    _workspace
};