const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Conexión a MongoDB
mongoose.connect('mongodb://localhost/mi-plataforma-juegos')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Aquí definirías tus modelos (ej. Usuario, Partida, Mision) y tus rutas de API.

// Manejo de WebSockets para la comunicación en tiempo real
wss.on('connection', ws => {
  console.log('Cliente conectado');

  ws.on('message', message => {
    const data = JSON.parse(message);
    console.log('Mensaje recibido:', data);

    // Aquí iría la lógica del juego
    // Por ejemplo, si el mensaje es un movimiento de ajedrez o una carta de UNO
    // wss.clients.forEach(client => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(JSON.stringify(data)); // Enviar a otros jugadores
    //   }
    // });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
