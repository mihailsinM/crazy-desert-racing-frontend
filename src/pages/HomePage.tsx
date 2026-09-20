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
      <div className="home-page-content du-page-scroll">
        <HeroSection />
        <UpcomingRacesSection />
        <WhyJoinSection />
        <FestivalExperienceSection />
        <VipPreviewSection />
      </div>
    </main>
  );
}

export default HomePage;
