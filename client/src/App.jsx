import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import EditorPanelTestPage from './pages/EditorPanelTestPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/editor-panel-test" element={<EditorPanelTestPage />} />
    </Routes>
  );
}

export default App;
