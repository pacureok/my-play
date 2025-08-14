const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Importa el módulo 'path' de Node.js
const UnoGame = require('./models/UnoGame');
const Mission = require('./models/Mission');
const User = require('./models/User');
const { createDeck, dealCards, isValidPlay, applySpecialCardEffect, checkWinCondition } = require('./gameLogic');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://localhost/mi-plataforma-juegos')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

const gameSockets = new Map();

wss.on('connection', ws => {
  ws.on('message', async message => {
    // Lógica del WebSocket para JOIN_GAME, PLAY_CARD, etc.
    // ... (El código de WebSocket que ya tienes va aquí)
    const data = JSON.parse(message);
    const { type, gameId, username, card } = data;

    if (type === 'JOIN_GAME') {
      let game = await UnoGame.findOne({ gameId });
      if (!game) {
        const newDeck = createDeck();
        const hands = dealCards(newDeck, 2);
        game = new UnoGame({
          gameId,
          players: [{ username: 'Jugador 1', hand: hands[0] }, { username: 'Jugador 2', hand: hands[1] }],
          turn: 'Jugador 1',
          turnOrder: 'forward',
          deck: newDeck,
          discardPile: [newDeck.pop()],
        });
        await game.save();
      }

      if (!gameSockets.has(gameId)) {
        gameSockets.set(gameId, []);
      }
      gameSockets.get(gameId).push(ws);
      broadcastGameState(gameId, game, username);
    }
    
    if (type === 'PLAY_CARD') {
        const game = await UnoGame.findOne({ gameId });
        const currentPlayer = game.players.find(p => p.username === username);

        if (game.turn !== username || !isValidPlay(card, game.discardPile[game.discardPile.length - 1])) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Jugada inválida' }));
            return;
        }

        currentPlayer.hand = currentPlayer.hand.filter(c => !(c.color === card.color && c.value === card.value));
        game.discardPile.push(card);
        
        applySpecialCardEffect(card, game);
        
        if (checkWinCondition(currentPlayer)) {
            const user = await User.findOne({ username });
            if (user) {
                const mission = await Mission.findOne({ user: user._id, title: 'Gana una partida de UNO' });
                if (mission) {
                    mission.isCompleted = true;
                    await mission.save();
                    user.points += mission.reward;
                    await user.save();
                }
            }
            broadcastGameState(gameId, game, username, 'WINNER');
            return;
        }

        await game.save();
        broadcastGameState(gameId, game, username);
    }

    if (type === 'DRAW_CARD') {
        const game = await UnoGame.findOne({ gameId });
        if (game.turn !== username) return;

        const currentPlayer = game.players.find(p => p.username === username);
        const drawnCard = game.deck.pop();
        currentPlayer.hand.push(drawnCard);

        await game.save();
        broadcastGameState(gameId, game, username);
    }
  });

  ws.on('close', () => {
    // Lógica para remover el socket de la partida
  });
});

const broadcastGameState = (gameId, game, currentPlayerUsername, status = 'PLAYING', winner = null) => {
    const sockets = gameSockets.get(gameId);
    if (!sockets) return;
  
    sockets.forEach(socket => {
        const fullGameState = { 
            ...game.toObject(), 
            type: 'GAME_STATE_UPDATE',
            status,
            winner,
            playerHand: game.players.find(p => p.username === currentPlayerUsername).hand,
        };

        socket.send(JSON.stringify(fullGameState));
    });
};

app.get('/api/missions/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const missions = await Mission.find({ user: user._id, isCompleted: false });
    if (missions.length === 0) {
        const newMission = new Mission({
            title: 'Gana una partida de UNO',
            description: 'Gana cualquier partida de UNO para completar esta misión.',
            reward: 50,
            user: user._id,
        });
        await newMission.save();
        return res.json([newMission]);
    }

    res.json(missions);
});

// NUEVA SECCIÓN: Servir los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Enviar el archivo index.html para cualquier ruta que no sea de la API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
