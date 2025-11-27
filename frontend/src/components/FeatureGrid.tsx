type Feature = { title: string; desc: string };

const features: Feature[] = [
  { title: "Karosserie & Lack", desc: "Hochwertige Reparaturen und Lackierungen." },
  { title: "Smart Repair", desc: "Kleine Dellen und Kratzer effizient beheben." },
  { title: "Mietfahrzeuge", desc: "Transporter für Umzug und Lieferung." },
];

export default function FeatureGrid() {
  return (
    <section>
      <div className="rlk-container">
        <h2 style={{ fontSize: "var(--rlk-h2)", fontWeight: 800 }}>Unsere Leistungen</h2>
        <div
          style={{
            marginTop: "var(--rlk-space-6)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--rlk-space-4)",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "var(--rlk-space-4)",
                border: "1px solid #eee",
                borderRadius: "var(--rlk-radius)",
                boxShadow: "var(--rlk-shadow)",
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 700 }}>{f.title}</div>
              <div style={{ color: "var(--rlk-muted)", marginTop: 8 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}