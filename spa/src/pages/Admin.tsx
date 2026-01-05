import { useState } from "react";
import { useAdminAuth } from "../store/auth";
import { AdminTabs } from "../components/AdminTabs";
import {
  useBookings,
  useBookingStatusAction,
  useDamageReports,
  useDamageStatusAction,
} from "../api/admin";
import { useLogout } from "../api/auth";
import { BookingCalendar } from "../components/BookingCalendar";

type TabKey = "dashboard" | "damage" | "bookings";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-900 text-amber-200",
    confirmed: "bg-blue-900 text-blue-200",
    completed: "bg-green-900 text-green-200",
    cancelled: "bg-red-900 text-red-200",
    "in-progress": "bg-blue-900 text-blue-200",
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || "bg-border text-muted"}`}>{status}</span>;
}

function DamageList() {
  const { data, isLoading, isError } = useDamageReports();
  const action = useDamageStatusAction();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = (data || []).filter((d) => {
    const q = search.toLowerCase();
    const matches =
      !q ||
      (d.first_name && d.first_name.toLowerCase().includes(q)) ||
      (d.last_name && d.last_name.toLowerCase().includes(q)) ||
      (d.car_brand && d.car_brand.toLowerCase().includes(q)) ||
      String(d.id).includes(q);
    const statusOk = statusFilter === "all" || d.status === statusFilter;
    return matches && statusOk;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) return <div className="text-muted">Lade Schadenmeldungen...</div>;
  if (isError) return <div className="text-red-400">Fehler beim Laden.</div>;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <input
          className="rl-input max-w-xs"
          placeholder="Suche nach Name/Marke/ID"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="rl-input max-w-xs"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="all">Alle Status</option>
          <option value="pending">pending</option>
          <option value="in-progress">in-progress</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      {items.map((d) => (
        <div key={d.id} className="border border-border rounded-fig p-3 flex flex-col gap-1 bg-surfaceStrong">
          <div className="flex items-center gap-2 justify-between">
            <div className="font-semibold text-sm">SM-{d.id}</div>
            <StatusBadge status={d.status} />
          </div>
          <div className="text-sm text-muted">
            {d.first_name} {d.last_name} · {d.car_brand} {d.car_model} · {d.accident_date}
          </div>
          <div className="flex gap-2 text-xs">
            {["in-progress", "completed", "cancelled"].map((st) => (
              <button
                key={st}
                className="px-3 py-1 rounded-full border border-border hover:border-accent transition"
                onClick={() => action.mutate({ id: d.id, action: st })}
                disabled={action.isLoading}
              >
                {st}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded-full border border-border hover:border-accent transition"
              onClick={() => setExpanded(expanded === d.id ? null : Number(d.id))}
            >
              Details
            </button>
          </div>
          {expanded === d.id && (
            <div className="mt-2 text-xs text-muted grid gap-1">
              <div>Versicherung: {d.insurer || d.other_insurer || "n/a"}</div>
              <div>Schadennummer: {d.accident_number || "n/a"}</div>
              <div>Telefon: {d.phone}</div>
              <div>Beschreibung: {d.message || "–"}</div>
              {d.photos?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {d.photos.map((p) => (
                    <a key={p.id} href={p.image} target="_blank" rel="noreferrer" className="underline text-accent">
                      Foto {p.id}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && <div className="text-muted text-sm">Keine Einträge.</div>}
      <div className="flex items-center gap-2 text-sm text-muted">
        <button
          className="px-3 py-1 rounded border border-border disabled:opacity-60"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Zurück
        </button>
        <span>
          Seite {page} / {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded border border-border disabled:opacity-60"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}

function BookingList() {
  const { data, isLoading, isError } = useBookings();
  const action = useBookingStatusAction();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = (data || []).filter((b) => {
    const q = search.toLowerCase();
    const matches =
      !q ||
      b.customer_name.toLowerCase().includes(q) ||
      String(b.id).includes(q) ||
      (b.transporter_detail?.name || "").toLowerCase().includes(q);
    const statusOk = statusFilter === "all" || b.status === statusFilter;
    return matches && statusOk;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) return <div className="text-muted">Lade Buchungen...</div>;
  if (isError) return <div className="text-red-400">Fehler beim Laden.</div>;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <input
          className="rl-input max-w-xs"
          placeholder="Suche nach Kunde/ID/Fahrzeug"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="rl-input max-w-xs"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="all">Alle Status</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      {items.map((b) => (
        <div key={b.id} className="border border-border rounded-fig p-3 flex flex-col gap-1 bg-surfaceStrong">
          <div className="flex items-center gap-2 justify-between">
            <div className="font-semibold text-sm">BUC-{b.id}</div>
            <StatusBadge status={b.status} />
          </div>
          <div className="text-sm text-muted">
            {b.customer_name} · {b.date} · {b.transporter_detail?.name || `ID ${b.transporter}`}
          </div>
          <div className="flex gap-2 text-xs">
            {["confirmed", "completed", "cancelled"].map((st) => (
              <button
                key={st}
                className="px-3 py-1 rounded-full border border-border hover:border-accent transition"
                onClick={() => action.mutate({ id: b.id, action: st })}
                disabled={action.isLoading}
              >
                {st}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded-full border border-border hover:border-accent transition"
              onClick={() => setExpanded(expanded === b.id ? null : Number(b.id))}
            >
              Details
            </button>
          </div>
          {expanded === b.id && (
            <div className="mt-2 text-xs text-muted grid gap-1">
              <div>Payment: {b.payment_status} ({b.payment_method})</div>
              <div>KM Paket: {b.km_package} · Versicherung: {b.insurance}</div>
              <div>Extras: {b.extras.join(", ") || "Keine"}</div>
              <div>Total: CHF {b.total_price}</div>
              <div>Notizen: {b.additional_notes || "–"}</div>
            </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && <div className="text-muted text-sm">Keine Einträge.</div>}
      <div className="flex items-center gap-2 text-sm text-muted">
        <button
          className="px-3 py-1 rounded border border-border disabled:opacity-60"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Zurück
        </button>
        <span>
          Seite {page} / {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded border border-border disabled:opacity-60"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Weiter
        </button>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Kalender (Gruppiert nach Datum)</h3>
        <BookingCalendar bookings={filtered} />
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAuthed } = useAdminAuth();
  const logout = useLogout();
  const [tab, setTab] = useState<TabKey>("damage");

  if (!isAuthed) {
    return (
      <div className="container py-12 max-w-md">
        <div className="bg-surface border border-border rounded-fig p-6 grid gap-3">
          <h1 className="text-xl font-semibold">Admin geschützt</h1>
          <p className="text-muted text-sm">
            Bitte zuerst einloggen. Dieser Guard ist aktuell ein Placeholder; echte Session/JWT folgt.
          </p>
          <a className="px-4 py-2 rounded-full bg-accent text-white text-sm text-center" href="/admin/login">
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <button
          className="text-sm text-muted hover:text-white disabled:opacity-60"
          onClick={() => logout.mutate()}
          disabled={logout.isLoading}
        >
          Logout
        </button>
      </div>

      <AdminTabs active={tab} onChange={(k) => setTab(k)} />

      {tab === "damage" && <DamageList />}
      {tab === "bookings" && <BookingList />}
      {tab === "dashboard" && (
        <div className="text-muted text-sm">Dashboard folgt (Statistiken, KPIs). Wähle oben Schadenmeldungen/Buchungen.</div>
      )}
    </div>
  );
}
