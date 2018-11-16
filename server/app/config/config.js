// ============================
// Puerto del Servidor
// ============================
process.env.PORT = process.env.PORT || 3000;

// ============================
// Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
// Vencimiento del Token
// ============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
process.env.TOKEN_EXPIRATION = 60 * 60 * 24 * 30;

// ============================
// SEED de Autenticación
// ============================
process.env.SEED = process.env.SEED || 'app-secret-seed';

// ============================
//  Base de Datos
// ============================
// + user: usuario de la base de datos (postgres es el usuario por defecto de postgres)
// + host: ip del host de la base de datos. ip local es 'localhost' o 127.0.0.1
// + database: nombre de la base de datos
// + password: clave del usuario de la base de datos (vacío por defecto en postgres)
// + port: puerto de la base de datos (5432 puerto por defecto en postgres)
const database = {
    'production': {
        user: 'fdbdasbdabs',
        host: 'ec2-23-23-23.compute1.amazonaws.com',
        database: 'production_db',
        password: 'process.env.DB_PASSWORD',
        port: 5432
    },
    'development': {
        user: 'postgres', 
        host: 'localhost', 
        database: 'crsoq_db', 
        password: 'admin', 
        port: 5432
    }
}
module.exports = database[process.env.NODE_ENV] || database['development'];
