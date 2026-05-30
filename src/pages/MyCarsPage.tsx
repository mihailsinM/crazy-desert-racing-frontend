import "../styles/mock-pages.css";
import "../styles/animations.css";

function MyCarsPage() {
  return (
    <section className="mock-page">
      <header className="page-header">
        <p>Garage</p>
        <h1>🏎 My Cars</h1>
      </header>

      <div className="mock-grid">
        <article className="mock-card">
          <h2>Desert Storm GT</h2>
          <p>BMW M4 prepared for desert sprint races.</p>
          <span>420 HP</span>
        </article>

        <article className="mock-card">
          <h2>Sand Hunter</h2>
          <p>Off-road buggy with reinforced suspension.</p>
          <span>580 HP</span>
        </article>

        <article className="mock-card add-card">
          <h2>+ Add New Car</h2>
          <p>Connect your next racing vehicle to your driver profile.</p>
          <span>Coming soon</span>
        </article>
      </div>
    </section>
  );
}

export default MyCarsPage;
