export default function Footer() {
  return (
    <footer className="border-t border-border bg-black text-muted text-sm">
      <div className="container py-4 flex flex-col md:flex-row gap-2 md:gap-0 justify-between">
        <span>© 2025 Robert&apos;s Lackwerk. Alle Rechte vorbehalten.</span>
        <div className="flex gap-4">
          <a href="/impressum" className="hover:text-text">
            Impressum
          </a>
          <a href="/datenschutz" className="hover:text-text">
            Datenschutz
          </a>
        </div>
      </div>
    </footer>
  );
}
