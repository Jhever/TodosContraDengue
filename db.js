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

// Função para atualizar o perfil
const atualizarPerfil = async (email, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario, nome) => {
  const query = `
      UPDATE usuario1 SET 
          telefone = $1,
          sexo = $2,
          cidade = $3,
          bairro = $4,
          rua = $5,
          numero = $6,
          tipoUsuario = $7,
          nome = $8
      WHERE email = $9
  `;
  const values = [telefone, sexo, cidade, bairro, rua, numero, tipoUsuario, nome, email];

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

module.exports = pool;

