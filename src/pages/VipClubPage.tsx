import "../styles/vip-club-page.css";
import "../styles/animations.css";

const memberships = [
  {
    name: "Silver",
    description: "Festival access and member-only updates.",
    badge: "Starter VIP",
    price: "$49 / month",
    featured: false,
  },
  {
    name: "Gold",
    description: "VIP lounge, priority race registration, and premium events.",
    badge: "Most Popular",
    price: "$99 / month",
    featured: true,
  },
  {
    name: "Platinum",
    description:
      "All-access experience, private events, and exclusive club perks.",
    badge: "Ultimate Club",
    price: "$199 / month",
    featured: false,
  },
];

function VipClubPage() {
  return (
    <section className="vip-page">
      <header className="page-header">
        <p>Premium Membership</p>
        <h1>⭐ VIP Club</h1>
      </header>

      <div className="vip-grid">
        {memberships.map((membership) => (
          <div
            key={membership.name}
            className={
              membership.featured ? "vip-card featured" : "vip-card"
            }
          >
            <h2>{membership.name}</h2>
            <p>{membership.description}</p>

            <strong className="vip-price">{membership.price}</strong>

            <span>{membership.badge}</span>

            <button className="vip-button">
              Choose {membership.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default VipClubPage;