/**
 * ¿Dónde almacenar la lista de usuarios conectados? (actualmente en una variable en el server):
 * ---------------------------------------------------------------------------------------------
 * 1_ Redis podría ser una buena opción. Te comento una solución que me tocó por ejemplo con arq de microservicios, primero hicimos un array en memoria con los sockets pero almacenamos 
 * un objeto por usuario con todos los sockets clientes abiertos por cada usuario en ese objeto, con eso bajamos el tamaño y manejamos la comunicación con sockets abiertos etc... 
 * pero los limites son evidentes y para escalar usamos un redis aunque un mongo tranquilamente puede andar bien.
 * 
 * 2_ Lo que yo hago por cada nuevo usuario conectado lo registro en mongodb es mas facil hacer las consultas, cuando se desconecta elimino el usuario.
 */
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
const _routes = require('./app/routes/v1');
const _error = require('./app/middlewares/error');
const pool = require('./app/database');

// ----------------------------------------
// Variables que pueden ser exportadas
// ----------------------------------------
var io;
let users_connected = []; // {id_user, id_socket, role}
let detail_users_connected = []; //{id_user, username, role, courses}
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
    //console.log("io: ", io)
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
                console.log(`\nuser ip ${socket.handshake.address} has connected...\nconnected users: ${num_connections}`)

                // Permite mantener un listado de usuarios junto a sus cursos. 
                // + Es mejor usar redis para mantener este listado.
                socket.on('connectedUser', async (data) => {
                    console.log(" socket.on(onlineUser): ", data);
                    // Ve si ya existe el usuario (de acuerdo al id_socket)
                    let user_exist = users_connected.find(user => user.id_socket == socket.id);

                    // Comprueba si la sesión existe (mismo id_socket y id_user)
                    const repeated_session = users_connected.find(user => {
                        return (user.id_socket == socket.id && user.id_user == data.id_user)
                    });




                    // Si existe, actualiza la data (id_user, role)
                    if (user_exist) {
                        console.log(" + user exist.");
                        console.log(` + update data (id_user, role).\n`)
                        user_exist.id_user = data.id_user;
                        user_exist.role = data.role;
                    }
                    // Si el usuario no existe, lo agrego (id_socket, id_user, role)
                    else {
                        addUsersConnected(data, socket.id);
                    }

                    console.log("DATA ROLE: ", data.role);
                    // Si el role del usuario es estudiante
                    if (data.role == 3) {
                        const text = `SELECT id_course
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
                        addUsersConnected(data, socket.id);
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



                // Entrar y salir de la sección de juego de la pregunta de clase
                socket.on('enterToPlayQuestionSectionRoomAsTeacher', async (params) => {
                    socket.join(params.id_class + 'teacher__play_question_section');
                    console.log("enterToPlayQuestionSectionRoomAsTeacher: ", params.id_class + 'teacher__play_question_section');

                    // Emite un evento con los estudiantes que esten en la sala.
                    // + Para eso debe haber un array con los estudiantes que estan en la sala.
                    //student_participants_of_a_question[params.id_class].push();
                    // 

                    //socket.emit('aStudentHasEntered', student_participants_of_a_question[params.id_class]);
                    socket.emit('aStudentHasEntered', student_participants_of_a_question[params.id_class]);
                });

                socket.on('exitToPlayQuestionSectionRoomAsTeacher', (params) => {
                    console.log("exitToPlayQuestionSectionRoomAsTeacher: ", params.id_class + 'teacher__play_question_section');
                    socket.leave(params.id_class + 'teacher__play_question_section');
                });


                // Entrar al conjunto de participantes por responder preguntas de la clase (siendo estudiante)
                socket.on('enterToParticipantsToPlayQuestionSectionRoomAsStudent', async (params) => {
                    socket.join(params.id_class + 'student__participant_to_play_question_section');
                    console.log("+ enterToParticipantsToPlayQuestionSectionRoomAsStudent: ", params.id_class + 'student__participant_to_play_question_section');

                    // Crear el array si no existe y hacer push
                    if (!student_participants_of_a_question[params.id_class]) student_participants_of_a_question[params.id_class] = [];
                    params.user.id_socket = socket.id;
                    student_participants_of_a_question[params.id_class].push(params.user);
                    console.log("****** CORAJE: ", student_participants_of_a_question);

                    // Emite a los profesores que un estudiante ingreso a la sala.
                    socket.to(params.id_class + 'teacher__play_question_section').emit('aStudentHasEntered', {
                        // Necesito los datos del estudiante..
                        student: params.user,
                        //id_socket: socket.id
                    });


                });


                socket.on('exitToParticipantsToPlayQuestionSectionRoomAsStudent', async (params) => {
                    socket.leave(params.id_class + 'student__participant_to_play_question_section');
                    console.log("exitToParticipantsToPlayQuestionSectionRoomAsStudent: ", params.id_class + 'student__participant_to_play_question_section');

                    console.log("participants: ", student_participants_of_a_question[params.id_class]);
                    let index_student_participant = student_participants_of_a_question[params.id_class].findIndex(student => student.id_user == params.user.id_user);
                    if (index_student_participant >= 0) student_participants_of_a_question[params.id_class].splice(index_student_participant, 1);

                    // Emite a los profesores que un estudiante SALÍO de la sala.
                    socket.to(params.id_class + 'teacher__play_question_section').emit('aStudentHasLeft', {
                        // Necesito los datos del estudiante..
                        student: params.user
                    });
                });


                // + Es posible enviar la pregunta iniciada (si es que hay)?
                // Entrar a la sala de la clase para responder preguntas (siendo estudiante)
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

                    // Emite a otros estudiantes que hay una pregunta iniciada (si es que hay)??? a otros o a el mismo?
                    socket.emit('playingTheClassQuestion', {
                        question: question
                    });

                     // Si no existe el array de estudiantes dentro de la clase, crea el array
                     if (!students_in_classrooms[params.id_class]) students_in_classrooms[params.id_class] = [];
                     // Inserta el id_socket dentro del objeto usuario ya existente
                     params.user.id_socket = socket.id;
                     // Inserta el objeto estudiante en el array de estudiantes en clase recién creado
                     students_in_classrooms[params.id_class].push(params.user);
 
                     console.log("Emite evento de ingreso de estudiante a la sala...");
                     // Emite a otros estudiantes que ingreso a la sala.
                     setTimeout(()=>{
                        socket.to(params.id_class + 'play-question-section').emit('studentHasEnteredToTheClassroom', {
                            student: params.user,
                            //id_socket: socket.id
                        });
                     }, 3000)
                     




                    // Emite a los profesores que un estudiante ingreso a la sala.
                    /*socket.to(params.id_class + 'student__participant_to_play_question_section').emit('aStudentHasEntered', {
                        // Necesito los datos del estudiante..
                        student: params.user
                    });*/
                });

                socket.on('selectStudentToParticipate', (params) => {
                    console.log(" + selectStudentToParticipate: ", params);
                    socket.emit(params.id_socket)
                    socket.to(params.id_socket).emit('studentSelectedToParticipate', );
                });

                socket.on('exitToPlayQuestionSectionRoomAsStudent', (params) => {
                    console.log(" + exitToPlayQuestionSectionRoomAsStudent: ", params.id_class + 'play-question-section');
                    setTimeout(() => {
                        console.log(" + user rooms: ", socket.rooms);
                    }, 2000);
                    socket.leave(params.id_class + 'play-question-section');
                });






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
                    console.log(`\nuser disconnected...\nconnected users: ${num_connections}`);
                    deleteUserConnected(socket.id);
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

function addUsersConnected(user, id_socket) {
    //getCourses(data.id_user, data.role);
    users_connected.push({
        'id_user': user.id_user,
        //'username': user.username,
        'role': user.role, // array de roles
        'id_socket': id_socket, // array de sockets
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

// Actualiza los datos de un usuario conectado
// + Puede actualizar {username, role, id_socket, courses}
function updateUserConnected(id_socket, role) {
    user.role = role
    //user.socket_id.push(id_socket);
    //user.courses = data_courses;
    console.log("UPDATE CONNECTED: ", users_connected);
}

function deleteUserConnected(id_socket) {
    users_connected = users_connected.filter(user => user.id_socket != id_socket);
    console.log("DELETE CONNECTED: ", users_connected);
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

/*
module.exports = {
    getSocket: () => io,
    getusersConnected,
};*/

//module.exports.getSocket = getSocket;