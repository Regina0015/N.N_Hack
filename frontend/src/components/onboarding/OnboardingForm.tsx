"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Semi from "@/components/ui/Semi";
import { getProfile, saveProfile } from "@/lib/api";
import { emptyDraft, fromProfile, muscleRange, toProfile, todayIso, validateStep, type Draft } from "./draft";
import { Checkbox, Choice, ChoiceGroup, NumberInput, OptionalBadge, TextArea, TextInput } from "./fields";
import {
  BUDGETS,
  DAYS,
  EQUIPMENT,
  GOALS,
  LEVELS,
  MAX_GOALS,
  MAX_SPORTS,
  MINUTES,
  SEXES,
  SPORT_SUGGESTIONS,
  SUPPLEMENTS,
} from "./options";
import { summarize } from "./summary";
import SummaryCards from "./SummaryCards";

const STEPS = [
  { name: "Hola", title: "¡Hola!", subtitle: "Cuéntanos un poquito de ti. Solo lo que quieras." },
  { name: "Tu cuerpo", title: "Tu cuerpo", subtitle: "Solo para calcular tu energía. Nadie más lo ve." },
  { name: "Tu movimiento", title: "Tu movimiento", subtitle: "Armamos un plan que quepa en tu vida." },
  { name: "Cuidarte", title: "Cuidarte", subtitle: "Ambas secciones son opcionales. Las usamos para cuidarte mejor." },
  { name: "Comida", title: "Comida", subtitle: "Ideas ricas que se acomoden a tu bolsillo." },
  { name: "Resumen", title: "Así te conocemos", subtitle: "Toca «Editar» si quieres cambiar algo." },
];
const LAST_STEP = STEPS.length - 1;

/** Adds or removes `item`; adding is skipped once the list reaches `max`. */
function toggle<T>(list: T[], item: T, max = Infinity): T[] {
  if (list.includes(item)) return list.filter((x) => x !== item);
  return list.length < max ? [...list, item] : list;
}

/** First step with a problem, so saving can jump straight to it. */
function firstInvalidStep(draft: Draft): { step: number; problem: string } | null {
  for (let step = 0; step < LAST_STEP; step++) {
    const problem = validateStep(step, draft);
    if (problem) return { step, problem };
  }
  return null;
}

