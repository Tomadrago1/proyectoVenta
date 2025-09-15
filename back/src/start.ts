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
});
