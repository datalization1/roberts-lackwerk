type AdminTabKey = "dashboard" | "damage" | "bookings";

export function AdminTabs({ active, onChange }: { active: AdminTabKey; onChange: (k: AdminTabKey) => void }) {
  const tabs: { key: AdminTabKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "damage", label: "Schadenmeldungen" },
    { key: "bookings", label: "Buchungen" },
  ];

  return (
    <div className="flex gap-2 border-b border-border mb-4">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`px-4 py-2 rounded-t-md text-sm ${
            active === t.key ? "bg-surfaceStrong text-white border border-border border-b-0" : "text-muted hover:text-text"
          }`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
