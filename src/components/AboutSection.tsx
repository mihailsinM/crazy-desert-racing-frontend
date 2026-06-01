import "../styles/about-section.css";
import "../styles/about-section.css";
import homePageImage from "../assets/home_page.jpg";

function AboutSection() {
  return (
    <section
      className="about-section"
      style={{
        backgroundImage: `
      linear-gradient(
        90deg,
        rgba(8,5,3,0.78) 0%,
        rgba(8,5,3,0.45) 45%,
        rgba(8,5,3,0.15) 100%
      ),
      url(${homePageImage})
    `,
      }}
    >
      <div className="about-content">
        <p className="about-eyebrow">The Story</p>

        <h2>Why Crazy Desert Racing?</h2>

        <p>
          Crazy Desert Racing started as a dream inspired by the landscapes of
          the Negev Desert.
        </p>

        <p>
          The goal is to create a future community around adventure, racing,
          friendship, festivals and unforgettable experiences under the open
          sky.
        </p>

        <p>Today it is a project. Tomorrow - reality.</p>
      </div>
    </section>
  );
}

export default AboutSection;
