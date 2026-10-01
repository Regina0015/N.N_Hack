"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getProfile, saveProfile } from "@/lib/api";
import { emptyDraft, fromProfile, muscleRange, toProfile, todayIso, validateStep, type Draft } from "./draft";
import { Choice, ChoiceGroup, NumberInput, TextArea, TextInput, Toggle } from "./fields";
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
  labelOf,
} from "./options";

const STEPS = [
  { emoji: "👋", title: "¡Hola! Conozcámonos", subtitle: "Así tu coach puede hablarte como tú quieras." },
  { emoji: "🌱", title: "Tu cuerpo hoy", subtitle: "Solo para calcular lo que necesitas. Aquí no hay juicios." },
  { emoji: "🏃", title: "Tu movimiento", subtitle: "Cuéntanos qué te gusta y cuánto tiempo tienes." },
  { emoji: "💛", title: "Cuidarte", subtitle: "Para que tu coach se adapte a ti, y no al revés." },
  { emoji: "🍽️", title: "Tu comida", subtitle: "Ideas que quepan en tu día y en tu bolsillo." },
  { emoji: "✨", title: "¡Todo listo!", subtitle: "Revisa que todo esté bien. Puedes cambiarlo cuando quieras." },
];
const LAST_STEP = STEPS.length - 1;

/** Adds or removes `item`; adding is skipped once the list reaches `max`. */
function toggle<T>(list: T[], item: T, max = Infinity): T[] {
  if (list.includes(item)) return list.filter((x) => x !== item);
  return list.length < max ? [...list, item] : list;
}

