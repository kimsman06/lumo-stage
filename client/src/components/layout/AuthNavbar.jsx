import { Link, useNavigate } from "react-router-dom";
import { Lightbulb, User, LogOut, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "../../store/authStore";

const AuthNavbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 px-4 md:px-6 flex items-center justify-between z-50 bg-background/80 backdrop-blur-sm border-b">
      <Link to="/" className="flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">LumoStage</span>
      </Link>

      <nav className="flex items-center gap-4">
        {isAuthenticated ? (
          // 로그인 상태
          <>
            <Link to="/projects">
              <Button variant="ghost" className="gap-2">
                <FolderOpen className="h-4 w-4" />내 프로젝트
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    {user?.profileImage && (
                      <AvatarImage src={user.profileImage} alt={user?.username || "프로필"} />
                    )}
                    <AvatarFallback>
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">
                    {user?.username || "사용자"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/projects" className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>내 프로젝트</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          // 비로그인 상태
          <>
            <Link to="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link to="/register">
              <Button>회원가입</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default AuthNavbar;
