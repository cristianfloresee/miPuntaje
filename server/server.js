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


//const serveIndex = require('serve-index');

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
    let io = socket(httpServer);
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