'use strict'

//GLOBAL CONFIG
require('./app/config/config');
//LIBS
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require('colors');
const path = require('path');
//VARIABLES
var app;
var httpServer;
var io;
var num_connections;

initWebServer();

function initWebServer() {

    app = express();
    httpServer = http.Server(app);
    io = socket(httpServer);
    num_connections = 0;

    //CARGA DE MIDDLEWARES
    app.use(cors({
        origin: '*'
    }));
    app.use(bodyParser.urlencoded({
        extended: false
    })); //CONFIGURACIÓN DE BODYPARSER
    app.use(bodyParser.json()); //CONVIERTE LA INFO QUE RECIBA DE PETICIÓN A JSON
    app.use(require('./app/router/index')); //CONFIGURACIÓN GLOBAL DE RUTAS

    (async () => {
        try {
            let server = await httpServer.listen(process.env.PORT);
            console.log(`webserver listening on http://localhost:${process.env.PORT}... ${colors.green.bold('[OK]')}`)

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