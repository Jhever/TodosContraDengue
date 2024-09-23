const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./src/server'); // Importar o servidor

let mainWindow;

function createWindow() {
    // Cria a janela do Electron
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // Permitir integração Node.js
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js') // Preload opcional
        }
    });

    // Carrega a interface (tela de login)
    mainWindow.loadFile('public/index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// Quando o Electron estiver pronto, iniciar a interface
app.whenReady().then(() => {
    createWindow();

    // Iniciar o servidor Express dentro do Electron
    server.listen(3000, () => {
        console.log('Servidor Express rodando na porta 3000');
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
