module.exports = {
    'production': {
        user: 'fdbdasbdabs',
        host: 'ec2-23-23-23.compute1.amazonaws.com',
        database: 'production_db',
        password: 'process.env.DB_PASSWORD',
        port: 5432
    },
    'development': {
        user: 'postgres', //usuario de la base de datos (postgres es el usuario por defecto de postgres)
        host: 'localhost', //ip del host de la base de datos. ip local es 'localhost' o 127.0.0.1
        database: 'crsoq_db', //nombre de la base de datos
        password: 'admin', //clave del usuario de la base de datos (vacío por defecto en postgres)
        port: 5432 //puerto de la base de datos (5432 es el puerto por defecto en postgres)
    }
}

/*
const database = {
    'production': {
        user: 'fdbdasbdabs',
        host: 'ec2-23-23-23.compute1.amazonaws.com',
        database: 'production_db',
        password: 'process.env.DB_PASSWORD',
        port: 5432
    },
    'development': {
        user: 'postgres', //usuario de la base de datos (postgres es el usuario por defecto de postgres)
        host: 'localhost', //ip del host de la base de datos. ip local es 'localhost' o 127.0.0.1
        database: 'crsoq_db', //nombre de la base de datos
        password: 'admin', //clave del usuario de la base de datos (vacío por defecto en postgres)
        port: 5432 //puerto de la base de datos (5432 es el puerto por defecto en postgres)
    }
}

const SEED = 'app_secret_crosq';

const SERVER_PORT = 3000;
*/