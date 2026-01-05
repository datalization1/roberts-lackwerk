export default function About() {
  return (
    <div className="container py-12">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-surface rounded-fig border border-border p-6">
          <h1 className="text-2xl font-semibold mb-2">Über uns</h1>
          <p className="text-muted">
            Robert&apos;s Lackwerk steht für präzise Karosserie- und Lackierarbeiten sowie zuverlässige Transporter-Vermietung. Unser Team
            aus erfahrenen Fachkräften sorgt für schnelle und hochwertige Ergebnisse.
          </p>
        </section>
        <section className="bg-surface rounded-fig border border-border p-6">
          <h2 className="text-xl font-semibold mb-2">Öffnungszeiten</h2>
          <ul className="text-muted space-y-1">
            <li>Mo - Fr: 07:30 - 12:00, 13:00 - 17:30</li>
            <li>Sa: 08:00 - 12:00</li>
            <li>Notfall-Hotline: +41 79 123 45 67 (24/7)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
