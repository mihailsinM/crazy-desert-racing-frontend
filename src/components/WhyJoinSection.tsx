import { Link } from "react-router-dom";
import "../styles/why-join-section.css";

function WhyJoinSection() {
  return (
    <section className="why-join-section">
      <div className="why-join-header du-container">
        <p>Why Join The Club</p>
        <h2>More than racing. A desert community.</h2>
      </div>

      <div className="why-join-grid du-showcase-grid du-container">
        <Link to="/races" className="why-join-card">
          <span>🏁</span>
          <h3>Desert Racing</h3>
          <p>
            Explore upcoming races, view event details and register your own car
            when registration is open.
          </p>
        </Link>

        <Link to="/chats" className="why-join-card">
          <span>💬</span>
          <h3>Community Groups</h3>
          <p>
            Group chats are planned: meet people who share your interests,
            from camping and cars to any other topic.
          </p>
        </Link>

        <Link to="/vip" className="why-join-card">
          <span>👑</span>
          <h3>VIP Club</h3>
          <p>
            VIP is not available yet. Future membership will offer higher
            limits, including more photos and additional opportunities.
          </p>
        </Link>
      </div>
    </section>
  );
}

export default WhyJoinSection;
