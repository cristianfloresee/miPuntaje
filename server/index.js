'use strict'

// ----------------------------------------
// Global Config
// ----------------------------------------
require('./app/config/config');

// ----------------------------------------
// Load Modules
// ----------------------------------------
const eValidator = require('express-validator')
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require('colors');
// Load Files
const _routes = require('./app/routes/v1');
const _error = require('./app/middlewares/error');
const pool = require('./app/database');

// ----------------------------------------
// Variables que pueden ser exportadas
// ----------------------------------------
var io;
let users_connected = []; // {id_user, id_socket, role}
//let detail_users_connected = []; //{id_user, username, role, courses}
let student_participants_of_a_question = {};
let students_in_classrooms = {};

// ----------------------------------------
// Start HTTP server
// ----------------------------------------
initWebServer();

// ----------------------------------------
// Init Web Server
// ----------------------------------------
function initWebServer() {

    let app = express();
    let httpServer = http.Server(app);
    io = socket(httpServer);
    let num_connections = 0;

    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(cors({
        origin: '*'
    }));
    app.use(eValidator());
    app.use(_routes);
    app.use(_error.logErrors);
    app.use(_error.handler);

    (async () => {
        try {
            let server = await httpServer.listen(process.env.PORT);

            const address = server.address();
            const host = address.address;
            const port = address.port;

            console.log(` [+] webserver is running on ${host}${port}... ${colors.green.bold('[OK]')}`)

            io.on('connection', (socket) => {
                num_connections++;
                console.log(colors.magenta.bold(` [-] user ip ${socket.handshake.address} has connected.\n     connected users: ${num_connections}`));


                // --------------------------------------------------------
                // Listado de usuarios conectados (junto a sus cursos)?.
                // --------------------------------------------------------
                socket.on('connectedUser', async (data) => {
                    console.log(" socket.on(connectedUser): ", data);
                    
                    // Comprueba si el usuario ya esta en el listado (de acuerdo al id_socket)
                    // Pueden haber varias sesiones para un mismo usuario (diferentes roles o id_socket)
                    let user_exist = users_connected.find(user => user.id_socket == socket.id);

                    // Comprueba si la sesión existe (mismo id_socket y mismo id_user)
                    const repeated_session = users_connected.find(user => {
                        return (user.id_socket == socket.id && user.id_user == data.id_user)
                    });

                    // Si existe, actualiza la data (id_user y role)
                    if (user_exist) {
                        //console.log(` + user exist.`);
                        console.log(` + user exist.\n + update user session data (id_user, role).\n`)
                        user_exist.id_user = data.id_user;
                        user_exist.role = data.role;
                    }
                    // Si el usuario no existe, lo agrega (id_socket, id_user, role)
                    else {
                        addToUsersConnected(data, socket.id);
                    }

                    // Si el rol del usuario es estudiante
                    if (data.role == 3) {
                        const text = `
                        SELECT id_course
                        FROM course_user AS cu
                        WHERE id_user = $1
                        AND active = TRUE`;
                        const values = [data.id_user];
                        const {
                            rows
                        } = await pool.query(text, values);
                        console.log(" + obtiene cursos del usuario estudiante: ", rows);
                    }

                    //socket.emit('usersConnectedHasChanged', getusersConnected());
                    // Obtiene los cursos 
                    /*if (data.role == 2) {
                        console.log("usuario role profesor...");
                        addUserToUsersConnected('courses..')

                    }
                    else if (data.role == 3) {
                        console.log("usuario role estudiante...");
                        // { id_course, name_course, }
                        const text = `SELECT c.id_course, c.name, ca.year, ca.semester
                        FROM courses AS c 
                        INNER JOIN calendars as ca 
                        ON ca.id_calendar = c.id_calendar 
                        WHERE id_user = $1`;
                        const values = [data.id_user];
                        const res = (await pool.query(text, values)).rows[0];
                    }*/
                });

                // data: { id_user, }
                /*socket.on('studentEnrolled', (data)=> {
                    console.log("studentEnrolled: ", data);
                });*/

                // data: {id_user, role}
                //socket.on('updateRoleToOnlineUser')
                socket.on('updateRoleToUserConnected', async (data) => {
                    console.log(" socket.on(updateRoleToOnlineUser): ", data);

                    // Ve si ya existe el usuario (de acuerdo al id_socket)
                    const user = users_connected.find(user => user.id_socket == socket.id);
                    if (user) {
                        // Si existe actualiza su role
                        user.role = data.role;
                    } else {
                        console.log(" + user (by id_socket) doesn't exist. Add user.");
                        // Aqui la cago porque agrego un usuario sin id_user y porque este evento se ejecuta primero que el connected_user
                        addToUsersConnected(data, socket.id);
                    }
                    console.log(` + online_users:  ${JSON.stringify(users_connected)}`);
                    //socket.emit('usersConnectedHasChanged', getusersConnected());

                    // Si el role del usuario es estudiante
                    if (data.role == 3) {
                        const text = `SELECT id_course
                        FROM course_user AS cu
                        WHERE id_user = $1
                        AND active = TRUE`;
                        const values = [data.id_user];
                        const courses = (await pool.query(text, values)).rows;
                        console.log(" + obtiene cursos del usuario estudiante: ", courses);


                        // Uno al usuario a las salas de cada curso en el que esta inscrito (courses)
                        courses.forEach(course => {
                            //console.log("COURSE: ", course.id_course)
                            socket.join(course.id_course + 'students');
                        });
                        console.log(" + une al estudiante a las salas: ", socket.rooms, '\n');
                        //console.log(socket.rooms);
                    }

                });


                socket.on('initClass', (data) => {

                });


                // Entrar a la sección de estudiantes de un curso (siendo profesor)
                socket.on('enterToCourseRoom', (params) => {
                    console.log("ID COURSE FOR ROOM: ");
                    console.log(params);
                    socket.join(params.id_course);
                });
                // Salir de la sección de estudiantes de un curso (siendo profesor)
                socket.on('exitToCourseRoom', (params) => {
                    console.log("ID COURSE FOR ROOM (EXIT): ");
                    console.log(params);
                    socket.leave(params.id_course);
                });

                // Entrar a la sección de estudiantes de un curso (siendo profesor)
                socket.on('enterToClassSectionRoomAsStudent', (params) => {
                    console.log("enterToClassSectionRoomAsStudent: ");
                    console.log(params);
                    console.log(`Ingresa a la sala: ${params.id_course+'class-section-room'}`)
                    socket.join(params.id_course + 'class-section-room');
                });
                socket.on('exitToClassSectionRoomAsStudent', (params) => {
                    console.log("exitToClassSectionRoomAsStudent: ");
                    console.log(params);
                    socket.leave(params.id_course + 'class-section-room');
                });

                // Entrar a la sección de estudiantes de un curso (siendo profesor)
                socket.on('enterToActivitySectionRoomAsStudent', (params) => {
                    socket.join(params.id_course + 'activity-section-room');

                });
                socket.on('exitToActivitySectionRoomAsStudent', (params) => {
                    socket.leave(params.id_course + 'activity-section-room');
                });



                // Entrar a la sección de juego de la pregunta de clase
                socket.on('enterToPlayQuestionSectionRoomAsTeacher', async (params) => {
                    socket.join(params.id_class + 'teacher__play_question_section');
                    console.log("enterToPlayQuestionSectionRoomAsTeacher: ", params.id_class + 'teacher__play_question_section');

                    // Emite un evento con los estudiantes que esten en la sala.
                    // + Para eso debe haber un array con los estudiantes que estan en la sala.
                    //student_participants_of_a_question[params.id_class].push();
                    // 

                    //socket.emit('aStudentHasEntered', student_participants_of_a_question[params.id_class]);
                    // Emite a si mismo el listado de estudiantes que estan participando por responder.
                    socket.emit('aStudentHasEntered', {
                        student_participants: student_participants_of_a_question[params.id_class],
                        //student_selected: 
                    });
                });

                // listener: Cuando estudiante sale de la sala de clases.
                socket.on('exitToPlayQuestionSectionRoomAsTeacher', (params) => {
                    console.log("exitToPlayQuestionSectionRoomAsTeacher: ", params.id_class + 'teacher__play_question_section');
                    // Estudiante sale de la sala socket.
                    socket.leave(params.id_class + 'teacher__play_question_section');

                    // Emite a otros estudiantes que salio de la sala.

                });


                // Entra al conjunto de participantes por responder preguntas de la clase (siendo estudiante)
                socket.on('enterToParticipantsToPlayQuestionSectionRoomAsStudent', async (params) => {

                    // Se une a la sala socket de estudiantes que estan participando.
                    socket.join(params.id_class + 'student__participant_to_play_question_section');
                    console.log("+ enterToParticipantsToPlayQuestionSectionRoomAsStudent: ", params.id_class + 'student__participant_to_play_question_section');

                    // Crear el array 'student_participants' si no existe.
                    if (!student_participants_of_a_question[params.id_class]) student_participants_of_a_question[params.id_class] = [];
                    // Agregar el id_socket y el participation_status al objeto user.
                    params.user.id_socket = socket.id;
                    params.user.selected = null;

                    // Hacer push al array de participantes de la clase.
                    let index_participant_exist = student_participants_of_a_question[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                    if (index_participant_exist >= 0) {
                        console.log("YA EXISTE PARTICIPANTE: ", index_participant_exist);
                    } else {
                        student_participants_of_a_question[params.id_class].push(params.user);
                    }



                    // Cambia el estado del estudiante en el array global 'students_in_classrooms'.
                    let index_student = students_in_classrooms[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                    if (index_student >= 0) {
                        students_in_classrooms[params.id_class][index_student].participation_status = 2;
                    }

                    // Emite a los profesores que un estudiante ingreso a la sala? o ingreso a la participación.
                    socket.to(params.id_class + 'teacher__play_question_section')
                        .emit('aStudentHasEntered', {
                            // Necesito los datos del estudiante..
                            new_student_participant: params.user,
                            //id_socket: socket.id
                        });

                    // Indica a todos los estudiantes en la sala de clases que este estudiante decidió participar
                    console.log(" + emite evento a todos los students: ", params.id_class + 'play_question_section');

                    //(params.id_class + 'play-question-section');


                    // Emite a todos los estudiantes que estan dentro de la clase.
                    // Emite a los estudiantes de la sala de clases (se incluye) que desea responder la pregunta.
                    io.sockets.in(params.id_class + 'play-question-section')
                        .emit('studentHasEnteredToTheClassroom', {
                            id_user: params.user.id_user,
                            update_student_status: 2 // Indica que desea participar
                        })



                });


                // params: {id_class, user}
                socket.on('exitToParticipantsToPlayQuestionSectionRoomAsStudent', async (params) => {
                    socket.leave(params.id_class + 'student__participant_to_play_question_section');
                    console.log("exitToParticipantsToPlayQuestionSectionRoomAsStudent: ", params.id_class + 'student__participant_to_play_question_section');

                    console.log("participants: ", student_participants_of_a_question[params.id_class]);

                    // Si esta como participante, quitarlo del array.
                    // + Arreglar esto en el cliente. No debería emitir este evento si nunca participo.
                    if (student_participants_of_a_question[params.id_class]) {
                        let index_student_participant = student_participants_of_a_question[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                        if (index_student_participant >= 0) student_participants_of_a_question[params.id_class].splice(index_student_participant, 1);

                        // Emite a los profesores que un estudiante SALÍO de la sala.
                        socket.to(params.id_class + 'teacher__play_question_section').emit('aStudentHasLeft', {
                            student: params.user
                        });
                    }

                    let index_student = students_in_classrooms[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                    if (index_student >= 0) {
                        students_in_classrooms[params.id_class][index_student].participation_status = 1;
                    }



                    // Emite a los estudiantes de la sala de clases (se incluye) que ha cancelado su participación.
                    io.sockets.in(params.id_class + 'play-question-section')
                        .emit('studentHasEnteredToTheClassroom', {
                            id_user: params.user.id_user,
                            update_student_status: 1 // Indica cancelación.
                        });

                });


                // + Es posible enviar la pregunta iniciada (si es que hay)?
                // Entrar a la sala de clase para responder preguntas (siendo estudiante)
                socket.on('enterToPlayQuestionSectionRoomAsStudent', async (params) => {

                    console.log(" + enterToPlayQuestionSectionRoomAsStudent: ", params.id_class + 'play-question-section');
                    setTimeout(() => {
                        console.log(" + user rooms: ", socket.rooms)
                    }, 2000);
                    // Se une a la sala que indica los estudiantes que estan en la sección de juego (no necesariamente participando en responder).
                    socket.join(params.id_class + 'play-question-section');

                    // Envia pregunta iniciada si es que hay
                    // + Obtener id_course para conocer si hay preguntas iniciadas en el curso
                    const text = `
                    SELECT id_course
                    FROM modules
                    WHERE id_module = $1`;
                    const values = [params.id_module];
                    const id_course = (await pool.query(text, values)).rows[0].id_course;

                    // Obtener las preguntas iniciadas
                    const text2 = `
                    SELECT cq.id_question, cq.status, q.description, q.difficulty 
                    FROM class_question AS cq
                    INNER JOIN questions AS q
                    ON cq.id_question = q.id_question
                    INNER JOIN classes AS c
                    ON cq.id_class = c.id_class
                    INNER JOIN modules AS m
                    ON c.id_module = m.id_module
                    WHERE m.id_course = $1
                    AND (cq.status = 2 OR cq.status = 3)
                    `;
                    const values2 = [id_course];
                    const question = (await pool.query(text2, values2)).rows[0];
                    //console.log("QUESTION WUM: ", question);

                    // Busca si el estudiante 

                    // Emite al mismo estudiante que hay una pregunta iniciada (si es que hay)
                    socket.emit('playingTheClassQuestion', {
                        question: question
                    });

                    // Si no existe el array de estudiantes dentro de la clase, crea el array
                    if (!students_in_classrooms[params.id_class]) students_in_classrooms[params.id_class] = [];
                    // Inserta el id_socket dentro del objeto usuario ya existente
                    params.user.id_socket = socket.id;
                    // Inserta el estado de participación por defecto del estudiante: 1 (esperando)
                    params.user.participation_status = 1;
                    // Inserta el objeto estudiante en el array de estudiantes en clase recién creado
                    students_in_classrooms[params.id_class].push(params.user);



                    // Emite a los estudiantes de la sala de clases (se incluye) 
                    // un nuevo listado de los estudiantes y sus estados (1: en espera, 2: desea responder, 3: )
                    io.sockets.in(params.id_class + 'play-question-section')
                        .emit('studentHasEnteredToTheClassroom',
                            students_in_classrooms[params.id_class]
                        );






                    // Emite a los profesores que un estudiante ingreso a la sala.
                    /*socket.to(params.id_class + 'student__participant_to_play_question_section').emit('aStudentHasEntered', {
                        // Necesito los datos del estudiante..
                        student: params.user
                    });*/
                });

                // Listener: Cuando selecciona a un estudiante para responder la pregunta (profesor).
                // params: { id_class, user}
                socket.on('selectStudentToParticipate', (params) => {
                    console.log(" + selectStudentToParticipate: ", params);

                    // Modifica array global de participantes
                    let index_participant = student_participants_of_a_question[params.id_class].findIndex(participant => participant.id_user == params.user.id_user);
                    if (index_participant >= 0) student_participants_of_a_question[params.id_class][index_participant].selected = true;

                    // Modifica array global de estudiantes en clases
                    let index_student = students_in_classrooms[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                    if (index_student >= 0) students_in_classrooms[params.id_class][index_student].participation_status = 3;

                    // Emite a estudiantes de la sala que uno fue seleccionado
                    socket.to(params.id_class + 'play-question-section').emit('studentSelectedToParticipate', params.user);
                    // Emite a si mismo que un estudiante fue seleccionado para responder
                    socket.emit('aStudentHasEntered', {
                        student_selected: params.user
                    });


                });



                // Estudiante sale de la sala de clases.
                // + params: { id_class, user }
                socket.on('exitToPlayQuestionSectionRoomAsStudent', (params) => {
                    console.log(" + exitToPlayQuestionSectionRoomAsStudent: ", params.id_class + 'play-question-section');
                    setTimeout(() => {
                        console.log(" + user rooms: ", socket.rooms);
                    }, 2000);
                    socket.leave(params.id_class + 'play-question-section');



                    // Si esta como participante, quitarlo del array.
                    // + Arreglar esto en el cliente. No debería emitir este evento si nunca participo.
                    console.log(" + eliminando al estudiante: ", params);
                    if (students_in_classrooms[params.id_class]) {
                        let index_student = students_in_classrooms[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                        if (index_student >= 0) students_in_classrooms[params.id_class].splice(index_student, 1);

                        // Emite a otros estudiante, que el actual salío de la sala.
                        socket.to(params.id_class + 'play-question-section')
                            .emit('studentHasLeftTheClassroom', {
                                // Necesito los datos del estudiante..
                                student: params.user
                            });
                    }
                });

                socket.on('cancelSelectedStudentAsTeacher', (params) => {

                    console.log(" + cancelSelectedStudentAsTeacher: ", params);

                    if (students_in_classrooms[params.id_class]) {
                        let index_participant = student_participants_of_a_question[params.id_class].findIndex(participant => participant.id_user == params.user.id_user);
                        console.log("index participant: ", index_participant);
                        console.log("participant: ", student_participants_of_a_question[params.id_class][index_participant]);
                        if (index_participant >= 0) student_participants_of_a_question[params.id_class][index_participant].selected = false;
                    }

                    if (students_in_classrooms[params.id_class]) {
                        let index_student = students_in_classrooms[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                        if (index_student >= 0) students_in_classrooms[params.id_class][index_student].participation_status = 2;
                    }

                    // Emite al mismo profesor y a todos los compañeros de la sala.
                    socket.emit('aStudentHasEntered', {
                        cancel_student_selected: params.user.id_user
                    });

                    // Emite a estudiantes de la sala de clases.
                    io.sockets.in(params.id_class + 'play-question-section')
                        .emit('studentHasEnteredToTheClassroom',
                            students_in_classrooms[params.id_class]
                        );
                })





                socket.on('closeClass', (data) => {

                });

                socket.on('logout', (data) => {
                    //Obtengo todas la salas del usuario
                    console.log("LOGOUT: ");
                    console.log(socket.rooms);

                    // let rooms = Object.keys(socket.rooms);
                    // console.log(rooms);
                    // rooms = rooms.slice(1);
                    // console.log(rooms);

                    //  rooms.forEach(room => {
                    //      console.log("ROOM: ", room);
                    //      socket.leave(room);
                    //  });

                    //socket.leave('23students');

                    socket.leaveAll();

                    //socket.join(socket.id);
                    setTimeout(() => {
                        console.log("rooms: ", socket.rooms);
                    }, 3000)

                });

                socket.on('disconnectedUser', () => {
                    const index_user = users_connected.findIndex(user => user.id_socket == socket.id);
                    if (index_user >= 0) users_connected.splice(index_user, 1)
                    console.log("disconnectedUser: ", users_connected);
                });


                // Escucha los eventos 'disconnect'
                //this.socket.disconnect(socket); // Función modularizado para escuchar desconnect
                socket.on('disconnect', () => {
                    num_connections--;
                    console.log(` [-] user ip ${socket.handshake.address} has disconnected.\n     connected users: ${num_connections}`);
                    deleteToUsersConnected(socket.id);
                    //socket.emit('usersConnectedHasChanged', getusersConnected());
                });

            })
        } catch (error) {
            console.log(error);
        }

    })();
}





function getuserConnected(id_user) {
    return users_connected.find(user => user.id_user == id_user);
}


function getusersConnectedByRoom(room) {
    return users_connected.filter(user => user.room == room);
}

function addToUsersConnected(user, id_socket) {
    //getCourses(data.id_user, data.role);
    users_connected.push({
        'id_user': user.id_user,
        'role': user.role, 
        'id_socket': id_socket, 
        //'username': user.username,
        //'courses': data_courses
    });

    /*
    detail_users_connected.push({
        'id_user': user.id_user,
        'username': user. username,
        'role': user.role,
    })*/
    //console.log("ADD CONNECTED: ", users_connected);
}

function deleteToUsersConnected(id_socket) {
    users_connected = users_connected.filter(user => user.id_socket != id_socket);
}


// Actualiza los datos de un usuario conectado
// + Puede actualizar {username, role, id_socket, courses}
function updateUserConnected(id_socket, role) {
    user.role = role
    //user.socket_id.push(id_socket);
    //user.courses = data_courses;
    console.log("UPDATE CONNECTED: ", users_connected);
}



function getCourses(id_user, user_role) {
    if (user_role == 1) {
        console.log("ADMIN ROLE...");
    }
    if (user_role == 2) {
        console.log("TEACHER ROLE...");
    } else if (user_role == 3) {
        console.log("STUDENT ROLE...");
    }

}
// ----------------------------------------

module.exports.getSocket = () => {
    return io;
}

module.exports.getusersConnected = () => {
    return users_connected;
}

module.exports.setStudentParticipants = (params) => {
    student_participants_of_a_question[params.id_class] = params.data;
}

module.exports.getStudentParticipants = (id_class) => {
    return student_participants_of_a_question[id_class];
}


// Obtiene 
module.exports.getStudentsInClassroom = (id_class) => {
    return students_in_classrooms[id_class];
}
/*
module.exports = {
    getSocket: () => io,
    getusersConnected,
};*/

//module.exports.getSocket = getSocket;