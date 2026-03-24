"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const conn_1 = require("./shared/conn");
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3000);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:8080',
}));
const producto_routes_1 = require("./routes/producto.routes");
const usuario_routes_1 = require("./routes/usuario.routes");
const venta_routes_1 = require("./routes/venta.routes");
const detalleVenta_routes_1 = require("./routes/detalleVenta.routes");
const categoria_routes_1 = require("./routes/categoria.routes");
const impresora_routes_1 = require("./routes/impresora.routes");
app.use((0, express_session_1.default)({
    secret: 'juamaqbrujan',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));
app.use('/api/producto', producto_routes_1.routerProducto);
app.use('/api/usuario', usuario_routes_1.routerUsuario);
app.use('/api/venta', venta_routes_1.routerVenta);
app.use('/api/detalle-venta', detalleVenta_routes_1.routerDetalleVenta);
app.use('/api/categoria', categoria_routes_1.routerCategoria);
app.use('/api/impresora', impresora_routes_1.routerImpresora);
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
const setupGracefulShutdown = (server) => {
    let isShuttingDown = false;
    const shutdown = async (signal) => {
        if (isShuttingDown)
            return;
        isShuttingDown = true;
        console.log(`Recibida senal ${signal}. Cerrando servidor...`);
        server.close(async () => {
            try {
                await conn_1.pool.end();
                console.log('Pool de MySQL cerrado correctamente.');
                process.exit(0);
            }
            catch (error) {
                console.error('Error cerrando el pool de MySQL:', error);
                process.exit(1);
            }
        });
        setTimeout(() => {
            console.error('Cierre forzado por timeout.');
            process.exit(1);
        }, 10000).unref();
    };
    process.on('SIGINT', () => {
        void shutdown('SIGINT');
    });
    process.on('SIGTERM', () => {
        void shutdown('SIGTERM');
    });
};
const bootstrap = async () => {
    try {
        await conn_1.pool.query('SELECT 1');
        console.log('Conexion a base de datos verificada.');
        const server = app.listen(port, () => {
            console.log(`Servidor Express corriendo en http://localhost:${port}`);
        });
        setupGracefulShutdown(server);
    }
    catch (error) {
        console.error('No se pudo iniciar el servidor por error de base de datos:', error);
        process.exit(1);
    }
};
void bootstrap();
