function RacesPage() {
  return (
    <section className="mock-page">
      <header className="page-header">
        <p>Race Calendar</p>
        <h1>🏁 Races</h1>
      </header>

      <div className="mock-grid">
        <article className="mock-card">
          <h2>Negev Desert Challenge</h2>
          <p>Three-day desert race across dunes, rocks and open tracks.</p>
          <span>April 15, 2027</span>
        </article>

        <article className="mock-card">
          <h2>Arava Night Sprint</h2>
          <p>Short high-speed night race with festival lights and DJ stage.</p>
          <span>June 8, 2027</span>
        </article>

        <article className="mock-card">
          <h2>Dead Sea Rally Weekend</h2>
          <p>Premium racing weekend with VIP lounge and camping zones.</p>
          <span>September 20, 2027</span>
        </article>
      </div>
    </section>
  )
}

export default RacesPage