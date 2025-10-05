import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Lightbulb, Camera } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="h-8 w-8 text-primary" />,
    title: '1. 모델 불러오기',
    description: '작업할 3D 모델을 장면에 불러오거나, 기본 제공되는 모델을 사용하세요.',
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: '2. 조명 배치하기',
    description: '원하는 위치에 조명을 추가하고 색상, 강도 등을 실시간으로 제어합니다.',
  },
  {
    icon: <Camera className="h-8 w-8 text-primary" />,
    title: '3. 결과 확인 및 저장',
    description: '다양한 카메라 앵글에서 조명 결과를 확인하고, 만족스러운 장면을 저장하세요.',
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

const HowItWorks = () => {
  return (
    <section className="py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">간단한 3단계 사용법</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground md:text-lg">누구나 쉽게 전문가 수준의 조명 디자인을 시작할 수 있습니다.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <Card className="h-full text-center">
                <CardHeader>
                  <div className="mx-auto bg-background rounded-full p-3 w-fit mb-4 border">
                    {step.icon}
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription className="pt-2">{step.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
