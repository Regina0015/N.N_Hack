import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { SummaryGroup } from "./summary";

/** One card per onboarding step; "Editar" either jumps to that step (onboarding) or links to it (Perfil). */
export default function SummaryCards({
  groups,
  onEdit,
  editHref,
}: {
  groups: SummaryGroup[];
  onEdit?: (step: number) => void;
  editHref?: (step: number) => string;
}) {
  return groups.map((g) => (
    <section key={g.step} className="flex flex-col gap-2 rounded-[22px] bg-card px-4 py-3.5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold">
          <Icon name={g.icon} size={22} className="text-teal-ink" />
          {g.title}
        </h2>
        {editHref ? (
          <Link
            href={editHref(g.step)}
            className="flex h-10 items-center rounded-xl bg-teal-soft px-3.5 text-sm font-semibold text-teal-ink"
          >
            Editar
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onEdit?.(g.step)}
            className="flex h-10 items-center rounded-xl bg-teal-soft px-3.5 text-sm font-semibold text-teal-ink"
          >
            Editar
          </button>
        )}
      </div>
      {g.rows.map((r) => (
        <div key={r.k} className="flex justify-between gap-3 text-[15px] leading-snug">
          <span className="flex-none text-mute">{r.k}</span>
          <span className="text-right font-medium">{r.v}</span>
        </div>
      ))}
    </section>
  ));
}
