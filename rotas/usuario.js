const express = require('express');
const pool = require('../db');
const rota = express.Router();
const jwt = require('jsonwebtoken');

// Middleware de autenticação
const autenticar = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }
        req.user = user; // Armazena os dados do usuário no request
        next(); // Passa para o próximo middleware ou rota
    });
};

// Rota para obter dados do usuário
rota.get('/dados-usuario', autenticar, async (req, res) => {
    const email = req.user?.email;

    if (!email) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const result = await pool.query('SELECT * FROM usuario1 WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        res.status(500).send('Erro ao buscar dados do usuário.');
    }
});


// Rota para atualizar perfil
rota.post('/atualizar-perfil', autenticar, async (req, res) => {
    const email = req.user?.email; // Obtenha o e-mail do usuário autenticado
    const { nome, telefone, sexo, cidade, bairro, rua, numero } = req.body;

    if (!email) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const result = await pool.query(
            `UPDATE usuario1 
            SET nome = $1, telefone = $2, sexo = $3, cidade = $4, bairro = $5, rua = $6, numero = $7 
            WHERE email = $8`,
            [nome, telefone, sexo, cidade, bairro, rua, numero, email]
        );

        if (result.rowCount > 0) {
            res.json({ message: 'Perfil atualizado com sucesso!' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        res.status(500).json({ message: 'Erro ao atualizar perfil.' });
    }
});

module.exports = rota; // Exporta as rotas para uso em outras partes do aplicativo
