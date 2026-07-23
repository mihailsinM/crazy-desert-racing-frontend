type DashboardHeroStat = {
  label: string;
  value: string;
};


type DashboardHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: DashboardHeroStat[];
  onOpenProfile?: () => void;
};

function DashboardHero({
  eyebrow,
  title,
  description,
  stats,
  onOpenProfile,
}: DashboardHeroProps) {
  return (
    <section className="du-hero">
      <div className="dashboard-hero-main">
        <div className="dashboard-hero-avatar" aria-hidden="true">
          👤
        </div>

        <div>
          <p className="du-eyebrow">{eyebrow}</p>

          <h1 className="du-title-xl">{title}</h1>

          <p className="du-text-soft">{description}</p>

          {onOpenProfile && (
            <button
              type="button"
              className="du-button du-button-small"
              onClick={onOpenProfile}
            >
              My Profile
            </button>
          )}
        </div>
      </div>

      <div className="du-hero-stats">
        {stats.map((stat) => (
          <div key={stat.label}className="du-hero-stat">
            <span className="du-hero-stat-label">{stat.label}</span>
            <strong className="du-stat-value">{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DashboardHero;
