import { Link } from "react-router-dom";
import { Hammer, Paintbrush, ShieldCheck, Truck } from "lucide-react";

function ServiceCard({
  icon,
  title,
  description,
  bullets,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <article className="bg-surfaceStrong border border-border rounded-fig p-4 flex flex-col gap-2">
      <div className="w-12 h-12 rounded-xl bg-accentSoft text-accent grid place-items-center">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted text-sm">{description}</p>
      <ul className="text-muted text-sm grid gap-1 pl-5 list-disc">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </article>
  );
}

export default function Home() {
  return (
    <div className="bg-background">
      <section className="container py-12">
        <div className="relative overflow-hidden rounded-fig border border-border bg-gradient-to-br from-[#220b0d] via-[#120607] to-[#0a0a0a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.15),transparent_35%)]" />
          <div className="relative px-8 py-12 grid gap-4 max-w-3xl">
            <p className="uppercase tracking-[0.08em] text-xs text-rose-200">
              Professionelle Karosseriereparatur &amp; Transporter-Vermietung
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Fachkundige Lackiererei für unfallbeschädigte Fahrzeuge &amp; zuverlässige Umzugs-Transporter in der Schweiz
            </h1>
            <p className="text-rose-100 text-base max-w-2xl">
              Wir kümmern uns um die vollständige Instandsetzung Ihres Fahrzeugs und stellen Ihnen bei Bedarf sofort einen
              passenden Transporter zur Verfügung – effizient, gesetzeskonform und zuverlässig.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/damage-report"
                className="px-5 py-3 rounded-full bg-accent text-white font-semibold text-sm shadow-lg shadow-red-900/30"
              >
                Schaden melden
              </Link>
              <Link
                to="/truck-rental"
                className="px-5 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10"
              >
                Transporter mieten
              </Link>
            </div>
            <div className="text-rose-200 text-sm pt-1">Unfallreparaturen · Versicherungsabwicklung · Lackierungen · Umzugs-Transporter</div>
          </div>
        </div>
      </section>

      <section className="container pb-12">
        <header className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Unsere Dienstleistungen</h2>
          <p className="text-muted">Umfassende Autoreparatur- und Vermietungslösungen nach Ihren Bedürfnissen</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ServiceCard
            icon={<Hammer size={22} />}
            title="Karosseriereparatur"
            description="Professionelle Instandsetzung von Unfallschäden an der Karosserie."
            bullets={["Unfallschadenbehebung", "Dellenentfernung", "Schweissarbeiten", "Rahmenrichtarbeiten"]}
          />
          <ServiceCard
            icon={<Paintbrush size={22} />}
            title="Autolackierung"
            description="Fachgerechte Lackierarbeiten mit modernster Technik und Präzision."
            bullets={["Komplettlackierungen", "Spot-Repair", "Farbton-Anpassung", "Lackversiegelung"]}
          />
          <ServiceCard
            icon={<ShieldCheck size={22} />}
            title="Versicherungsunterstützung"
            description="Direkte Zusammenarbeit mit allen grossen Versicherungen."
            bullets={["Direktabrechnung", "Schadengutachten", "Schadensmeldungen", "Gesetzeskonforme Dokumentation"]}
          />
          <ServiceCard
            icon={<Truck size={22} />}
            title="Transporter-Vermietung"
            description="Zuverlässige Umzugs-Transporter für jeden Bedarf."
            bullets={["Verschiedene Grössen", "Flexible Mietzeiten", "Gut gewartete Flotte", "Faire Preise"]}
          />
        </div>
      </section>
    </div>
  );
}
