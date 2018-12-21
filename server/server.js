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
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require('colors');
const _routes = require('./app/routes/v1');
const _error = require('./app/middlewares/error');
const pool = require('./app/database');

//const serveIndex = require('serve-index');

// ----------------------------------------
// Variables que pueden ser exportadas
// ----------------------------------------
let io;
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
    let num_connections = 0;


    //app.use(express.static('uploads '));
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    //app.use(express.static(path.resolve(__dirname, '../public'), { 'dotfiles': 'allow' }));
    app.use(cors({
        origin: '*'
    }));
    app.use(eValidator());

    // ----------------------------------------
    // Mount API Routes /v1
    // ----------------------------------------
    app.use(_routes);
    // app.use(express.static(__dirname + '/'));
    // app.use('/uploads', serveIndex(__dirname + '/uploads'));
    app.use(_error.logErrors);
    app.use(_error.handler);

    (async () => {
        try {
            let server = await httpServer.listen(process.env.PORT);

            const address = server.address();
            const host = address.address;
            const port = address.port;

            users_connected = []; // {id_user, username, role, socketId, courses }

            console.log(` [+] webserver is running on ${host}${port}... ${colors.green.bold('[OK]')}`)

            io.on('connection', (socket) => {

                num_connections++;
                console.log(`\nuser ip ${socket.handshake.address} has connected...\nconnected users: ${num_connections}`)


                // Permite mantener un listado de usuarios junto a sus cursos. (es mejor usar redis o mongo)
                socket.on('connectedUser', async (data) => {
                    console.log("connectedUser listened: ", data);

                    // Ver por siacaso si ya existe el user socket
                    let user_exist = users_connected.find(user => user.id_socket == socket.id);
                    // Si existe solo actualizo la data:
                    

                    if(user_exist) {
                        user_exist.id_user = data.id_user;
                        user_exist.role = data.role;
                    }
                    else{
                        // Aqui la cago porque agrego un usuario sin id_user y porque este evento se ejecuta primero que el connected_user
                        addUsersConnected(data, socket.id);
                    }
                    // Ver si ya existe el usuario
                    //let user_exist = detail_users_connected.find(user => user.id_user == data.id_user);

                    //console.log("USER EXIST: ", user_exist);
                    // Agrego al usuario a la lista de usuarios conectados (pueden haber 2 sesiones para el mismo usuario)
                    //addUsersConnected(data, socket.id);
                    // Si el usuario ya tenia una sesión, ...
                    //if (!user_exist) updateUserConnected(user_exist, socket.id);




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

                // data: {id_user, role}
                socket.on('updateRoleToUserConnected', (data) => {
                    
                    console.log("updateRoleToUserConnected: ", data);
                    ///updateUserConnected(socket.id, data)
                    // Busca al usuario socket dentro de 'users_connected'
                    let user_exist = users_connected.find(user => user.id_socket == socket.id);
                    if(user_exist) {
                        // Si lo encuentra actualiza su role
                        user_exist.role = data.role;
                        
                        console.log("CHANGE ROLE: ", users_connected);
                    }
                    else{
                        // Aqui la cago porque agrego un usuario sin id_user y porque este evento se ejecuta primero que el connected_user
                        addUsersConnected(data, socket.id);
                    }

                });


                socket.on('initClass', (data) => {

                });

                socket.on('closeClass', (data) => {

                });




                // Escucha los eventos 'disconnect'
                //this.socket.disconnect(socket); // Función modularizado para escuchar desconnect
                socket.on('disconnect', () => {
                    num_connections--;
                    console.log(`\nuser disconnected...\nconnected users: ${num_connections}`);
                    deleteUserConnected(socket.id)
                })

            })
        } catch (error) {
            console.log(error);
        }

    })()
}

function getSocket() {
    return io;
}

function getusersConnected() {
    return users_connected;
}

function getuserConnected(id_user) {
    return users_connected.find(user => user.id_user == id_user);
}

function getusersConnectedByRoom(room) {
    return users_connected.filter(user => user.room == room);
}

function addUsersConnected(user, id_socket) {
    console.log("FUNCTION addUsersConnected---");
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
    }
    else if (user_role == 3) {
        console.log("STUDENT ROLE...");
    }

}

module.exports = {
    getSocket,
    getusersConnected,
};