const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const UnoGame = require('./models/UnoGame');
const { createDeck, dealCards, isValidPlay, applySpecialCardEffect } = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://localhost/mi-plataforma-juegos')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Mapa para gestionar los WebSockets por partida
const gameSockets = new Map();

wss.on('connection', ws => {
  ws.on('message', async message => {
    const data = JSON.parse(message);
    const { type, gameId, username, card } = data;

    if (type === 'JOIN_GAME') {
      let game = await UnoGame.findOne({ gameId });
      let playerIndex;

      if (!game) {
        // Lógica de inicio de juego
        const newDeck = createDeck();
        const hands = dealCards(newDeck, 2); // 2 jugadores por defecto

        game = new UnoGame({
          gameId,
          players: [
            { username: 'Jugador 1', hand: hands[0] },
            { username: 'Jugador 2', hand: hands[1] }
          ],
          turn: 'Jugador 1',
          deck: newDeck,
          discardPile: [newDeck.pop()],
        });
        await game.save();
        playerIndex = 0;
      } else {
        // Lógica para unirse a una partida existente
        playerIndex = game.players.findIndex(p => p.username === username);
        if (playerIndex === -1) {
            // El jugador no existe en la partida, podemos añadirlo aquí
        }
      }

      // Almacenar el WebSocket del jugador
      if (!gameSockets.has(gameId)) {
        gameSockets.set(gameId, []);
      }
      gameSockets.get(gameId).push(ws);

      // Enviar el estado del juego al jugador que se acaba de conectar
      broadcastGameState(game);
    }

    if (type === 'PLAY_CARD') {
      const game = await UnoGame.findOne({ gameId });
      const currentPlayer = game.players.find(p => p.username === username);

      if (game.turn !== username) return;

      if (isValidPlay(card, game.discardPile[game.discardPile.length - 1])) {
        // Eliminar la carta de la mano del jugador
        currentPlayer.hand = currentPlayer.hand.filter(c => !(c.color === card.color && c.value === card.value));
        game.discardPile.push(card);
        game.turn = getNextPlayer(game);
        
        applySpecialCardEffect(card, game); // Aplica efectos de +2, reversa, etc.
        
        await game.save();
        broadcastGameState(game);
      } else {
        // Enviar un mensaje de error solo al jugador que hizo la jugada inválida
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Jugada inválida' }));
      }
    }

    if (type === 'DRAW_CARD') {
      const game = await UnoGame.findOne({ gameId });
      if (game.turn !== username) return;

      const currentPlayer = game.players.find(p => p.username === username);
      const drawnCard = game.deck.pop();
      currentPlayer.hand.push(drawnCard);
      
      await game.save();
      broadcastGameState(game);
    }
  });

  ws.on('close', () => {
    // Lógica para remover el WebSocket del mapa y manejar la desconexión
  });
});

const broadcastGameState = (game) => {
  const sockets = gameSockets.get(game.gameId);
  if (sockets) {
    sockets.forEach(socket => {
      // Enviar un estado personalizado a cada jugador (con sus propias cartas)
      const playerUsername = // ... lógica para obtener el nombre de usuario del socket
      const playerHand = game.players.find(p => p.username === playerUsername).hand;

      const fullGameState = {
        ...game.toObject(),
        playerHand: playerHand,
      };

      socket.send(JSON.stringify(fullGameState));
    });
  }
};

const getNextPlayer = (game) => {
  const currentIndex = game.players.findIndex(p => p.username === game.turn);
  const nextIndex = (currentIndex + 1) % game.players.length;
  return game.players[nextIndex].username;
};

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
