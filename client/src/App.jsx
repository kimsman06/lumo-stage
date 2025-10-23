import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import ProjectsDashboardPage from './pages/ProjectsDashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/projects" element={<ProjectsDashboardPage />} />
    </Routes>
  );
}

export default App;
