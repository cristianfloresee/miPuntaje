module.exports = (app) => {
    app.use('/colors', require('./routes/color'));
    app.use('/users', require('./routes/user'));
    app.use('/calendars', require('./routes/calendar'));
};



// const userController = require('../controllers').user;
//const subjectController = require('../controllers').subject;
// const courseController = require('../controllers').course;
// const calendarController = require('../controllers').calendar;
// const courseController = require('../controllers').class;
// const questionController = require('../controllers').question;


// api.get('/login', userController.getAllUsers);
// api.get('/subjects', userController.getAllUsers);
// api.get('/calendar', userController.getAllUsers);
// api.get('/courses', userController.getAllUsers);
//api.get('/class', userController.getAllUsers);
//api.get('/question', userController.getAllUsers);
//api.get('/activities', userController.getAllUsers);
//api.get('/students', userController.getAllUsers);
//api.get('/teachers', userController.getAllUsers);
//api.get('/info', userController.getAllUsers);



//app.use('/calendario', require('./routes/calendario'));
//app.use('/asignaturas', require('./routes/asignaturas'));
//app.use('/cursos', require('./routes/cursos'));
//app.use('/clases', require('./routes/clases'));
//app.use('/preguntas', require('./routes/preguntas'));
//app.use('/biblioteca', require('./routes/biblioteca'));
//app.use('/actividades', require('./routes/actividades'));
//app.use('/estudiante', require('./routes/estudiante'));
//app.use('/profesores', require('./routes/profesores'));
//app.use('/info', require('./routes/info'));

