const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');

const rota = express.Router();

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }

        req.user = {
            email: decoded.email,
            tipoUsuario: decoded.tipoUsuario,
        };
        next();
    });
};

// Rota para obter todas as perguntas
rota.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM perguntas');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao obter perguntas:', error);
        res.status(500).send('Erro ao obter perguntas.');
    }
});

// Rota para receber perguntas
rota.post('/', authMiddleware, async (req, res) => { // Adiciona o middleware de autenticação
    const { pergunta } = req.body;
    const email = req.user.email;

    if (!pergunta) {
        return res.status(400).send('Pergunta não fornecida');
    }

    try {
        // Verificar tipo de usuário
        const result = await pool.query('SELECT tipoUsuario FROM usuario1 WHERE email = $1', [email]);
        const tipoUsuario = result.rows[0]?.tipoUsuario;

        if (tipoUsuario === 'usuario' || tipoUsuario === 'vigilancia sanitaria') {
            await pool.query('INSERT INTO perguntas (conteudo, usuario_email) VALUES ($1, $2)', [pergunta, email]);
            return res.status(201).send('Pergunta recebida');
        } else {
            return res.status(403).send('Acesso negado.');
        }
    } catch (error) {
        console.error('Erro ao inserir pergunta:', error);
        res.status(500).send('Erro ao receber pergunta');
    }
});

// Rota para responder perguntas (apenas para vigilância sanitária)
rota.post('/responder', authMiddleware, async (req, res) => { // Adiciona o middleware de autenticação
    const { perguntaId, resposta } = req.body;
    const email = req.user.email;

    if (!resposta || !perguntaId) {
        return res.status(400).send('Resposta ou pergunta não fornecida');
    }

    try {
        const result = await pool.query('SELECT tipoUsuario FROM usuario1 WHERE email = $1', [email]);
        const tipoUsuario = result.rows[0]?.tipoUsuario;

        if (tipoUsuario === 'vigilancia sanitaria') {
            await pool.query('INSERT INTO respostas (pergunta_id, conteudo, usuario_email) VALUES ($1, $2, $3)', [perguntaId, resposta, email]);
            return res.status(201).send('Resposta enviada com sucesso.');
        } else {
            return res.status(403).send('Acesso negado.');
        }
    } catch (error) {
        console.error('Erro ao responder pergunta:', error);
        res.status(500).send('Erro ao enviar resposta.');
    }
});

module.exports = rota;
