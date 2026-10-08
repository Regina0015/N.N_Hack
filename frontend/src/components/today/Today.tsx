"use client";

import Link from "next/link";
import { useNickname, useProfile } from "@/components/shell/ProfileContext";
import Icon, { type IconName } from "@/components/ui/Icon";
import Semi from "@/components/ui/Semi";

function greeting(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Today() {
  const nickname = useNickname();
  const offline = useProfile().status === "offline";
  const now = new Date();
  const date = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-3.5 px-5 pt-6 lg:gap-5 lg:px-10 lg:pt-8">
      <header className="mb-1.5 flex items-start justify-between">
        <div>
          <p suppressHydrationWarning className="text-[15px] font-medium text-mute first-letter:uppercase">
            {date}
          </p>
          <h1 suppressHydrationWarning className="mt-0.5 font-display text-[30px] leading-tight font-semibold lg:text-[38px]">
            {greeting(now.getHours())}
            {nickname && `, ${nickname}`}
          </h1>
        </div>
        <Link
          href="/perfil"
          aria-label="Perfil"
          className="grid size-12 flex-none place-items-center rounded-full bg-coral-soft font-display text-xl font-semibold text-coral-ink"
        >
          {nickname ? nickname[0].toUpperCase() : <Icon name="person" />}
        </Link>
      </header>

      {offline && (
        <p role="alert" className="rounded-2xl bg-coral-soft px-4 py-3 text-[15px] text-coral-ink">
          No pudimos conectar con el servidor. ¿Está corriendo el backend?
        </p>
      )}

      <section className="flex items-start gap-3 rounded-[26px] bg-teal-soft p-4.5 lg:items-center lg:gap-6 lg:p-6.5">
        <Semi size={58} className="lg:hidden" />
        <Semi size={130} className="hidden lg:block" />
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-bold tracking-[.06em] text-teal-ink uppercase">Semi, tu coach</p>
            <p className="mt-0.5 font-display text-xl leading-tight font-semibold lg:text-[26px]">Aquí estoy para ti</p>
          </div>
          <p className="text-[17px] leading-normal text-pretty lg:max-w-140 lg:text-lg">
            Cuéntame cómo te sientes y armamos tu día juntos. Si hoy quieres algo ligero, hazlo sin culpa; si traes
            energía, también está perfecto.
          </p>
          <Link
            href="/coach"
            className="flex h-11.5 w-fit items-center rounded-[14px] bg-teal px-4.5 text-base font-semibold text-on-teal"
          >
            Hablar con Semi
          </Link>
        </div>
      </section>

      <div className="grid gap-3.5 lg:grid-cols-3 lg:gap-5">
        <SoonCard icon="spa" title="Tu sesión de hoy" text="Cuando llegue la Agenda, aquí verás tu entreno del día." />
        <SoonCard icon="restaurant" title="Calorías de hoy" text="Con una foto de tu comida, aquí verás tus calorías y macros." />
        <SoonCard icon="bedtime" title="Tu check-in" text="Pronto podrás contarme cómo dormiste y cómo amaneciste." />
      </div>
    </main>
  );
}

function SoonCard({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <section className="flex gap-3.5 rounded-3xl border-[1.5px] border-dashed border-line2 bg-card p-4.5">
      <span className="grid size-12 flex-none place-items-center rounded-2xl bg-card2 text-mute">
        <Icon name={icon} size={26} />
      </span>
      <div>
        <h2 className="text-[13px] font-semibold tracking-[.06em] text-mute uppercase">{title}</h2>
        <p className="mt-1 text-[15px] leading-snug">{text}</p>
      </div>
    </section>
  );
}
