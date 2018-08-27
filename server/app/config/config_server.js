const SERVER_PORT = 3000;
module.exports = SERVER_PORT;

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
process.env.TOKEN_EXPIRATION = 60 * 60 * 24 * 30;

// ============================
// SEED de Autenticación
// ============================
process.env.SEED = process.env.SEED || 'app-secret-seed';