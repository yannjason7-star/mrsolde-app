const { contextBridge, ipcRenderer } = require('electron');

// Désactiver les avertissements de sécurité
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

contextBridge.exposeInMainWorld('electronAPI', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development'
});