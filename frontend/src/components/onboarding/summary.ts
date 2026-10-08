import type { IconName } from "@/components/ui/Icon";
import type { Profile } from "@/lib/api";
import { BUDGETS, EQUIPMENT, GOALS, LEVELS, SEXES, SUPPLEMENTS, labelOf } from "./options";

export type SummaryGroup = { step: number; title: string; icon: IconName; rows: { k: string; v: string }[] };

const list = (items: string[], empty = "Ninguno") => (items.length ? items.join(", ") : empty);

/** Profile grouped by onboarding step, shown in Perfil and in the last onboarding step. */
export function summarize(p: Profile): SummaryGroup[] {
  const bc = p.body_composition;
  const analysis = [
    bc?.body_fat_percent != null && `${bc.body_fat_percent} % grasa`,
    bc?.muscle_value != null && `${bc.muscle_value}${bc.muscle_unit === "percent" ? " %" : " kg"} músculo`,
  ].filter(Boolean);

  return [
    {
      step: 0,
      title: "Hola",
      icon: "waving_hand",
      rows: [
        { k: "Apodo", v: p.nickname },
        { k: "Edad", v: `${p.age} años` },
        { k: "Sexo", v: labelOf(SEXES, p.sex) },
      ],
    },
    {
      step: 1,
      title: "Tu cuerpo",
      icon: "accessibility_new",
      rows: [
        { k: "Estatura", v: `${p.height_cm} cm` },
        { k: "Peso", v: p.weight_kg == null ? "Prefiero no ponerlo" : `${p.weight_kg} kg` },
        ...(analysis.length ? [{ k: "Análisis", v: analysis.join(" · ") }] : []),
      ],
    },
    {
      step: 2,
      title: "Tu movimiento",
      icon: "directions_run",
      rows: [
        { k: "Objetivos", v: p.goals.map((g) => labelOf(GOALS, g)).join(", ") },
        { k: "Nivel", v: labelOf(LEVELS, p.level) },
        { k: "Deportes", v: list(p.sports) },
        { k: "Ritmo", v: `${p.days_per_week} días · ${p.minutes_per_session} min` },
        { k: "Equipo", v: p.equipment.map((e) => labelOf(EQUIPMENT, e)).join(", ") },
      ],
    },
    {
      step: 3,
      title: "Cuidarte",
      icon: "favorite",
      rows: [
        { k: "Lesiones", v: p.injuries || "Ninguna" },
        { k: "Ciclo", v: p.track_cycle ? "Tomarlo en cuenta" : "No" },
      ],
    },
    {
      step: 4,
      title: "Comida",
      icon: "restaurant",
      rows: [
        { k: "Presupuesto", v: labelOf(BUDGETS, p.budget) },
        { k: "Restricciones", v: p.dietary_restrictions || "Ninguna" },
        { k: "Suplementos", v: list(p.supplements.map((s) => labelOf(SUPPLEMENTS, s))) },
      ],
    },
  ];
}
