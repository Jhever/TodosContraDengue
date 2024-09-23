const express = require('express');
const path = require('path');
const pool = require('./db');
const cors = require('cors');
const multer = require('multer');
// const jwt = require('jsonwebtoken'); // Importando JWT
require('dotenv').config();
const autenticar = require('./autenticar');
const autenticacao = require ('./autenticacao');


const autenticacaoRoutes = require('./rotas/autenticacao.js'); 
const usuarioRoutes = require('./rotas/usuario');
const perguntaRoutes = require('./rotas/perguntas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(autenticacao);

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Testando a conexão com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err.stack);
    }
    console.log('Conectado ao banco de dados');
    release();
});

// Middleware para verificar o token JWT
// const verificaToken = (req, res, next) => {
//     const token = req.headers['autenticacao'];
//     if (!token) {
//         return res.status(401).json({ message: 'Token não fornecido.' });
//     }

//     jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
//         if (err) {
//             return res.status(403).json({ message: 'Token inválido.' });
//         }
//         req.user = user; // Populando o usuário autenticado no req
//         next();
//     });
// };

// Rotas
app.use('/autenticacao', autenticacaoRoutes);
app.use('/usuarios', autenticar, usuarioRoutes);
app.use('/perguntas', perguntaRoutes);

// Rota para a página inicial
app.get('/pagina_inicial', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pagina_inicial.html'));
});

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

app.post('/upload-foto', upload.single('foto'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem enviada');
    }
    res.status(200).send('Upload realizado com sucesso!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
