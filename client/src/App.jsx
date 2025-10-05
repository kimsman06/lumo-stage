import { Routes, Route } from 'react-router-dom';
import HeroPage from './pages/HeroPage';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
