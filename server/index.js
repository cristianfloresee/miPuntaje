'use strict'

//GLOBAL CONFIG
require('./app/config/config');

// ----------------------------------------
// Load modules
// ----------------------------------------
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require('colors');
const PrettyError = require('pretty-error');
//const path = require('path');
const routes = require('./app/routes/v1');

// ----------------------------------------
// Start HTTP server
// ----------------------------------------
initWebServer();


function initWebServer() {

    let app = express();
    let httpServer = http.Server(app);
    let io = socket(httpServer);
    let pe = new PrettyError();
    pError(pe)
    let num_connections = 0;

    //CARGA DE MIDDLEWARES
    app.use(cors({
        origin: '*'
    }));
    app.use(bodyParser.urlencoded({
        extended: false
    })); //CONFIGURACIÓN DE BODYPARSER
    app.use(bodyParser.json()); //CONVIERTE LA INFO QUE RECIBA DE PETICIÓN A JSON

    // ----------------------------------------
    // Mount api v1 routes /v1
    // ----------------------------------------
    app.use(routes);

    (async () => {
        try {
            let server = await httpServer.listen(process.env.PORT);

            const address = server.address();
            const host = address.address;
            //con
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
        } catch (err) {
            console.log(pe.render(err));
        }

    })()
}

function pError(pe) {
    //pe.skipNodeFiles();
    //pe.skipPackage('express');
    pe.skipPath('internal/process/next_tick.js')
    pe.skipPath('bootstrap_node.js')
}