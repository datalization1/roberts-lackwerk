 export default function Hero() {
  return (
    <section style={{ padding: "80px 0", textAlign: "center" }}>
      <h1 className="rlk-h1">Willkommen bei Robert’s Lackwerk</h1>
      <p className="rlk-lead" style={{ marginTop: 12 }}>
        Schnelle Schadenerfassung & zuverlässige Reparatur – direkt online starten.
      </p>
      <div style={{ marginTop: 24 }}>
        <a className="rlk-btn rlk-btn--primary" href="/schaden/">
          Schaden melden
        </a>
      </div>
    </section>
  );
}