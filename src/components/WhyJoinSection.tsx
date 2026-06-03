import "../styles/why-join-section.css";

function WhyJoinSection() {
  return (
    <section className="why-join-section">
      <div className="why-join-header">
        <p>Why Join The Club</p>
        <h2>More than racing. A desert community.</h2>
      </div>

      <div className="why-join-grid">
        <article className="why-join-card">
          <span>🏁</span>
          <h3>Desert Racing</h3>
          <p>
            Join powerful racing events inspired by the open roads and wild
            landscapes of the Negev Desert.
          </p>
        </article>

        <article className="why-join-card">
          <span>🎧</span>
          <h3>Festival Energy</h3>
          <p>
            Experience music, lights, camping, friendship and unforgettable
            nights under the desert sky.
          </p>
        </article>

        <article className="why-join-card">
          <span>👑</span>
          <h3>VIP Club</h3>
          <p>
            Become part of an exclusive racing community with future VIP
            memberships, benefits and premium access.
          </p>
        </article>
      </div>
    </section>
  );
}

export default WhyJoinSection;