export default function OnboardingForm({ initialStep = 0 }: { initialStep?: number }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [customSport, setCustomSport] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (!profile) return;
        setDraft(fromProfile(profile));
        setEditing(true);
      })
      .catch(() => setError("No pudimos conectar con el servidor. Puedes llenar tus datos y lo intentamos al final."))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  /** Derives the new value from the latest state, so consecutive updates never overwrite each other. */
  function updateWith<K extends keyof Draft>(key: K, change: (value: Draft[K]) => Draft[K]) {
    setDraft((current) => ({ ...current, [key]: change(current[key]) }));
  }

  function goTo(target: number) {
    setError(null);
    setStep(target);
  }

  function goNext() {
    const problem = validateStep(step, draft);
    setError(problem);
    if (!problem) setStep(step + 1);
  }

  async function save() {
    const invalid = firstInvalidStep(draft);
    if (invalid) {
      setStep(invalid.step);
      setError(invalid.problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveProfile(toProfile(draft));
      if (editing) router.push("/perfil");
      else setWelcomed(true);
    } catch {
      setError("No pudimos guardar tu perfil. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function addCustomSport() {
    const sport = customSport.trim();
    if (sport) {
      updateWith("sports", (sports) =>
        sports.some((s) => s.toLowerCase() === sport.toLowerCase()) ? sports : toggle(sports, sport, MAX_SPORTS),
      );
    }
    setCustomSport("");
  }

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <Semi size={96} asleep />
      </div>
    );
  }

  if (welcomed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4.5 bg-teal-soft px-8 text-center">
        <Semi size={180} />
        <h1 className="font-display text-[32px] leading-tight font-semibold">¡Te damos la bienvenida, {draft.nickname.trim()}!</h1>
        <p className="max-w-72 text-lg leading-normal">Semi ya brotó. Va a crecer contigo cada vez que te cuides, a tu ritmo.</p>
        <Link href="/" className="mt-2 flex h-14 items-center rounded-[18px] bg-teal px-8 text-lg font-semibold text-on-teal">
          Ir a Hoy
        </Link>
      </div>
    );
  }

  const current = STEPS[step];
  const withSemi = step === 0 || step === LAST_STEP;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <header className="sticky top-0 z-[5] flex flex-col gap-3 bg-bg px-5 pt-4 pb-3.5">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} aria-label="Atrás" className="grid size-11 place-items-center rounded-full bg-card">
              <Icon name="arrow_back" />
            </button>
          ) : editing ? (
            <Link href="/perfil" aria-label="Cerrar" className="grid size-11 place-items-center rounded-full bg-card">
              <Icon name="close" />
            </Link>
          ) : (
            <span className="w-11" />
          )}
          <span className="text-[15px] font-semibold text-mute">
            Paso {step + 1} de {STEPS.length} · {current.name}
          </span>
          <span className="w-11" />
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {STEPS.map((s, i) =>
            editing ? (
              <button
                key={s.name}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a ${s.name}`}
                className={`h-2 rounded-full transition-colors ${i <= step ? "bg-teal" : "bg-line2"}`}
              />
            ) : (
              <div key={s.name} className={`h-2 rounded-full transition-colors ${i <= step ? "bg-teal" : "bg-line2"}`} />
            ),
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5.5 px-5 pt-2 pb-8">
        <div className="flex items-center gap-3.5">
          {withSemi && <Semi size={72} stage={step === 0 ? 1 : 2} />}
          <div>
            <h1 className="font-display text-[28px] leading-tight font-semibold">{current.title}</h1>
            <p className="mt-1 text-base leading-snug text-mute">{current.subtitle}</p>
          </div>
        </div>

        {step === 0 && (
          <>
            <TextInput
              id="nickname"
              label="Apodo"
              placeholder="¿Cómo te decimos?"
              maxLength={40}
              value={draft.nickname}
              onChange={(v) => update("nickname", v)}
            />
            <NumberInput id="age" label="Edad" placeholder="Ej. 21" integer value={draft.age} onChange={(v) => update("age", v)} />
            <ChoiceGroup legend="Sexo" hint="Nos ayuda a ajustar estimaciones. Puedes cambiarlo cuando quieras.">
              {SEXES.map((o) => (
                <Choice key={o.value} selected={draft.sex === o.value} onClick={() => update("sex", o.value)}>
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
          </>
        )}

        {step === 1 && (
          <>
            <NumberInput
              id="height"
              label="Estatura"
              suffix="cm"
              placeholder="162"
              value={draft.heightCm}
              onChange={(v) => update("heightCm", v)}
            />
            <div className="flex flex-col gap-2.5">
              <div className={draft.skipWeight ? "pointer-events-none opacity-45" : ""}>
                <NumberInput
                  id="weight"
                  label="Ingresa tu peso total"
                  suffix="kg"
                  placeholder="Ej. 61"
                  value={draft.skipWeight ? "" : draft.weightKg}
                  onChange={(v) => update("weightKg", v)}
                />
              </div>
              <Checkbox label="Prefiero no ponerlo" checked={draft.skipWeight} onChange={(v) => update("skipWeight", v)} />
              {draft.skipWeight && (
                <p className="text-sm leading-snug text-mute">¡Está bien! Semi te dará guías generales, sin metas basadas en tu peso.</p>
              )}
            </div>
            {!draft.skipWeight && (
              <section className="flex flex-col gap-3.5 rounded-[22px] border-[1.5px] border-dashed border-line2 bg-card p-4.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[17px] font-semibold">¿Tienes un análisis como InBody?</h2>
                  <OptionalBadge />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput
                    id="body-fat"
                    label="% de grasa"
                    placeholder="27"
                    value={draft.bodyFatPercent}
                    onChange={(v) => update("bodyFatPercent", v)}
                  />
                  <NumberInput
                    id="muscle"
                    label="Masa muscular"
                    placeholder="24"
                    value={draft.muscleValue}
                    onChange={(v) => update("muscleValue", v)}
                  />
                </div>
                <div className="flex items-center justify-end gap-2.5">
                  <span className="text-sm text-mute">Masa muscular en</span>
                  <div className="flex gap-0.75 rounded-xl bg-card2 p-0.75">
                    {(["kg", "percent"] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        aria-pressed={draft.muscleUnit === unit}
                        onClick={() => update("muscleUnit", unit)}
                        className={`h-9.5 min-w-13 rounded-[10px] text-[15px] font-semibold ${
                          draft.muscleUnit === unit ? "bg-teal text-on-teal" : "text-ink"
                        }`}
                      >
                        {unit === "kg" ? "kg" : "%"}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-snug text-mute">
                  Tu reporte suele mostrar tu masa muscular en kg o en % (entre {muscleRange(draft.muscleUnit).join(" y ")}
                  {draft.muscleUnit === "percent" ? " %" : " kg"}). Si no lo tienes, no pasa nada.
                </p>
              </section>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <ChoiceGroup
              legend="Objetivos"
              aside={
                <span className="text-sm font-semibold text-teal-ink">
                  {draft.goals.length} de {MAX_GOALS}
                </span>
              }
            >
              {GOALS.map((o) => (
                <Choice
                  key={o.value}
                  selected={draft.goals.includes(o.value)}
                  onClick={() => updateWith("goals", (goals) => toggle(goals, o.value, MAX_GOALS))}
                >
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="Nivel" grid="grid-cols-3">
              {LEVELS.map((o) => (
                <Choice key={o.value} square selected={draft.level === o.value} onClick={() => update("level", o.value)}>
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="Deportes que disfrutas">
              {[...SPORT_SUGGESTIONS, ...draft.sports.filter((s) => !SPORT_SUGGESTIONS.includes(s))].map((sport) => (
                <Choice
                  key={sport}
                  selected={draft.sports.includes(sport)}
                  onClick={() => updateWith("sports", (sports) => toggle(sports, sport, MAX_SPORTS))}
                >
                  {sport}
                </Choice>
              ))}
            </ChoiceGroup>
            <div className="-mt-2 flex gap-2">
              <input
                aria-label="Otro deporte"
                value={customSport}
                onChange={(e) => setCustomSport(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSport();
                  }
                }}
                placeholder="¿Otro? Escríbelo aquí"
                maxLength={40}
                className="h-11.5 min-w-0 flex-1 rounded-full border-[1.5px] border-line2 bg-card px-4 text-[15px] outline-none focus:border-teal"
              />
              <button
                type="button"
                onClick={addCustomSport}
                className="h-11.5 rounded-full border-[1.5px] border-teal px-4 text-[15px] font-semibold text-teal-ink"
              >
                Agregar
              </button>
            </div>
            <ChoiceGroup legend="Días por semana" grid="grid-cols-7">
              {DAYS.map((n) => (
                <Choice key={n} square selected={draft.daysPerWeek === n} onClick={() => update("daysPerWeek", n)}>
                  {n}
                </Choice>
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="Minutos por sesión" grid="grid-cols-4">
              {MINUTES.map((n) => (
                <Choice key={n} square selected={draft.minutesPerSession === n} onClick={() => update("minutesPerSession", n)}>
                  {n}
                </Choice>
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="Equipo que tienes">
              {EQUIPMENT.map((o) => (
                <Choice
                  key={o.value}
                  selected={draft.equipment.includes(o.value)}
                  onClick={() => updateWith("equipment", (equipment) => toggle(equipment, o.value))}
                >
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
          </>
        )}

        {step === 3 && (
          <>
            <section className="flex flex-col gap-3 rounded-[22px] bg-card p-4.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-semibold">Lesiones o molestias</h2>
                <OptionalBadge />
              </div>
              <TextArea
                id="injuries"
                label="Cuéntanos qué debemos cuidar"
                placeholder="Ej. me duele la rodilla al bajar escaleras"
                maxLength={500}
                value={draft.injuries}
                onChange={(v) => update("injuries", v)}
              />
            </section>
            <section className="flex flex-col gap-3 rounded-[22px] bg-lav-soft p-4.5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[17px] font-semibold">
                  <Icon name="water_drop" size={22} className="text-lav-ink" />
                  Ciclo menstrual
                </h2>
                <OptionalBadge tone="lav" />
              </div>
              <p className="text-[15px] leading-snug">¿Quieres que ajustemos intensidad y sugerencias según tu ciclo?</p>
              <div className="flex flex-wrap gap-2">
                <Choice tone="lav" selected={draft.trackCycle} onClick={() => update("trackCycle", true)}>
                  Sí, tomarlo en cuenta
                </Choice>
                <Choice tone="lav" selected={!draft.trackCycle} onClick={() => update("trackCycle", false)}>
                  Ahora no
                </Choice>
              </div>
              {draft.trackCycle && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="last-period" className="text-base font-semibold">
                      Último periodo
                    </label>
                    <input
                      id="last-period"
                      type="date"
                      max={todayIso()}
                      value={draft.lastPeriodStart}
                      onChange={(e) => update("lastPeriodStart", e.target.value)}
                      className="h-13.5 w-full rounded-2xl border-[1.5px] border-line2 bg-card px-3 text-base text-ink outline-none focus:border-teal"
                    />
                  </div>
                  <NumberInput
                    id="cycle-days"
                    label="Dura (días)"
                    placeholder="28"
                    integer
                    value={draft.averageCycleDays}
                    onChange={(v) => update("averageCycleDays", v)}
                  />
                </div>
              )}
            </section>
          </>
        )}

        {step === 4 && (
          <>
            <ChoiceGroup legend="Presupuesto para comida" grid="grid-cols-3">
              {BUDGETS.map((o) => (
                <Choice key={o.value} square selected={draft.budget === o.value} onClick={() => update("budget", o.value)}>
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
            <TextInput
              id="restrictions"
              label="Restricciones o alergias"
              placeholder="Ej. vegetariana, sin lácteos"
              maxLength={300}
              value={draft.dietaryRestrictions}
              onChange={(v) => update("dietaryRestrictions", v)}
            />
            <ChoiceGroup legend="Suplementos que ya usas">
              {SUPPLEMENTS.map((o) => (
                <Choice
                  key={o.value}
                  selected={draft.supplements.includes(o.value)}
                  onClick={() => updateWith("supplements", (supplements) => toggle(supplements, o.value))}
                >
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
          </>
        )}

        {step === LAST_STEP && <SummaryCards groups={summarize(toProfile(draft))} onEdit={goTo} />}
      </main>

      <footer className="sticky bottom-0 flex flex-col gap-2.5 border-t border-line bg-bg px-5 pt-3.5 pb-[max(20px,env(safe-area-inset-bottom))]">
        {error && (
          <p role="alert" className="rounded-2xl bg-coral-soft px-4 py-3 text-[15px] text-coral-ink">
            {error}
          </p>
        )}
        <div className="flex gap-2.5">
          {editing && step < LAST_STEP && (
            <button
              type="button"
              onClick={goNext}
              className="h-14 rounded-[18px] border-[1.5px] border-line2 bg-card px-5.5 text-[17px] font-semibold"
            >
              Siguiente
            </button>
          )}
          {editing || step === LAST_STEP ? (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="h-14 flex-1 rounded-[18px] bg-teal text-lg font-semibold text-on-teal disabled:opacity-50"
            >
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "¡Listo!"}
            </button>
          ) : (
            <button type="button" onClick={goNext} className="h-14 flex-1 rounded-[18px] bg-teal text-lg font-semibold text-on-teal">
              Siguiente
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
