'use strict'

//LIBS
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require('colors');

//EXTRA IMPORTS
const routes = require('./app/router')
const SERVER_CONFIG = require('./app/config/config_server');

//VARIABLES
var app;
var httpServer;
var io;
var server_port;
var num_connections;
var string_ok;

initWebServer();

function initWebServer() {

    app = express();
    httpServer = http.Server(app);
    io = socket(httpServer);
    server_port = process.env.PORT || SERVER_CONFIG;
    num_connections = 0;
    //string_ok = '\x1b[1;32m[OK]\x1b[0m';

    //CARGA DE MIDDLEWARES
	app.use(cors({ origin: '*' }));
	app.use(bodyParser.urlencoded({ extended: false })); //CONFIGURACIÓN DE BODYPARSER
	app.use(bodyParser.json()); //CONVIERTE LA INFO QUE RECIBA EN PETICIÓN A JSON
    var router = require('./app/router')(app);
    //app.use(routes);

    (async () => {
        try {
            let server = await httpServer.listen(server_port);
            //console.log(`webserver listening on http://localhost:${server_port}... ${string_ok}`);
            console.log(`webserver listening on http://localhost:${server_port}... ${colors.green.bold('[OK]')}`)

            // io.on('connection', (socket) => {

            //     num_connections++;
            //     console.log(`\nuser ip ${socket.handshake.address} has connected...\nconnected users: ${num_connections}`)

            //     socket.on('disconnect', () => {
            //         num_connections--;
            //         console.log(`\nuser disconnected...\nconnected users: ${num_connections}`)
            //     })

            // })
        } catch (err) {
            console.log(err)
        }
    })()
}