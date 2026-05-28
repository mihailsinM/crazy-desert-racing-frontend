import "../styles/hero-section.css";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <p className="eyebrow">Crazy Desert Racing Club</p>

        <h1>Desert racing. VIP club. Festival energy.</h1>

        <p className="hero-text">
          Join a three-day desert racing experience with powerful cars,
          exclusive members, race registration, and future VIP events.
        </p>

        <div className="hero-actions">
          <button className="primary-button">Login</button>
          <button className="secondary-button">Explore races</button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
