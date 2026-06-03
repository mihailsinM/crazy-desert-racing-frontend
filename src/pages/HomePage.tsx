import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import UpcomingRacesSection from "../components/UpcomingRacesSection";
import WhyJoinSection from "../components/WhyJoinSection";
import "../styles/home-page.css";
import FestivalExperienceSection from "../components/FestivalExperienceSection";
import VipPreviewSection from "../components/VipPreviewSection";

function HomePage() {
  return (
    <main className="home-page">
      <Navbar />
      <HeroSection />
      <UpcomingRacesSection />
      <WhyJoinSection />
      <FestivalExperienceSection />
      <VipPreviewSection />
    </main>
  );
}

export default HomePage;
