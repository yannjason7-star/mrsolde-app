const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');

// Fichier de log
const logFile = path.join(app.getPath('userData'), 'app.log');
function log(message) {
  const entry = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(logFile, entry);
  console.log(message);
}

let mainWindow;
let server;

function startServer() {
  let staticPath;
  if (app.isPackaged) {
    staticPath = path.join(process.resourcesPath, 'app.asar', 'out');
  } else {
    staticPath = path.join(__dirname, '../out');
  }
  log(`Dossier statique : ${staticPath}`);
  
  const expressApp = express();
  expressApp.use(express.static(staticPath));
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  server = expressApp.listen(3000, () => {
    log('Serveur Express démarré sur http://localhost:3000');
  });
}

function createWindow() {
  log('Création de la fenêtre');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false, // On montrera après chargement
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.once('ready-to-show', () => {
    log('Fenêtre prête');
    mainWindow.show();
    mainWindow.maximize();
  });
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Erreur de chargement : ${errorDescription}`);
  });
}

app.whenReady().then(() => {
  log('App prête');
  startServer();
  // Attendre que le serveur soit démarré
  setTimeout(() => {
    createWindow();
  }, 1500);
});

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') app.quit();
});