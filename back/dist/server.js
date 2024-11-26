"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
// Middleware para manejar el JSON
app.use(express_1.default.json());
// Ruta de ejemplo
app.get('/', (req, res) => {
    res.send('¡Hola Mundo! El servidor Express está corriendo en el puerto 3000.');
});
// Ruta para comprobar si el servidor está funcionando
app.get('/api', (req, res) => {
    res.json({ message: "API funcionando correctamente." });
});
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
