import { Link } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 px-4 md:px-6 flex items-center justify-between z-50 bg-background/80 backdrop-blur-sm border-b">
      <Link to="/" className="flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">LumoStage</span>
      </Link>
      <nav>
        <Link to="/editor">
          <Button>에디터 시작하기</Button>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
