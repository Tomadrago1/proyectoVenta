import { app as electronApp, BrowserWindow } from 'electron';
import * as http from 'http';
import express from 'express';

const backendApp = express();
const backendPort = 3001;

backendApp.get('/api', (req, res) => {
  res.json({ message: '¡Backend en funcionamiento!' });
});

// Iniciar el servidor Express (backend)
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

    // Aquí cargamos el frontend de Electron (puede ser una URL local o un archivo HTML)
    win.loadURL('http://localhost:3000');  // Asegúrate de que el frontend esté en http://localhost:3000

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
