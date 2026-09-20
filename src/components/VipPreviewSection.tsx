import "../styles/vip-preview-section.css";

function VipPreviewSection() {
  return (
    <section id="vip" className="vip-preview-section">
      <div className="vip-preview-card">
        <p>VIP Membership</p>

        <h2>Unlock the premium desert experience.</h2>

        <p className="vip-preview-text">
          Future VIP members will receive premium access, exclusive race
          benefits, special event zones and a stronger connection to the Crazy
          Desert Racing community.
        </p>

        <a href="/vip" className="vip-preview-button">
          Explore VIP Club
        </a>
      </div>
    </section>
  );
}

export default VipPreviewSection;
