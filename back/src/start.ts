import { app as electronApp, BrowserWindow, globalShortcut } from 'electron';
import * as http from 'http';
import express from 'express';

const backendApp = express();
const backendPort = 3001;

backendApp.get('/api', (req, res) => {
  res.json({ message: '¡Backend en funcionamiento!' });
});

const server = http.createServer(backendApp);
server.listen(backendPort, () => {
  console.log(`Servidor Express corriendo en http://localhost:${backendPort}`);
  createElectronWindow();
});

function createElectronWindow() {
  let win: BrowserWindow | null;

  electronApp.whenReady().then(() => {
    win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    win.loadURL('http://localhost:8080');

    globalShortcut.register('F5', () => {
      if (win) {
        win.webContents.reload();
      }
    });
    electronApp.on('before-quit', () => {
      globalShortcut.unregisterAll();
    });

    win.on('closed', () => {
      win = null;
    });
  });

  electronApp.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      electronApp.quit();
    }
  });
}
