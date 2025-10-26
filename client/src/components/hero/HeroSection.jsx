import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '../../store/authStore';

const Badge = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-all ${className}`}>
      {children}
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

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isAuthenticated } = useAuthStore();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
    });
  };

  return (
    <section 
      className="relative overflow-hidden border-b min-h-screen flex items-center"
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
          <p className="text-lg lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            실시간 3D 조명 시뮬레이션으로 촬영 전 완벽한 라이팅을 설계하세요. <br />시간과 비용을 절약하고, 창의성을 극대화하세요.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to={isAuthenticated ? "/projects" : "/register"}>
              <Button size="lg" className="gap-2 group">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {isAuthenticated ? "내 프로젝트" : "무료로 시작하기"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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
  );
};

export default HeroSection;