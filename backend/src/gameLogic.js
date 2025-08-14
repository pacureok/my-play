// backend/src/gameLogic.js

const colors = ['ro', 'az', 've', 'am'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'salto', 'reversa', 'mas2'];

const createDeck = () => {
  let deck = [];
  for (const color of colors) {
    deck.push({ color, value: '0' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ color, value: i.toString() });
      deck.push({ color, value: i.toString() });
    }
    deck.push({ color, value: 'salto' });
    deck.push({ color, value: 'salto' });
    deck.push({ color, value: 'reversa' });
    deck.push({ color, value: 'reversa' });
    deck.push({ color, value: 'mas2' });
    deck.push({ color, value: 'mas2' });
  }

  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'negro', value: 'comodin' });
    deck.push({ color: 'negro', value: 'mas4' });
  }

  return shuffleDeck(deck);
};

const shuffleDeck = (deck) => {
  // ... (el código es el mismo, no es necesario repetirlo)
};

const dealCards = (deck, numPlayers) => {
  // ... (el código es el mismo, no es necesario repetirlo)
};

const isValidPlay = (playedCard, currentCard) => {
  if (playedCard.color === 'negro') {
    return true;
  }
  return playedCard.color === currentCard.color || playedCard.value === currentCard.value;
};

const applySpecialCardEffect = (card, game) => {
  // Lógica para aplicar los efectos de las cartas especiales
  switch (card.value) {
    case 'reversa':
      // Cambia el orden de los turnos
      // Por ahora, con 2 jugadores, solo se salta el turno
      game.turn = getNextPlayer(game);
      break;
    case 'salto':
      // Salta el turno del siguiente jugador
      game.turn = getNextPlayer(game);
      game.turn = getNextPlayer(game);
      break;
    case 'mas2':
      // El siguiente jugador roba 2 cartas
      const nextPlayer = game.players.find(p => p.username === getNextPlayer(game));
      nextPlayer.hand.push(game.deck.pop());
      nextPlayer.hand.push(game.deck.pop());
      game.turn = getNextPlayer(game);
      game.turn = getNextPlayer(game);
      break;
    case 'mas4':
      // El siguiente jugador roba 4 cartas
      // (Aquí deberías implementar la elección de color)
      const nextPlayerMas4 = game.players.find(p => p.username === getNextPlayer(game));
      nextPlayerMas4.hand.push(game.deck.pop());
      nextPlayerMas4.hand.push(game.deck.pop());
      nextPlayerMas4.hand.push(game.deck.pop());
      nextPlayerMas4.hand.push(game.deck.pop());
      game.turn = getNextPlayer(game);
      game.turn = getNextPlayer(game);
      break;
    case 'comodin':
      // El jugador elige un nuevo color
      // (Aquí deberías implementar la elección de color)
      game.turn = getNextPlayer(game);
      break;
    default:
      break;
  }
};

module.exports = {
  createDeck,
  shuffleDeck,
  dealCards,
  isValidPlay,
  applySpecialCardEffect,
};
