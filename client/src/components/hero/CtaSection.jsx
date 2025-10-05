import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
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
          <Link to="/editor">
            <Button size="lg" className="gap-2 group">
              <Lightbulb className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
