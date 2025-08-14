const colors = ['ro', 'az', 've', 'am'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'salto', 'reversa', 'mas2'];

const createDeck = () => {
  let deck = [];
  // Crear cartas de cada color
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

  // Añadir comodines
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'negro', value: 'comodin' });
    deck.push({ color: 'negro', value: 'mas4' });
  }

  return shuffleDeck(deck);
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const dealCards = (deck, numPlayers) => {
  const hands = Array(numPlayers).fill(null).map(() => []);
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < numPlayers; j++) {
      hands[j].push(deck.pop());
    }
  }
  return hands;
};

const isValidPlay = (playedCard, currentCard) => {
  if (playedCard.color === 'negro') {
    return true; // Los comodines siempre son válidos
  }
  return playedCard.color === currentCard.color || playedCard.value === currentCard.value;
};

const applySpecialCardEffect = (card, game) => {
  const currentIndex = game.players.findIndex(p => p.username === game.turn);
  
  if (card.value === 'reversa') {
    game.turnOrder = game.turnOrder === 'forward' ? 'backward' : 'forward';
  }
  
  let nextIndex = currentIndex;
  if (game.turnOrder === 'forward') {
    nextIndex = (currentIndex + 1) % game.players.length;
  } else {
    nextIndex = (currentIndex - 1 + game.players.length) % game.players.length;
  }
  
  if (card.value === 'salto') {
    if (game.turnOrder === 'forward') {
      nextIndex = (nextIndex + 1) % game.players.length;
    } else {
      nextIndex = (nextIndex - 1 + game.players.length) % game.players.length;
    }
  }

  game.turn = game.players[nextIndex].username;

  // Lógica para robar cartas con +2 o +4
  if (card.value === 'mas2') {
    const nextPlayer = game.players[nextIndex];
    nextPlayer.hand.push(game.deck.pop(), game.deck.pop());
  }
  if (card.value === 'mas4') {
    const nextPlayer = game.players[nextIndex];
    nextPlayer.hand.push(game.deck.pop(), game.deck.pop(), game.deck.pop(), game.deck.pop());
  }
};

const checkWinCondition = (player) => {
  return player.hand.length === 0;
};

module.exports = {
  createDeck,
  shuffleDeck,
  dealCards,
  isValidPlay,
  applySpecialCardEffect,
  checkWinCondition,
};
