import "../styles/hero-section.css";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-layout">
        <div className="hero-content">
          <p className="eyebrow">Negev Desert • Israel</p>

          <h1>Crazy Desert Racing</h1>

          <p className="hero-subtitle">A dream born in the Negev Desert.</p>

          <p className="hero-text">
            A future community for people who love desert adventures, powerful
            cars, racing culture, music, friendship and unforgettable nights
            under the open sky.
          </p>

          <div className="hero-actions">

            <Link to="/register" className="primary-button">
              Join The Journey
            </Link>

            <Link to="/races" className="secondary-button">
              Explore Races
            </Link>
            
          </div>
        </div>

        <aside className="hero-story-card">
          <p className="story-eyebrow">The Story</p>

          <h2>Why Crazy Desert Racing?</h2>

          <div className="story-slider">
            <div className="story-slider-track">
              <p>
                Crazy Desert Racing started as a dream inspired by the
                landscapes of the Negev Desert.
              </p>

              <p>
                The goal is to create a future community around adventure,
                racing, friendship, festivals and unforgettable experiences
                under the open sky.
              </p>

              <p className="story-final">
                <span>Today it is a project.</span>
                <span className="story-highlight">
                  Tomorrow it becomes reality.
                </span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default HeroSection;
