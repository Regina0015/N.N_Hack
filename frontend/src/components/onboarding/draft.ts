import type {
  Budget,
  CycleRegularity,
  Equipment,
  Goal,
  HormonalContraception,
  Level,
  MuscleUnit,
  Profile,
  Sex,
  Supplement,
} from "@/lib/api";

/** Form state: numbers stay as strings so inputs can be empty or use a decimal comma. */
export type Draft = {
  nickname: string;
  age: string;
  sex: Sex;
  heightCm: string;
  weightKg: string;
  skipWeight: boolean;
  bodyFatPercent: string;
  muscleValue: string;
  muscleUnit: MuscleUnit;
  goals: Goal[];
  level: Level | null;
  sports: string[];
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Equipment[];
  injuries: string;
  trackCycle: boolean;
  lastPeriodStart: string;
  averageCycleDays: string;
  periodDays: string;
  regularity: CycleRegularity | null;
  contraception: HormonalContraception | null;
  budget: Budget;
  dietaryRestrictions: string;
  supplements: Supplement[];
};

export const emptyDraft: Draft = {
  nickname: "",
  age: "",
  sex: "unspecified",
  heightCm: "",
  weightKg: "",
  skipWeight: false,
  bodyFatPercent: "",
  muscleValue: "",
  muscleUnit: "kg",
  goals: [],
  level: null,
  sports: [],
  daysPerWeek: 3,
  minutesPerSession: 45,
  equipment: [],
  injuries: "",
  trackCycle: false,
  lastPeriodStart: "",
  averageCycleDays: "",
  periodDays: "",
  regularity: null,
  contraception: null,
  budget: "moderate",
  dietaryRestrictions: "",
  supplements: [],
};

/** "60,5" → 60.5 · "" → null · anything else non-numeric → NaN (rejected by validation). */
export function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? null : Number(normalized);
}

const asText = (value: number | null | undefined) => (value == null ? "" : String(value));

const inRange = (value: number | null, min: number, max: number) =>
  value !== null && Number.isFinite(value) && value >= min && value <= max;

/** Local date as YYYY-MM-DD. */
export const todayIso = () => new Date().toLocaleDateString("en-CA");

export function muscleRange(unit: MuscleUnit): [number, number] {
  return unit === "percent" ? [10, 70] : [5, 150];
}

export function fromProfile(p: Profile): Draft {
  return {
    nickname: p.nickname,
    age: asText(p.age),
    sex: p.sex,
    heightCm: asText(p.height_cm),
    weightKg: asText(p.weight_kg),
    skipWeight: p.weight_kg === null,
    bodyFatPercent: asText(p.body_composition?.body_fat_percent),
    muscleValue: asText(p.body_composition?.muscle_value),
    muscleUnit: p.body_composition?.muscle_unit ?? "kg",
    goals: p.goals,
    level: p.level,
    sports: p.sports,
    daysPerWeek: p.days_per_week,
    minutesPerSession: p.minutes_per_session,
    equipment: p.equipment,
    injuries: p.injuries,
    trackCycle: p.track_cycle,
    lastPeriodStart: p.cycle?.last_period_start ?? "",
    averageCycleDays: asText(p.cycle?.average_cycle_days),
    periodDays: asText(p.cycle?.period_days),
    regularity: p.cycle?.regularity ?? null,
    contraception: p.cycle?.hormonal_contraception ?? null,
    budget: p.budget,
    dietaryRestrictions: p.dietary_restrictions,
    supplements: p.supplements,
  };
}

