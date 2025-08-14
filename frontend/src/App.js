import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UnoGamePage from './pages/UnoGamePage';
import ChessGamePage from './pages/ChessGamePage';
import GuessWhoGamePage from './pages/GuessWhoGamePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/uno/:gameId" element={<UnoGamePage />} />
        <Route path="/ajedrez/:gameId" element={<ChessGamePage />} />
        <Route path="/adivina-quien/:gameId" element={<GuessWhoGamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
