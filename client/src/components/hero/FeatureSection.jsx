import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Camera, Save } from 'lucide-react';

const features = [
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: '직관적인 조명 설계',
    description: '원하는 곳에 조명을 추가하고, 슬라이더로 즉시 제어하세요.',
  },
  {
    icon: <Camera className="h-8 w-8 text-primary" />,
    title: '자유로운 카메라 워크',
    description: '다양한 앵글과 렌즈(FOV)를 테스트하며 완벽한 샷을 찾으세요.',
  },
  {
    icon: <Save className="h-8 w-8 text-primary" />,
    title: '저장 및 공유',
    description: '작업한 장면을 저장하고, 팀원과 URL 하나로 공유하세요.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const FeatureSection = () => {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">핵심 기능</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground md:text-lg">LumoStage가 제공하는 강력하고 편리한 기능들을 만나보세요.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <Card className="h-full text-center">
                <CardHeader>
                  <div className="mx-auto bg-muted rounded-full p-3 w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="pt-2">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
