import Navbar from '../components/hero/Navbar';
import HeroSection from '../components/hero/HeroSection';
import FeatureSection from '../components/hero/FeatureSection';
import CtaSection from '../components/hero/CtaSection';
import Footer from '../components/hero/Footer';

const HomePage = () => {
  return (
    <div className="bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <FeatureSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
