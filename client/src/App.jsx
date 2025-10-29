import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EditorPage from "./pages/EditorPage";
import ProjectsDashboardPage from "./pages/ProjectsDashboardPage";
import SharedProjectViewer from "./pages/SharedProjectViewer";
import NotFoundPage from "./pages/NotFoundPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import useAuthStore from "./store/authStore";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
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
        {/* 공유 프로젝트 뷰어 - 인증 불필요 */}
        <Route path="/shared/:token" element={<SharedProjectViewer />} />
        {/* 404 - 모든 매칭되지 않는 라우트 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        theme="system"
        toastOptions={{
          classNames: {
            toast: "font-sans",
            title: "text-sm font-medium",
            description: "text-sm",
          },
        }}
      />
    </>
  );
}

export default App;
