const express = require('express');
const path = require('path');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Use CORS middleware
app.use(cors());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());

// Rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).send('Acesso Negado, Senha ou e-mail inválido');
        }

        const user = result.rows[0];
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).send('Acesso Negado, Senha ou e-mail inválido');
        }

        res.status(200).send('Login bem-sucedido');
    } catch (err) {
        res.status(500).send('Erro no servidor');
    }
});

// Rota para criação de conta
app.post('/criar-conta', async (req, res) => {
    const { email, senha, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario } = req.body;

    if (!email || !senha || !telefone || !sexo || !cidade || !bairro || !rua || !numero || !tipoUsuario) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    if (!email.includes('@gmail.com')) {
        return res.status(400).send('E-mail inválido. Use um e-mail válido.');
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await pool.query(
            `INSERT INTO usuarios (email, senha, telefone, sexo, cidade, bairro, rua, numero, tipo_usuario)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [email, senhaCriptografada, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario]
        );

        res.status(201).send('Conta criada com sucesso.');
    } catch (err) {
        console.error('Erro ao criar conta:', err);
        res.status(500).send('Erro ao criar conta.');
    }
});

// Rota para recuperação de senha
app.post('/recuperar-senha', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        const novaSenha = Math.random().toString(36).slice(-8);
        const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

        await pool.query('UPDATE usuarios SET senha = $1 WHERE email = $2', [novaSenhaCriptografada, email]);

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperação de Senha',
            text: `Sua nova senha é: ${novaSenha}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send('Erro ao enviar e-mail');
            }
            res.status(200).send('Nova senha enviada para o e-mail');
        });
    } catch (err) {
        res.status(500).send('Erro ao recuperar senha');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
