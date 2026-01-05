import { useMemo, useState } from "react";
import { useMetaOptions } from "../api/meta";
import { useCreateBooking, useTransporters, useVehicles } from "../api/bookings";
import type { Booking } from "../api/types";

type BookingForm = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  driver_license_number: string;
  transporter_id?: string;
  vehicle_id?: string;
  pickup_date: string;
  return_date: string;
  pickup_time: string;
  return_time: string;
  km_package: string;
  insurance: string;
  extras: string[];
  notes?: string;
};

const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00"];

export default function BookingWizard() {
  const { data: meta } = useMetaOptions();
  const { data: transporters } = useTransporters();
  const { data: vehicles } = useVehicles();
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState<BookingForm>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    driver_license_number: "",
    pickup_date: "",
    return_date: "",
    pickup_time: "08:00",
    return_time: "16:00",
    km_package: "100km",
    insurance: "basic",
    extras: [],
  });

  const mutation = useCreateBooking();

  const computedPrice = useMemo(() => {
    if (!meta || !form.pickup_date || !form.return_date) return 0;
    const start = new Date(form.pickup_date);
    const end = new Date(form.return_date);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const km = Number(meta.km_packages.prices[form.km_package] || 0);
    const insurance = Number(meta.insurance.prices[form.insurance] || 0) * days;
    const extras = form.extras.reduce((sum, code) => sum + Number(meta.extras[code] || 0), 0);
    const transporterPrice =
      transporters?.find((t) => String(t.id) === String(form.transporter_id))?.preis_chf || "100";
    const base = Number(transporterPrice) * days || 100 * days;
    return base + km + insurance + extras;
  }, [meta, form, transporters]);

  const toggleExtra = (code: string) => {
    setForm((prev) => {
      const has = prev.extras.includes(code);
      return { ...prev, extras: has ? prev.extras.filter((x) => x !== code) : [...prev.extras, code] };
    });
  };

  const next = () => {
    // Simple client-side guards
    if (step === 1) {
      if (!form.transporter_id) {
        setLocalError("Bitte wählen Sie einen Transporter.");
        return;
      }
      if (!form.pickup_date || !form.return_date) {
        setLocalError("Bitte Abhol- und Rückgabedatum angeben.");
        return;
      }
    }
    if (step === 4) {
      if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.driver_license_number) {
        setLocalError("Bitte Kundendaten vollständig ausfüllen.");
        return;
      }
    }
    setLocalError(null);
    setStep((s) => Math.min(5, s + 1));
  };
  const back = () => {
    setLocalError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setLocalError(null);
    try {
      await mutation.mutateAsync({
        ...form,
        date: form.pickup_date,
        time_slot: "FULLDAY",
        transporter: Number(form.transporter_id),
        vehicle: form.vehicle_id ? Number(form.vehicle_id) : undefined,
      });
    } catch (err: any) {
      const detail = err?.response?.data || "Unbekannter Fehler";
      setLocalError(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  };

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto bg-surface border border-border rounded-fig p-6 grid gap-4">
        <div className="flex justify-between items-center text-sm text-muted">
          <span>Schritt {step} von 5</span>
          <span>{Math.round((step / 5) * 100)}% abgeschlossen</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
        {localError && <div className="text-red-400 text-sm">{localError}</div>}

        {step === 1 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Mietdetails & Fahrzeug</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1 text-sm">
                <span className="text-muted">Transporter auswählen</span>
                <div className="grid gap-2">
                  {transporters?.map((t) => (
                    <label
                      key={t.id}
                      className={`border rounded-fig p-3 cursor-pointer ${
                        form.transporter_id === String(t.id) ? "border-accent" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="transporter"
                          checked={form.transporter_id === String(t.id)}
                          onChange={() => setForm({ ...form, transporter_id: String(t.id) })}
                        />
                        <div>
                          <div className="font-semibold">{t.name}</div>
                          <div className="text-muted text-xs">
                            Kennzeichen {t.kennzeichen} · CHF {t.preis_chf}/Tag
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                  {!transporters && <div className="text-muted text-sm">Lade Transporter...</div>}
                </div>
              </div>
              <div className="grid gap-1 text-sm">
                <span className="text-muted">Fahrzeug (optional)</span>
                <select
                  className="rl-input"
                  value={form.vehicle_id || ""}
                  onChange={(e) => setForm({ ...form, vehicle_id: e.target.value || undefined })}
                >
                  <option value="">Kein spezifisches Fahrzeug</option>
                  {vehicles?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.license_plate})
                    </option>
                  ))}
                </select>
                {!vehicles && <div className="text-muted text-xs">Lade Fahrzeuge...</div>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                Abholdatum
                <input
                  type="date"
                  className="rl-input"
                  value={form.pickup_date}
                  onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Rückgabedatum
                <input
                  type="date"
                  className="rl-input"
                  value={form.return_date}
                  onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                Abholzeit
                <select
                  className="rl-input"
                  value={form.pickup_time}
                  onChange={(e) => setForm({ ...form, pickup_time: e.target.value })}
                >
                  {timeSlots.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Rückgabezeit
                <select
                  className="rl-input"
                  value={form.return_time}
                  onChange={(e) => setForm({ ...form, return_time: e.target.value })}
                >
                  {timeSlots.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Pakete & Versicherung</h2>
            <label className="grid gap-1 text-sm">
              Kilometerpaket
              <select
                className="rl-input"
                value={form.km_package}
                onChange={(e) => setForm({ ...form, km_package: e.target.value })}
              >
                {meta &&
                  Object.keys(meta.km_packages.prices).map((k) => (
                    <option key={k} value={k}>
                      {k} ({meta.km_packages.descriptions[k]}) +CHF {meta.km_packages.prices[k]}
                    </option>
                  ))}
                {!meta && <option>Lade Optionen...</option>}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Versicherung
              <select
                className="rl-input"
                value={form.insurance}
                onChange={(e) => setForm({ ...form, insurance: e.target.value })}
              >
                {meta &&
                  Object.keys(meta.insurance.prices).map((k) => (
                    <option key={k} value={k}>
                      {meta.insurance.descriptions[k]} +CHF {meta.insurance.prices[k]}
                    </option>
                  ))}
                {!meta && <option>Lade Optionen...</option>}
              </select>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Extras</h2>
            <div className="grid md:grid-cols-2 gap-2">
            {meta &&
              Object.entries(meta.extras).map(([code, price]) => (
                <label
                  key={code}
                  className={`border rounded-fig p-3 text-sm cursor-pointer ${form.extras.includes(code) ? "border-accent" : "border-border"}`}
                >
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.extras.includes(code)} onChange={() => toggleExtra(code)} />
                    <div className="flex flex-col">
                      <span className="font-semibold capitalize">{code}</span>
                      <span className="text-muted">CHF {price}</span>
                    </div>
                  </div>
                </label>
              ))}
            {!meta && <div className="text-muted text-sm">Lade Extras...</div>}
            </div>
            <textarea
              className="rl-input min-h-[120px]"
              placeholder="Weitere Hinweise (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Kundendaten</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rl-input"
                placeholder="Vollständiger Name"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
              <input
                className="rl-input"
                placeholder="E-Mail"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              />
            </div>
            <input
              className="rl-input"
              placeholder="+41 XX XXX XX XX"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            />
            <input
              className="rl-input"
              placeholder="Adresse"
              value={form.customer_address}
              onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
            />
            <input
              className="rl-input"
              placeholder="Führerscheinnummer"
              value={form.driver_license_number}
              onChange={(e) => setForm({ ...form, driver_license_number: e.target.value })}
            />
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Zahlung (Stripe Test)</h2>
            <div className="bg-surfaceStrong border border-border rounded-fig p-4 grid gap-2 text-sm text-muted">
              <div>
                <strong>Mietzeitraum:</strong> {form.pickup_date} bis {form.return_date}
              </div>
              <div>
                <strong>Pakete:</strong> {form.km_package}, Versicherung {form.insurance}
              </div>
              <div>
                <strong>Extras:</strong> {form.extras.join(", ") || "Keine"}
              </div>
              <div className="text-lg font-semibold text-white">Gesamt: CHF {computedPrice.toFixed(2)}</div>
            </div>
            <div className="text-muted text-sm">
              Stripe-Anbindung folgt serverseitig via PaymentIntent. Dieser Schritt erstellt vorerst nur die Buchung mit Status "pending".
            </div>
            {mutation.isError && <div className="text-red-400 text-sm">{String((mutation.error as any)?.message || "Fehler beim Senden.")}</div>}
            {mutation.isSuccess && <div className="text-green-400 text-sm">Buchung erstellt! (Payment folgt)</div>}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button className="px-4 py-2 rounded-full border border-border text-sm" onClick={back} disabled={step === 1}>
            Zurück
          </button>
          {step < 5 && (
            <button
              className="px-4 py-2 rounded-full bg-accent text-white text-sm disabled:opacity-60"
              onClick={next}
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Bitte warten..." : "Weiter"}
            </button>
          )}
          {step === 5 && (
            <button
              className="px-4 py-2 rounded-full bg-accent text-white text-sm disabled:opacity-60"
              onClick={handleSubmit}
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Sende..." : "Buchen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
