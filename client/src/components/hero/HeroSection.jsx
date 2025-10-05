import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HeroSection = () => {
  return (
    <motion.section 
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
        variants={itemVariants}
      >
        디지털 공간에서 펼쳐지는 당신의 조명 연출
      </motion.h1>
      <motion.p 
        className="max-w-[700px] text-muted-foreground md:text-xl mt-4"
        variants={itemVariants}
      >
        웹에서 실시간으로 조명을 설계하고, 당신의 비전을 현실로 만드세요. 복잡한 설치 없이, 아이디어만 준비하세요.
      </motion.p>
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 mt-8"
        variants={itemVariants}
      >
        <Link to="/editor">
          <Button size="lg">에디터 시작하기</Button>
        </Link>
        <a href="#features">
          <Button size="lg" variant="outline">기능 둘러보기</Button>
        </a>
      </motion.div>
      <motion.div 
        className="w-full max-w-4xl aspect-video bg-muted border rounded-lg mt-12 flex items-center justify-center"
        variants={itemVariants}
      >
        <p className="text-muted-foreground">[에디터 시연 영상/GIF 플레이스홀더]</p>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
