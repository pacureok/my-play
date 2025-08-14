import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import './UnoGamePage.css';

// Reemplaza esta URL con la de tu backend en Vercel
const API_BASE_URL = 'wss://my-play-6tqd.vercel.app'; 

function UnoGamePage() {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState(null);
  const [username, setUsername] = useState('Jugador 1'); // Debería ser el nombre de usuario autenticado
  const [error, setError] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    // Conexión WebSocket
    ws.current = new WebSocket(API_BASE_URL);

    ws.current.onopen = () => {
      console.log('Conectado al servidor WebSocket');
      // Al conectarse, se une a la partida
      ws.current.send(JSON.stringify({
        type: 'JOIN_GAME',
        gameId: gameId,
        username: username,
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Estado del juego recibido:', data);

      if (data.type === 'ERROR') {
        setError(data.message);
      } else if (data.type === 'GAME_STATE_UPDATE') {
        setGameState(data);
      }
    };

    ws.current.onclose = () => {
      console.log('Desconectado del servidor WebSocket');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [gameId, username]);

  const handlePlayCard = (card) => {
    if (gameState.turn !== username) {
      alert('No es tu turno!');
      return;
    }
    ws.current.send(JSON.stringify({
      type: 'PLAY_CARD',
      gameId: gameId,
      username: username,
      card: card,
    }));
  };

  const handleDrawCard = () => {
    if (gameState.turn !== username) {
      alert('No es tu turno!');
      return;
    }
    ws.current.send(JSON.stringify({
      type: 'DRAW_CARD',
      gameId: gameId,
      username: username,
    }));
  };

  if (!gameState) {
    return <div className="loading-container">Cargando partida...</div>;
  }

  const isMyTurn = gameState.turn === username;
  const currentCard = gameState.discardPile[gameState.discardPile.length - 1];
  const opponent = gameState.players.find(p => p.username !== username);

  return (
    <div className="uno-game-container">
      {gameState.status === 'WINNER' && (
        <div className="winner-message">
          <h1>¡{gameState.winner} ha ganado la partida!</h1>
          <p>Felicidades, la partida ha terminado.</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="header">
        <h1>Partida de UNO: {gameId}</h1>
        <p>Turno de: <strong>{gameState.turn}</strong></p>
        <p>{isMyTurn ? '¡Es tu turno!' : 'Espera a tu turno.'}</p>
      </div>

      <div className="game-area">
        {opponent && (
          <div className="opponent-hand">
            <h3>{opponent.username}</h3>
            <div className="cards-list">
              {/* Muestra el reverso de las cartas del oponente */}
              {Array(opponent.hand.length).fill(null).map((_, index) => (
                <img key={index} src="/cartas/reverso.png" alt="Reverso de la carta" style={{ width: '80px', height: '120px', margin: '5px' }} />
              ))}
            </div>
          </div>
        )}
        
        <div className="card-piles">
          <div className="discard-pile">
            <h3>Carta en la mesa</h3>
            {currentCard && <Card color={currentCard.color} value={currentCard.value} />}
          </div>
          <div className="deck-pile">
            <h3>Mazo</h3>
            <img src="/cartas/reverso.png" alt="Mazo" style={{ width: '100px', height: '150px' }} />
            <button onClick={handleDrawCard} disabled={!isMyTurn}>
              Robar Carta
            </button>
          </div>
        </div>

        <div className="player-hand">
          <h3>Tus cartas</h3>
          <div className="cards-list">
            {gameState.playerHand.map((card, index) => (
              <div key={index} onClick={() => handlePlayCard(card)} className="card-clickable">
                <Card color={card.color} value={card.value} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnoGamePage;
