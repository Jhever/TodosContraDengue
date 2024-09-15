async function registerProtocols() {
    try {
      await protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);
    } catch (error) {
      console.error('Erro ao registrar os protocolos:', error);
    }
  }
  
// db.js
const { Pool } = require('pg');

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
    user: 'postgres',        // Usuário do PostgreSQL
    host: 'localhost',          // Host do PostgreSQL
    database: 'postgres', // Nome do banco de dados
    password: 'postgres',      // Senha do usuário
    port: 5432,                 // Porta padrão do PostgreSQL
});

module.exports = pool;
