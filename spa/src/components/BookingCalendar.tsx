import type { Booking } from "../api/types";

export function BookingCalendar({ bookings }: { bookings: Booking[] }) {
  // Simple grouped-by-date list (mini-cal)
  const byDate: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    const key = b.date;
    byDate[key] = byDate[key] || [];
    byDate[key].push(b);
  });
  const dates = Object.keys(byDate).sort();

  return (
    <div className="grid gap-2">
      {dates.map((d) => (
        <div key={d} className="border border-border rounded-fig p-3 bg-surface">
          <div className="text-sm font-semibold mb-2">{d}</div>
          <div className="grid gap-1">
            {byDate[d].map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm bg-surfaceStrong px-3 py-2 rounded-fig">
                <div>
                  <div className="font-semibold">
                    {b.transporter_detail?.name || `ID ${b.transporter}`} ({b.time_slot})
                  </div>
                  <div className="text-muted text-xs">
                    {b.customer_name} · {b.pickup_time || "—"} - {b.return_time || "—"}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-border text-muted">{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {dates.length === 0 && <div className="text-muted text-sm">Keine Buchungen im Kalender.</div>}
    </div>
  );
}
