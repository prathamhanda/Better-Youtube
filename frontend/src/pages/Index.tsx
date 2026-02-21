import Spotlight from "@/components/Spotlight";
import FloatingScrollNav from "@/components/FloatingScrollNav";
import HeroSection from "@/components/HeroSection";
import ZenScrollingSection from "@/components/ZenScrollingSection";
import PipSection from "@/components/PipSection";
import PerformanceBar from "@/components/PerformanceBar";
import CreatorSection from "@/components/CreatorSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <Spotlight />
      <FloatingScrollNav />
      <HeroSection />
      <ZenScrollingSection />
      <PipSection />
      <PerformanceBar />
      <CreatorSection />
      <Footer />
    </div>
  );
};

export default Index;
