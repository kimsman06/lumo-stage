import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function HeroPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
          LumoStage
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl">
          실시간 3D 조명 시뮬레이션으로 당신의 아이디어를 현실로 만드세요. 직관적인 컨트롤과 강력한 렌더링을 경험해보세요.
        </p>
      </div>
      <div className="mt-8">
        <Link to="/editor">
          <Button size="lg">에디터 시작하기</Button>
        </Link>
      </div>
    </div>
  );
}

export default HeroPage;
