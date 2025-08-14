import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function UnoGamePage() {
  const { gameId } = useParams(); // Obtiene el ID de la URL
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Aquí te conectarías al backend con WebSockets usando el gameId
    // para obtener el estado actual de la partida.
    console.log(`Conectando a la partida de UNO con ID: ${gameId}`);
    
    // Simulación de una llamada a la API
    // const fetchGameData = async () => {
    //   const response = await fetch(`/api/games/uno/${gameId}`);
    //   const data = await response.json();
    //   setGameState(data);
    // };
    // fetchGameData();
  }, [gameId]);

  // Aquí renderizarías la interfaz del juego, las cartas, los jugadores, etc.
  // Podrías usar las imágenes que subiste para las cartas.
  return (
    <div>
      <h1>Partida de UNO</h1>
      <p>ID de la partida: {gameId}</p>
      {/* Lógica para mostrar las cartas, el mazo, la pila de descarte */}
      {/* Por ejemplo: <Carta src="/path/to/carta-3-azul.png" /> */}
    </div>
  );
}

export default UnoGamePage;
