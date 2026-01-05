import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";
import type { DamageReport } from "../api/types";

type DamageForm = {
  car_brand: string;
  car_model: string;
  vin?: string;
  plate?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  insurer?: string;
  policy_number?: string;
  accident_number?: string;
  accident_date: string;
  accident_location: string;
  damage_type: string;
  message: string;
  damaged_parts: string[];
};

const damageTypes = ["Unfallschaden", "Hagelschaden", "Parkschaden", "Wildschaden", "Vandalismus", "Sonstiges"];
const parts = ["Frontbereich", "Heckbereich", "Linke Seite", "Rechte Seite", "Dach", "Motorhaube", "Kofferraum", "Scheiben"];

export default function DamageWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DamageForm>({
    car_brand: "",
    car_model: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    accident_date: "",
    accident_location: "",
    damage_type: "",
    message: "",
    damaged_parts: [],
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<DamageReport>("/damage-reports/", form);
      if (photoFiles.length) {
        const formData = new FormData();
        photoFiles.slice(0, 5).forEach((file) => formData.append("images", file));
        await api.post(`/damage-reports/${data.id}/upload-photo/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return data;
    },
  });

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    await mutation.mutateAsync();
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

        {step === 1 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Fahrzeugdetails</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rl-input"
                placeholder="Marke"
                value={form.car_brand}
                onChange={(e) => setForm({ ...form, car_brand: e.target.value })}
              />
              <input
                className="rl-input"
                placeholder="Modell"
                value={form.car_model}
                onChange={(e) => setForm({ ...form, car_model: e.target.value })}
              />
            </div>
            <input
              className="rl-input"
              placeholder="VIN"
              value={form.vin || ""}
              onChange={(e) => setForm({ ...form, vin: e.target.value })}
            />
            <input
              className="rl-input"
              placeholder="Kontrollschild (optional)"
              value={form.plate || ""}
              onChange={(e) => setForm({ ...form, plate: e.target.value })}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Personendaten</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rl-input"
                placeholder="Vorname"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
              <input
                className="rl-input"
                placeholder="Nachname"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
            <input
              className="rl-input"
              placeholder="E-Mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="rl-input"
              placeholder="+41 XX XXX XX XX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="rl-input"
              placeholder="Adresse"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Versicherung</h2>
            <input
              className="rl-input"
              placeholder="Versicherungsgesellschaft"
              value={form.insurer || ""}
              onChange={(e) => setForm({ ...form, insurer: e.target.value })}
            />
            <input
              className="rl-input"
              placeholder="Policennummer"
              value={form.policy_number || ""}
              onChange={(e) => setForm({ ...form, policy_number: e.target.value })}
            />
            <input
              className="rl-input"
              placeholder="Schadennummer"
              value={form.accident_number || ""}
              onChange={(e) => setForm({ ...form, accident_number: e.target.value })}
            />
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Schadendetails</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                Unfalldatum
                <input
                  type="date"
                  className="rl-input"
                  value={form.accident_date}
                  onChange={(e) => setForm({ ...form, accident_date: e.target.value })}
                />
              </label>
              <input
                className="rl-input"
                placeholder="Unfallort"
                value={form.accident_location}
                onChange={(e) => setForm({ ...form, accident_location: e.target.value })}
              />
            </div>
            <label className="grid gap-1 text-sm">
              Schadensart
              <select
                className="rl-input"
                value={form.damage_type}
                onChange={(e) => setForm({ ...form, damage_type: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {damageTypes.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-2">
              <div className="text-sm text-muted">Betroffene Teile</div>
              <div className="grid md:grid-cols-2 gap-2">
                {parts.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.damaged_parts.includes(p)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.damaged_parts, p]
                          : form.damaged_parts.filter((x) => x !== p);
                        setForm({ ...form, damaged_parts: next });
                      }}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <textarea
              className="rl-input min-h-[120px]"
              placeholder="Schadenbeschreibung (min. 20 Zeichen)"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <label className="grid gap-1 text-sm">
              Schadensfotos (bis zu 5 Dateien)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => setPhotoFiles(Array.from(e.target.files || []).slice(0, 5))}
              />
              {photoFiles.length > 0 && (
                <div className="text-xs text-muted mt-1">
                  {photoFiles.length} Datei(en) ausgewählt: {photoFiles.map((f) => f.name).join(", ")}
                </div>
              )}
            </label>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Zusammenfassung</h2>
            <div className="bg-surfaceStrong border border-border rounded-fig p-4 grid gap-2 text-sm text-muted">
              <div>
                <strong>Fahrzeug:</strong> {form.car_brand} {form.car_model} ({form.vin || "VIN n/a"})
              </div>
              <div>
                <strong>Kontakt:</strong> {form.first_name} {form.last_name}, {form.email}, {form.phone}
              </div>
              <div>
                <strong>Unfall:</strong> {form.accident_date} · {form.accident_location} · {form.damage_type}
              </div>
              <div>
                <strong>Teile:</strong> {form.damaged_parts.join(", ") || "k.A."}
              </div>
              <div>
                <strong>Beschreibung:</strong> {form.message}
              </div>
              <div>
                <strong>Schadenfotos:</strong> {photoFiles.length ? `${photoFiles.length} Datei(en)` : "keine"}
              </div>
            </div>
            {mutation.isError && <div className="text-red-400">Fehler beim Senden. Bitte prüfen.</div>}
            {mutation.isSuccess && <div className="text-green-400">Schadenmeldung gesendet!</div>}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button className="px-4 py-2 rounded-full border border-border text-sm" onClick={back} disabled={step === 1}>
            Zurück
          </button>
          {step < 5 && (
            <button className="px-4 py-2 rounded-full bg-accent text-white text-sm" onClick={next}>
              Weiter
            </button>
          )}
          {step === 5 && (
            <button className="px-4 py-2 rounded-full bg-accent text-white text-sm" onClick={handleSubmit} disabled={mutation.isLoading}>
              {mutation.isLoading ? "Sende..." : "Absenden"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
