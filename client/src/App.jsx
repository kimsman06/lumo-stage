import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EditorPage from "./pages/EditorPage";
import ProjectsDashboardPage from "./pages/ProjectsDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivateRoute from "./components/auth/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <ProjectsDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <PrivateRoute>
            <EditorPage />
          </PrivateRoute>
        }
      />
      {/* 404 - 모든 매칭되지 않는 라우트 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
