import "../styles/vip-club-page.css";
import "../styles/animations.css";

function VipClubPage() {
  return (
    <section className="vip-page">
      <header className="page-header">
        <p>Premium Membership</p>
        <h1>⭐ VIP Club</h1>
      </header>

      <div className="vip-grid">
        <div className="vip-card">
          <h2>Silver</h2>
          <p>Festival access and member-only updates.</p>
          <span>Starter VIP</span>
        </div>

        <div className="vip-card featured">
          <h2>Gold</h2>
          <p>VIP lounge, priority race registration, and premium events.</p>
          <span>Most Popular</span>
        </div>

        <div className="vip-card">
          <h2>Platinum</h2>
          <p>
            All-access experience, private events, and exclusive club perks.
          </p>
          <span>Ultimate Club</span>
        </div>
      </div>
    </section>
  );
}

export default VipClubPage;
