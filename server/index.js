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
                // + Es mejor usar redis o mongo para mantener este listado.
                socket.on('connectedUser', async (data) => {

                    // Ve si ya existe el usuario (de acuerdo al id_socket)
                    let user_exist = users_connected.find(user => user.id_socket == socket.id);

                    // Si existe, solo actualizo la data (id_user, role)
                    if (user_exist) {
                        user_exist.id_user = data.id_user;
                        user_exist.role = data.role;
                    }
                    // Si el usuario no existe, lo agrego
                    else {
                        addUsersConnected(data, socket.id);
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
                socket.on('updateRoleToUserConnected', (data) => {

                    console.log("updateRoleToUserConnected: ", data);

                    // Ve si ya existe el usuario (de acuerdo al id_socket)
                    const user = users_connected.find(user => user.id_socket == socket.id);
                    if (user) {
                        // Si lo encuentra actualiza su role
                        user.role = data.role;

                        console.log("CHANGE ROLE: ", users_connected);
                    } else {
                        // Aqui la cago porque agrego un usuario sin id_user y porque este evento se ejecuta primero que el connected_user
                        addUsersConnected(data, socket.id);
                    }
                    //socket.emit('usersConnectedHasChanged', getusersConnected());

                });


                socket.on('initClass', (data) => {

                });

                socket.on('closeClass', (data) => {

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
    console.log("ADD CONNECTED: ", users_connected);
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