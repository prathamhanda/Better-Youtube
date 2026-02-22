import Spotlight from "@/components/Spotlight";
import FilmGrain from "@/components/FilmGrain";
import HeroSection from "@/components/HeroSection";
import ZenScrollingSection from "@/components/ZenScrollingSection";
import PipSection from "@/components/PipSection";
import FocusModeSection from "@/components/FocusModeSection";
import SmartSpeedSection from "@/components/SmartSpeedSection";
import SponsorBlockSection from "@/components/SponsorBlockSection";
import FloatingScrollNav from "@/components/FloatingScrollNav";

import PerformanceBar from "@/components/PerformanceBar";
import CreatorSection from "@/components/CreatorSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <Spotlight />
      <FilmGrain />
      <HeroSection />

      <ZenScrollingSection />
      <PipSection />
      <FocusModeSection />
      <SmartSpeedSection />
      <SponsorBlockSection />
      <FloatingScrollNav />
      <PerformanceBar />
      <CreatorSection />
      <Footer />
    </div>
  );
};

export default Index;
