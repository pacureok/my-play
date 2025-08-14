import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import './UnoGamePage.css'; // Añade este archivo para los estilos

const API_BASE_URL = 'ws://localhost:3001'; // O la URL de tu backend desplegado

function UnoGamePage() {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState(null);
  const [username, setUsername] = useState('Jugador 1'); // Deberías obtener el nombre del usuario logeado
  const ws = useRef(null);

  useEffect(() => {
    // Conexión WebSocket
    ws.current = new WebSocket(API_BASE_URL);

    ws.current.onopen = () => {
      console.log('Conectado al servidor WebSocket');
      // Cuando se conecta, se une a la partida
      ws.current.send(JSON.stringify({
        type: 'JOIN_GAME',
        gameId: gameId,
        username: username,
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Estado del juego recibido:', data);
      setGameState(data);
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
    // Envía la jugada al servidor
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
    // Envía la acción de robar al servidor
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

  return (
    <div className="uno-game-container">
      <div className="header">
        <h1>Partida de UNO: {gameId}</h1>
        <p>Turno de: <strong>{gameState.turn}</strong></p>
        <p>{isMyTurn ? '¡Es tu turno!' : 'Espera a tu turno.'}</p>
      </div>

      <div className="game-area">
        <div className="card-piles">
          <div className="discard-pile">
            <h3>Carta en la mesa</h3>
            {gameState.discardPile && <Card color={gameState.discardPile.color} value={gameState.discardPile.value} />}
          </div>
          <div className="deck-pile">
            <h3>Mazo</h3>
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
