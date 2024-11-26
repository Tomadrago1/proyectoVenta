"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:8080'
}));
const producto_routes_1 = require("./routes/producto.routes");
app.use((0, express_session_1.default)({
    secret: 'juamaqbrujan', // Cambia esta clave por una más segura en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Cambiar a true si usas HTTPS
}));
app.use('/api/producto', producto_routes_1.routerProducto);
app.use(express_1.default.static(path_1.default.join(__dirname, 'dist')));
app.get('/', (req, res) => {
    res.send('¡Hola Mundo! El servidor Express está corriendo en el puerto 3000.');
});
app.get('/api', (req, res) => {
    res.json({ message: "API funcionando correctamente." });
});
app.get('/home', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'dist', 'index.html'));
});
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