export default function OnboardingForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showBodyComposition, setShowBodyComposition] = useState(false);
  const [customSport, setCustomSport] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (!profile) return;
        setDraft(fromProfile(profile));
        setEditing(true);
        setShowBodyComposition(profile.body_composition !== null);
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

  function goNext() {
    const problem = validateStep(step, draft);
    setError(problem);
    if (!problem) setStep(step + 1);
  }

  function goBack() {
    setError(null);
    setStep(step - 1);
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      await saveProfile(toProfile(draft));
      router.push("/");
    } catch {
      setError("No pudimos guardar tu perfil. Revisa tu conexión e inténtalo de nuevo.");
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

  if (loading) return <p className="text-sm text-zinc-500">Cargando…</p>;

  const current = STEPS[step];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Paso {step + 1} de {STEPS.length}
          </span>
          {editing && (
            <Link href="/" className="font-medium text-teal-700 hover:underline dark:text-teal-400">
              Cancelar
            </Link>
          )}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          <span aria-hidden>{current.emoji}</span> {current.title}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{current.subtitle}</p>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        {step === 0 && (
          <>
            <TextInput
              id="nickname"
              label="¿Cómo quieres que te diga tu coach?"
              placeholder="Tu nombre o un apodo"
              maxLength={40}
              value={draft.nickname}
              onChange={(v) => update("nickname", v)}
            />
            <NumberInput id="age" label="Edad" suffix="años" integer value={draft.age} onChange={(v) => update("age", v)} />
            <ChoiceGroup legend="Sexo" hint="Solo lo usamos para estimar tus calorías.">
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
              placeholder="165"
              value={draft.heightCm}
              onChange={(v) => update("heightCm", v)}
            />
            {!draft.skipWeight && (
              <NumberInput
                id="weight"
                label="Peso"
                hint="Ingresa tu peso total. Solo lo usamos para calcular tus necesidades y puedes cambiarlo cuando quieras."
                suffix="kg"
                value={draft.weightKg}
                onChange={(v) => update("weightKg", v)}
              />
            )}
            <Toggle
              id="skip-weight"
              label="Prefiero no ponerlo por ahora"
              hint={
                draft.skipWeight
                  ? "¡Está bien! Tu coach te dará guías generales, sin metas basadas en tu peso."
                  : undefined
              }
              checked={draft.skipWeight}
              onChange={(v) => update("skipWeight", v)}
            />
            {!draft.skipWeight && (
              <div className="flex flex-col gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <button
                  type="button"
                  aria-expanded={showBodyComposition}
                  onClick={() => setShowBodyComposition(!showBodyComposition)}
                  className="text-left text-sm font-medium text-teal-700 dark:text-teal-400"
                >
                  {showBodyComposition ? "▾" : "▸"} ¿Tienes un análisis como InBody? (opcional)
                </button>
                {showBodyComposition && (
                  <>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Tu reporte (InBody u otra báscula) suele mostrar tu % de grasa corporal y tu masa muscular, en kg
                      o en %. Si no lo tienes, no pasa nada.
                    </p>
                    <NumberInput
                      id="body-fat"
                      label="% de grasa corporal"
                      suffix="%"
                      value={draft.bodyFatPercent}
                      onChange={(v) => update("bodyFatPercent", v)}
                    />
                    <NumberInput
                      id="muscle"
                      label="Masa muscular"
                      hint={`Entre ${muscleRange(draft.muscleUnit).join(" y ")} ${draft.muscleUnit === "percent" ? "%" : "kg"}.`}
                      value={draft.muscleValue}
                      onChange={(v) => update("muscleValue", v)}
                    />
                    <ChoiceGroup legend="Mi reporte la da en">
                      <Choice selected={draft.muscleUnit === "kg"} onClick={() => update("muscleUnit", "kg")}>
                        kg
                      </Choice>
                      <Choice selected={draft.muscleUnit === "percent"} onClick={() => update("muscleUnit", "percent")}>
                        %
                      </Choice>
                    </ChoiceGroup>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <ChoiceGroup legend="¿Qué te gustaría lograr?" hint={`Elige hasta ${MAX_GOALS}.`}>
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
            <ChoiceGroup legend="Tu experiencia en el gym">
              {LEVELS.map((o) => (
                <Choice key={o.value} selected={draft.level === o.value} onClick={() => update("level", o.value)}>
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="¿Practicas algún deporte? (opcional)">
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
            <div className="flex gap-2">
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
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={addCustomSport}
                className="rounded-xl border border-teal-600 px-4 text-sm font-medium text-teal-700 dark:text-teal-400"
              >
                Agregar
              </button>
            </div>
            <ChoiceGroup legend="¿Cuántos días a la semana puedes entrenar?">
              {DAYS.map((n) => (
                <Choice key={n} selected={draft.daysPerWeek === n} onClick={() => update("daysPerWeek", n)}>
                  {n}
                </Choice>
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="¿Cuánto tiempo por sesión?">
              {MINUTES.map((n) => (
                <Choice key={n} selected={draft.minutesPerSession === n} onClick={() => update("minutesPerSession", n)}>
                  {n} min
                </Choice>
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="¿Con qué equipo cuentas?">
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
            <TextArea
              id="injuries"
              label="¿Alguna lesión o molestia que deba cuidar? (opcional)"
              placeholder="Por ejemplo: me duele la rodilla al correr"
              maxLength={500}
              value={draft.injuries}
              onChange={(v) => update("injuries", v)}
            />
            <Toggle
              id="track-cycle"
              label="Si menstrúas, ¿quieres que tu coach tome en cuenta tu ciclo?"
              hint="Tu energía puede cambiar en cada fase, y está bien. Es opcional."
              checked={draft.trackCycle}
              onChange={(v) => update("trackCycle", v)}
            />
            {draft.trackCycle && (
              <div className="flex flex-col gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="last-period" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    ¿Cuándo empezó tu último periodo? (opcional)
                  </label>
                  <input
                    id="last-period"
                    type="date"
                    max={todayIso()}
                    value={draft.lastPeriodStart}
                    onChange={(e) => update("lastPeriodStart", e.target.value)}
                    className="w-fit rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
                <NumberInput
                  id="cycle-days"
                  label="¿Cada cuántos días suele llegar? (opcional)"
                  suffix="días"
                  placeholder="28"
                  integer
                  value={draft.averageCycleDays}
                  onChange={(v) => update("averageCycleDays", v)}
                />
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <ChoiceGroup legend="Tu presupuesto para comida">
              {BUDGETS.map((o) => (
                <Choice key={o.value} selected={draft.budget === o.value} onClick={() => update("budget", o.value)}>
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
            <TextInput
              id="restrictions"
              label="¿Alguna restricción o alergia? (opcional)"
              placeholder="Por ejemplo: vegetariana, intolerancia a la lactosa"
              maxLength={300}
              value={draft.dietaryRestrictions}
              onChange={(v) => update("dietaryRestrictions", v)}
            />
            <ChoiceGroup legend="¿Ya usas alguno de estos? (opcional)">
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

        {step === LAST_STEP && <Summary draft={draft} />}
      </section>

      {error && (
        <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </p>
      )}

      <nav className="flex justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Atrás
          </button>
        ) : (
          <span />
        )}
        {step < LAST_STEP ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="rounded-full bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Guardando…" : editing ? "Guardar cambios" : "¡Listo, vamos! 🚀"}
          </button>
        )}
      </nav>
    </div>
  );
}

function Summary({ draft }: { draft: Draft }) {
  const items: [string, ReactNode][] = [
    ["👤", `${draft.nickname.trim()}, ${draft.age} años`],
    ["📏", `${draft.heightCm} cm · ${draft.skipWeight || !draft.weightKg ? "peso sin compartir" : `${draft.weightKg} kg`}`],
    ["🎯", draft.goals.map((g) => labelOf(GOALS, g)).join(", ")],
    ["🏋️", `${draft.level ? labelOf(LEVELS, draft.level) : ""} · ${draft.daysPerWeek} días × ${draft.minutesPerSession} min`],
    ["🧰", draft.equipment.map((e) => labelOf(EQUIPMENT, e)).join(", ")],
  ];
  if (!draft.skipWeight && (draft.bodyFatPercent || draft.muscleValue)) {
    const parts = [
      draft.bodyFatPercent && `${draft.bodyFatPercent}% grasa`,
      draft.muscleValue && `${draft.muscleValue}${draft.muscleUnit === "percent" ? "%" : " kg"} músculo`,
    ];
    items.push(["🧬", parts.filter(Boolean).join(" · ")]);
  }
  if (draft.sports.length) items.push(["⚽", draft.sports.join(", ")]);
  if (draft.injuries.trim()) items.push(["🩹", draft.injuries.trim()]);
  if (draft.trackCycle) items.push(["🌙", "Tu coach tomará en cuenta tu ciclo"]);
  items.push(["💸", `Presupuesto: ${labelOf(BUDGETS, draft.budget)}`]);
  if (draft.dietaryRestrictions.trim()) items.push(["🥗", draft.dietaryRestrictions.trim()]);
  if (draft.supplements.length) items.push(["🥤", draft.supplements.map((s) => labelOf(SUPPLEMENTS, s)).join(", ")]);

  return (
    <ul className="flex flex-col gap-3 text-sm text-zinc-800 dark:text-zinc-200">
      {items.map(([icon, text]) => (
        <li key={icon} className="flex gap-3">
          <span aria-hidden>{icon}</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