/** Friendly message for the first problem in a step, or null when the step is valid. */
export function validateStep(step: number, d: Draft): string | null {
  switch (step) {
    case 0: {
      if (!d.nickname.trim()) return "¿Cómo te llamamos? Escribe tu nombre o un apodo 🙂";
      const age = parseNumber(d.age);
      if (!inRange(age, 13, 100) || !Number.isInteger(age)) return "Escribe tu edad en años (entre 13 y 100).";
      return null;
    }
    case 1: {
      if (!inRange(parseNumber(d.heightCm), 100, 250)) return "Escribe tu estatura en centímetros (por ejemplo, 165).";
      if (d.skipWeight) return null;
      const weight = parseNumber(d.weightKg);
      if (weight !== null && !inRange(weight, 25, 350)) return "Revisa tu peso: va en kilos (por ejemplo, 60).";
      const fat = parseNumber(d.bodyFatPercent);
      if (fat !== null && !inRange(fat, 2, 75)) return "El % de grasa corporal debe estar entre 2 y 75.";
      const muscle = parseNumber(d.muscleValue);
      const [low, high] = muscleRange(d.muscleUnit);
      if (muscle !== null && !inRange(muscle, low, high)) {
        return `La masa muscular debe estar entre ${low} y ${high} ${d.muscleUnit === "percent" ? "%" : "kg"}.`;
      }
      return null;
    }
    case 2:
      if (d.goals.length === 0) return "Elige al menos un objetivo.";
      if (!d.level) return "Cuéntanos tu nivel de experiencia.";
      if (d.equipment.length === 0) return "Elige al menos una opción de equipo (puede ser «Solo mi cuerpo»).";
      return null;
    case 3: {
      if (!d.trackCycle) return null;
      if (d.lastPeriodStart && d.lastPeriodStart > todayIso()) return "La fecha de tu último periodo no puede ser en el futuro.";
      const bleeding = parseNumber(d.periodDays);
      if (bleeding !== null && (!inRange(bleeding, 1, 15) || !Number.isInteger(bleeding))) {
        return "¿Cuántos días te dura el sangrado? Escribe un número entre 1 y 15 (lo común es de 2 a 7).";
      }
      const cycle = parseNumber(d.averageCycleDays);
      if (cycle !== null && (!inRange(cycle, 15, 90) || !Number.isInteger(cycle))) {
        return "Tu ciclo se cuenta del primer día de un periodo al primer día del siguiente (lo común es de 21 a 35 días). Escribe un número entre 15 y 90.";
      }
      if (bleeding !== null && cycle !== null && bleeding >= cycle) {
        return "Los días de sangrado son solo una parte del ciclo: deben ser menos que los días entre un periodo y otro.";
      }
      return null;
    }
    default:
      return null;
  }
}

/** Converts a fully validated draft into the API payload. */
export function toProfile(d: Draft): Profile {
  if (!d.level) throw new Error("validateStep(2) must pass before toProfile");
  const bodyFat = d.skipWeight ? null : parseNumber(d.bodyFatPercent);
  const muscle = d.skipWeight ? null : parseNumber(d.muscleValue);
  return {
    nickname: d.nickname.trim(),
    age: Number(parseNumber(d.age)),
    sex: d.sex,
    height_cm: Number(parseNumber(d.heightCm)),
    weight_kg: d.skipWeight ? null : parseNumber(d.weightKg),
    body_composition:
      bodyFat === null && muscle === null
        ? null
        : { body_fat_percent: bodyFat, muscle_value: muscle, muscle_unit: d.muscleUnit },
    goals: d.goals,
    level: d.level,
    sports: d.sports,
    days_per_week: d.daysPerWeek,
    minutes_per_session: d.minutesPerSession,
    equipment: d.equipment,
    injuries: d.injuries.trim(),
    track_cycle: d.trackCycle,
    cycle: d.trackCycle
      ? {
          last_period_start: d.lastPeriodStart || null,
          average_cycle_days: parseNumber(d.averageCycleDays),
          period_days: parseNumber(d.periodDays),
          regularity: d.regularity,
          hormonal_contraception: d.contraception,
        }
      : null,
    budget: d.budget,
    dietary_restrictions: d.dietaryRestrictions.trim(),
    supplements: d.supplements,
  };
}
