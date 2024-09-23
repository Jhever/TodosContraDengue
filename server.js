const express = require('express');
const path = require('path');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const perguntas = [];
require('dotenv').config();
const multer = require('multer')

const app = express();
const PORT = 3000;

// Use CORS middleware
app.use(cors());
v 
// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Testando a conexão com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err.stack);
    }
    console.log('Conectado ao banco de dados');
    release();  // Libera o client após o teste de conexão
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Verifica se o usuário existe
        const result = await pool.query('SELECT * FROM usuario1 WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        const usuario = result.rows[0];

        // Verifica a senha
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // Se o login for bem-sucedido, você pode enviar uma resposta positiva
        res.status(200).json({ message: 'Login bem-sucedido.' });

        // Aqui você pode adicionar lógica para gerenciar a sessão do usuário, se necessário

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login.' });
    }
});


// Rota para criação de conta
app.post('/criar-conta', async (req, res) => {
    const {email, senha, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario, nome } = req.body;

    if (!email || !senha || !telefone || !sexo || !cidade || !bairro || !rua || !numero || !tipoUsuario || !nome ) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('E-mail inválido. Use um e-mail válido.');
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        
        // Log dos dados recebidos
        console.log({email, senhaCriptografada, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario, nome });

        await pool.query(
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

        // Criar o transporter aqui
        const transporter = nodemailer.createTransport({
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

        await transporter.sendMail(mailOptions);
        res.status(200).send('Nova senha enviada para o e-mail');

    } catch (err) {
        console.error('Erro ao recuperar senha:', err);
        res.status(500).send('Erro ao recuperar senha');
    }
});

// Rota para a página inicial
app.get('/pagina_inicial', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pagina_inicial.html'));
});


// Rota para obter dados do usuário
app.get('/dados-usuario', async (req, res) => {
    const email = req.user.email;

    try {
        const result = await pool.query('SELECT * FROM usuario1 WHERE email = $1', [email]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        res.status(500).send('Erro ao buscar dados do usuário.');
    }
});

// Configuração do armazenamento do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pasta onde as fotos serão armazenadas
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome único para cada arquivo
    }
});

const upload = multer({ storage });

// Middleware para receber JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos (opcional)
app.use(express.static('uploads'));

app.post('/upload-foto', upload.single('foto'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nenhuma foto foi enviada.' });
    }
    res.json({ message: 'Foto enviada com sucesso!', filePath: req.file.path });
});


// Rota para trocar a senha
app.post('/trocar-senha', async (req, res) => {
    const { novaSenha } = req.body;

    // Aqui você deve obter o usuário logado
    const email = req.user.email; // Exemplo, ajuste conforme sua lógica

    try {
        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
        await pool.query('UPDATE usuario1 SET senha = $1 WHERE email = $2', [senhaCriptografada, email]);
        res.json({ message: 'Senha trocada com sucesso.' });
    } catch (err) {
        console.error('Erro ao trocar senha:', err);
        res.status(500).send('Erro ao trocar senha.');
    }
});

// Rota para sair (logout)
app.get('/sair', (req, res) => {
    // Lógica para encerrar a sessão do usuário
    res.redirect('./index.html');
});

// Rota para obter todas as perguntas
app.get('/perguntas', (req, res) => {
    res.json(perguntas);
});

// Rota para receber perguntas
app.post('/perguntas', async (req, res) => {
    const { pergunta } = req.body;

    if (!pergunta) {
        return res.status(400).send('Pergunta não fornecida');
    }

    try {
        // Insere a pergunta no banco de dados
        await pool.query('INSERT INTO perguntas (conteudo) VALUES ($1)', [pergunta]);
        res.status(201).send('Pergunta recebida');
    } catch (error) {
        console.error('Erro ao inserir pergunta:', error);
        res.status(500).send('Erro ao receber pergunta');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
