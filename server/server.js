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
const routes = require('./app/routes/v1');

// ----------------------------------------
// Start HTTP server
// ----------------------------------------
initWebServer();

// ----------------------------------------
// Middleware Log Errors
// ----------------------------------------
// function logErrors(err, req, res, next) {
//     console.error(err.stack);
//     next(err);
// }

// ----------------------------------------
// Middleware HTTP Error Handler:
// - Send Stacktrace only during Development.
// ----------------------------------------
// function errorHandler(error, req, res, next) {
//     res.status(error.status | 500);
//     res.json({
//         message: error.message,
//         stack: process.env.NODE_ENV === 'development' ? error.stack : {}
//     });
// }

// ----------------------------------------
// Init Web Server
// ----------------------------------------
function initWebServer() {

    let app = express();
    let httpServer = http.Server(app);
    let io = socket(httpServer);
    let num_connections = 0;

    
    //app.use(express.static('uploads '));
    app.use(bodyParser.urlencoded({
        extended: false
    })); //CONFIGURACIÓN DE BODYPARSER
    app.use(bodyParser.json()); //CONVIERTE LA INFO QUE RECIBA DE PETICIÓN A JSON
    app.use(cors({
        origin: '*'
    }));
    app.use(eValidator());

    // if (process.env.NODE_ENV === 'development') {
    // only use in development
    //     app.use(errorhandler({log: errorNotification}))
    //   }


    // ----------------------------------------
    // Mount API v1 routes /v1
    // ----------------------------------------
    app.use(routes);
    // app.use((req, res, next) => {
    //     const error = new Error("Not found");
    //     error.status = 404;
    //     next(error);
    // });
    //app.use(logErrors);
    //app.use(errorHandler);

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

                socket.on('disconnect', () => {
                    num_connections--;
                    console.log(`\nuser disconnected...\nconnected users: ${num_connections}`)
                })

            })
        } catch (error) {
            console.log(err);
        }

    })()
}