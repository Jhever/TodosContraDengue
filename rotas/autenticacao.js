const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // Importar o JWT
const { Pool } = require('pg');
const rota = express.Router();
const dbPool = new Pool(); // Renomeie para evitar confusão

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

// Rota para login
rota.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const result = await dbPool.query('SELECT * FROM usuario1 WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        const usuario = result.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // Criar token JWT
        const token = jwt.sign({ email: usuario.email, tipoUsuario: usuario.tipoUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login bem-sucedido.', token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login.' });
    }
});

// Rota para criação de conta
rota.post('/criar-conta', async (req, res) => {
    const { email, senha, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario, nome } = req.body;

    if (!email || !senha || !telefone || !sexo || !cidade || !bairro || !rua || !numero || !tipoUsuario || !nome) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('E-mail inválido. Use um e-mail válido.');
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        await dbPool.query(
            `INSERT INTO usuario1 (email, senha, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario, nome)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [email, senhaCriptografada, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario, nome]
        );

        res.status(201).send('Conta criada com sucesso.');
    } catch (err) {
        console.error('Erro ao criar conta:', err);
        res.status(500).send('Erro ao criar conta.');
    }
});

// Rota para recuperar senha
rota.post('/recuperar-senha', async (req, res) => {
    const { nome, email } = req.body;

    try {
        const result = await dbPool.query('SELECT * FROM usuario1 WHERE email = $1 AND nome = $2', [email, nome]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const novaSenha = Math.random().toString(36).slice(-8);
        const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

        await dbPool.query('UPDATE usuario1 SET senha = $1 WHERE email = $2', [novaSenhaCriptografada, email]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperação de Senha',
            text: `Sua nova senha é: ${novaSenha}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Nova senha enviada para o e-mail' });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ message: 'Erro ao enviar e-mail' });
    }
});

// Rota para trocar a senha
rota.post('/trocar-senha', authMiddleware, async (req, res) => { // Adiciona o middleware de autenticação
    const { novaSenha } = req.body;
    const email = req.user?.email; // Certifique-se de que o req.user está definido

    if (!email) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
        await dbPool.query('UPDATE usuario1 SET senha = $1 WHERE email = $2', [senhaCriptografada, email]);
        res.json({ message: 'Senha trocada com sucesso.' });
    } catch (err) {
        console.error('Erro ao trocar senha:', err);
        res.status(500).send('Erro ao trocar senha.');
    }
});

// Rota para sair (logout)
rota.get('/sair', (req, res) => {
    res.redirect('./index.html');
});

module.exports = rota;
