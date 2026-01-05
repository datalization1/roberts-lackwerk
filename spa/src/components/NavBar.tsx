import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Startseite" },
  { to: "/damage-report", label: "Schadenmeldung" },
  { to: "/truck-rental", label: "Vermietung" },
  { to: "/about", label: "Über uns" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-black/70 border-b border-border">
      <div className="container flex items-center h-14 gap-6">
        <Link to="/" className="font-semibold text-lg">
          Robert&apos;s Lackwerk
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition ${isActive ? "bg-accent text-white" : "text-muted hover:text-text"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto">
          <Link
            to="/damage-report"
            className="px-4 py-2 rounded-full bg-accent text-white font-semibold text-sm hover:brightness-110 transition"
          >
            Jetzt starten
          </Link>
        </div>
      </div>
    </header>
  );
}
