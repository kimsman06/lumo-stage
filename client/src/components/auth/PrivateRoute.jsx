import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading, hasInitialized } = useAuthStore();

  // 로딩 중일 때 스피너 표시
  if (!hasInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
}
