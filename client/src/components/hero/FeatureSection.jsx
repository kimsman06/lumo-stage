import React, { useState, useEffect } from 'react';
import { Lightbulb, Camera, Zap, Play, Sparkles, Grid3x3 } from 'lucide-react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground',
  };
  
  return (
    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`group relative p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

const FeatureSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            Key Features
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
              Perfect Lighting
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            전문가를 위한 강력한 기능, 누구나 쉽게 사용할 수 있는 인터페이스
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={Lightbulb}
            title="Dynamic Light Control"
            description="Point, Spot, Directional 조명을 자유롭게 추가하고 위치, 색상, 강도를 실시간으로 조절하세요."
            delay={0}
          />
          <FeatureCard
            icon={Camera}
            title="Virtual Camera"
            description="다양한 앵글과 FOV를 테스트하며 최적의 촬영 구도를 미리 확인할 수 있습니다."
            delay={100}
          />
          <FeatureCard
            icon={Grid3x3}
            title="3D Viewport"
            description="Three.js 기반의 고품질 렌더링으로 실제와 같은 조명 효과를 시뮬레이션합니다."
            delay={200}
          />
          <FeatureCard
            icon={Zap}
            title="Real-time Preview"
            description="모든 변경사항이 즉시 반영되어 빠르고 효율적인 작업 흐름을 제공합니다."
            delay={300}
          />
          <FeatureCard
            icon={Play}
            title="Scene Sharing"
            description="작업한 장면을 저장하고 팀원들과 공유하여 원활한 협업을 진행하세요."
            delay={400}
          />
          <FeatureCard
            icon={Sparkles}
            title="Easy to Use"
            description="복잡한 3D 소프트웨어 없이도 직관적인 UI로 누구나 쉽게 사용할 수 있습니다."
            delay={500}
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;