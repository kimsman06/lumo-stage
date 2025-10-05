import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Drake',
    role: '3D 아티스트',
    avatar: 'AD',
    review: 'LumoStage 덕분에 클라이언트에게 조명 시안을 보여주는 시간이 획기적으로 단축되었습니다. 웹에서 바로 확인시켜줄 수 있다는 점이 정말 강력해요.',
  },
  {
    name: 'Jian Li',
    role: '인디 게임 개발자',
    avatar: 'JL',
    review: '복잡한 조명 엔진 없이도 게임의 전체적인 라이팅 톤을 빠르게 프로토타이핑할 수 있어 매우 유용합니다. 개발 초기 단계에 필수적인 툴입니다.',
  },
  {
    name: 'Maria Garcia',
    role: '건축 시각화 디자이너',
    avatar: 'MG',
    review: '실시간으로 그림자와 빛의 상호작용을 보며 작업하니, 최종 렌더링 결과물을 더 정확하게 예측할 수 있게 되었습니다. 정말 놀라운 경험입니다.',
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

const Testimonials = () => {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">전 세계 크리에이터들의 찬사</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground md:text-lg">LumoStage는 이미 많은 전문가들의 작업 방식을 바꾸고 있습니다.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <Avatar>
                    {/* <AvatarImage src={`/avatars/${testimonial.avatar}.png`} /> */}
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">"{testimonial.review}"</p>
                </CardContent>
                <div className="p-6 pt-0 flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-primary fill-primary" />)}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
