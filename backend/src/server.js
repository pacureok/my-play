const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const UnoGame = require('./models/UnoGame');
const { createDeck, dealCards } = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://localhost/mi-plataforma-juegos')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

wss.on('connection', ws => {
  console.log('Cliente conectado');

  ws.on('message', async message => {
    const data = JSON.parse(message);

    if (data.type === 'JOIN_GAME') {
      let game = await UnoGame.findOne({ gameId: data.gameId });

      if (!game) {
        console.log(`Creando nueva partida: ${data.gameId}`);
        const newDeck = createDeck();
        const hands = dealCards(newDeck, 2); // Repartimos 7 cartas a 2 jugadores

        game = new UnoGame({
          gameId: data.gameId,
          players: [
            { username: 'Jugador 1', hand: hands[0] },
            { username: 'Jugador 2', hand: hands[1] }
          ],
          turn: 'Jugador 1',
          deck: newDeck,
          discardPile: [newDeck.pop()] // La primera carta en la pila de descarte
        });
        await game.save();
      }

      // Enviar el estado del juego al jugador que se acaba de conectar
      const playerHand = game.players.find(p => p.username === 'Jugador 1').hand;
      const gameState = {
        gameId: game.gameId,
        currentCard: game.discardPile[game.discardPile.length - 1],
        turn: game.turn,
        playerHand: playerHand,
      };

      ws.send(JSON.stringify(gameState));
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
