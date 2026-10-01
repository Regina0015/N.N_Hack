import type { Budget, Equipment, Goal, Level, Sex, Supplement } from "@/lib/api";

export type Option<T> = { value: T; label: string };

export const SEXES: Option<Sex>[] = [
  { value: "female", label: "Mujer" },
  { value: "male", label: "Hombre" },
  { value: "unspecified", label: "Prefiero no decir" },
];

export const GOALS: Option<Goal>[] = [
  { value: "build_muscle", label: "Ganar músculo" },
  { value: "lose_fat", label: "Bajar grasa" },
  { value: "maintain", label: "Mantenerme" },
  { value: "more_energy", label: "Tener más energía" },
  { value: "sport_performance", label: "Rendir mejor en mi deporte" },
];

export const LEVELS: Option<Level>[] = [
  { value: "beginner", label: "Estoy empezando" },
  { value: "intermediate", label: "Ya entreno seguido" },
  { value: "advanced", label: "Tengo mucha experiencia" },
];

export const EQUIPMENT: Option<Equipment>[] = [
  { value: "full_gym", label: "Gimnasio completo" },
  { value: "dumbbells", label: "Mancuernas" },
  { value: "bands", label: "Ligas o bandas" },
  { value: "bodyweight", label: "Solo mi cuerpo" },
];

export const BUDGETS: Option<Budget>[] = [
  { value: "tight", label: "Económico 💸" },
  { value: "moderate", label: "Normal" },
  { value: "flexible", label: "Flexible" },
];

export const SUPPLEMENTS: Option<Supplement>[] = [
  { value: "protein", label: "Proteína" },
  { value: "creatine", label: "Creatina" },
  { value: "pre_workout", label: "Preentreno" },
];

export const SPORT_SUGGESTIONS = [
  "Fútbol",
  "Básquetbol",
  "Correr",
  "Natación",
  "Ciclismo",
  "Voleibol",
  "Tenis",
  "Yoga",
  "Baile",
  "Box",
];

export const DAYS = [1, 2, 3, 4, 5, 6, 7];
export const MINUTES = [15, 30, 45, 60, 75, 90, 120];

export const MAX_GOALS = 3;
export const MAX_SPORTS = 8;

export function labelOf<T>(options: Option<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? String(value);
}
