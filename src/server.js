const express = require('express');
const path = require('path');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const perguntas = [];
require('dotenv').config();

const app = express();
const PORT = 3000;

// Use CORS middleware
app.use(cors());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.json());

// Testando a conexão com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err.stack);
    }
    console.log('Conectado ao banco de dados');
    release();  // Libera o client após o teste de conexão
});

// Rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Tentativa de login:', email); // Log para depuração
    
    try {
        const result = await pool.query('SELECT * FROM usuario1 WHERE email = $1', [email]);

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

    if (!email.includes('')) {
        return res.status(400).send('E-mail inválido. Use um e-mail válido.');
    }    

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await pool.query(
            `INSERT INTO usuario1 (email, senha, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario)
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
        const result = await pool.query('SELECT * FROM usuario1 WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        const novaSenha = Math.random().toString(36).slice(-8);
        const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

        await pool.query('UPDATE usuario1 SET senha = $1 WHERE email = $2', [novaSenhaCriptografada, email]);

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

// Rota para a página inicial
app.get('/pagina_inicial', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pagina_inicial.html'));
});

// Rota para sair (logout)
app.get('/sair', (req, res) => {
    // Lógica para encerrar a sessão do usuário
    res.redirect('/index.html');
});

// Rota para obter todas as perguntas
app.get('/perguntas', (req, res) => {
    res.json(perguntas);
});

// Rota para receber perguntas
app.post('/perguntas', (req, res) => {
    const { pergunta } = req.body;
    if (pergunta) {
        perguntas.push({ pergunta });
        res.status(201).send('Pergunta recebida');
    } else {
        res.status(400).send('Pergunta não fornecida');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
