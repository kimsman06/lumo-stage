import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-[150px] lg:text-[200px] font-bold text-primary/10 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-24 h-24 text-muted-foreground animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지
          </Button>
          <Link to="/">
            <Button className="gap-2" size="lg">
              <Home className="w-4 h-4" />
              홈으로 가기
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            자주 찾는 페이지:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/">
              <Button variant="ghost" size="sm">
                메인
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                프로젝트
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
