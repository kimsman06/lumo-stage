import React, { useState, useEffect } from 'react';
import { Lightbulb, Camera, Zap, ArrowRight, Play, Sparkles, Grid3x3 } from 'lucide-react';

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizes = {
    default: 'h-10 px-6 py-2',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

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

const AnimatedLight = ({ delay = 0, position }) => {
  const [opacity, setOpacity] = useState(0.3);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(prev => prev === 0.3 ? 0.8 : 0.3);
    }, 2000 + delay * 200);
    
    return () => clearInterval(interval);
  }, [delay]);
  
  return (
    <div 
      className="absolute w-2 h-2 rounded-full bg-yellow-400 transition-opacity duration-1000"
      style={{ 
        left: position.x,
        top: position.y,
        opacity,
        boxShadow: `0 0 ${opacity * 20}px ${opacity * 10}px rgba(250, 204, 21, ${opacity * 0.5})`
      }}
    />
  );
};

export default function LumoStageHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden border-b"
        onMouseMove={handleMouseMove}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        
        {/* Animated Lights */}
        <AnimatedLight delay={0} position={{ x: '15%', y: '20%' }} />
        <AnimatedLight delay={1} position={{ x: '85%', y: '30%' }} />
        <AnimatedLight delay={2} position={{ x: '70%', y: '70%' }} />
        <AnimatedLight delay={3} position={{ x: '25%', y: '80%' }} />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="animate-fade-in">
              <Badge className="gap-1">
                <Sparkles className="w-3 h-3" />
                Virtual Lighting Studio
              </Badge>
            </div>
            
            {/* Main Headline */}
            <h1 
              className="text-5xl lg:text-7xl font-bold tracking-tight transition-transform duration-300"
              style={{ 
                transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
              }}
            >
              <span className="block bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                Illuminate Your Vision
              </span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Before You Shoot
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              실시간 3D 조명 시뮬레이션으로 촬영 전 완벽한 라이팅을 설계하세요. 시간과 비용을 절약하고, 창의성을 극대화하세요.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="gap-2 group">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Creating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Camera className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                  Real-time
                </div>
                <div className="text-sm text-muted-foreground">Instant Feedback</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                  3D
                </div>
                <div className="text-sm text-muted-foreground">Full Control</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                  Web-based
                </div>
                <div className="text-sm text-muted-foreground">No Installation</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
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
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden border-t">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-yellow-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Light Up Your Project?
            </h2>
            <p className="text-xl text-muted-foreground">
              지금 바로 시작하고 완벽한 조명 설계를 경험해보세요.
            </p>
            <Button size="lg" className="gap-2 group">
              <Lightbulb className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}