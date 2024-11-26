"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const backendApp = (0, express_1.default)();
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
    let win;
    electron_1.app.whenReady().then(() => {
        win = new electron_1.BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
        });
        // Aquí cargamos el frontend de Electron (puede ser una URL local o un archivo HTML)
        win.loadURL('http://localhost:3000'); // Asegúrate de que el frontend esté en http://localhost:3000
        win.on('closed', () => {
            win = null;
        });
    });
    electron_1.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
}