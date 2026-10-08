"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import SummaryCards from "@/components/onboarding/SummaryCards";
import { summarize } from "@/components/onboarding/summary";
import { useProfile } from "@/components/shell/ProfileContext";
import Icon from "@/components/ui/Icon";
import Semi from "@/components/ui/Semi";
import { currentTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

const THEMES: { value: Theme; label: string; icon: "light_mode" | "dark_mode" }[] = [
  { value: "light", label: "Claro", icon: "light_mode" },
  { value: "dark", label: "Oscuro", icon: "dark_mode" },
];

export default function ProfileView() {
  const state = useProfile();
  // The theme lives on <html>; the server render shows no choice selected.
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, currentTheme, () => null);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3.5 px-5 pt-6 lg:pt-8">
      <div className="flex items-center gap-2.5">
        <Link href="/" aria-label="Volver" className="grid size-11 place-items-center rounded-full bg-card lg:hidden">
          <Icon name="arrow_back" />
        </Link>
        <h1 className="font-display text-[26px] font-semibold">Tu perfil</h1>
      </div>

      {state.status === "loading" && <p className="text-mute">Cargando…</p>}
      {state.status === "offline" && (
        <p role="alert" className="rounded-2xl bg-coral-soft px-4 py-3 text-[15px] text-coral-ink">
          No pudimos cargar tu perfil. ¿Está corriendo el backend?
        </p>
      )}
      {state.status === "ready" && (
        <>
          <section className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-soft">
            <span className="grid size-18 flex-none place-items-center rounded-full bg-coral-soft font-display text-3xl font-semibold text-coral-ink">
              {state.profile.nickname[0].toUpperCase()}
            </span>
            <p className="flex-1 font-display text-[22px] font-semibold">{state.profile.nickname}</p>
            <Semi size={52} />
          </section>
          <SummaryCards groups={summarize(state.profile)} editHref={(step) => `/onboarding?paso=${step + 1}`} />
        </>
      )}

      <section className="flex items-center justify-between gap-3 rounded-[22px] bg-card px-4 py-3.5 shadow-soft">
        <h2 className="text-[17px] font-semibold">Tema</h2>
        <div className="flex gap-1 rounded-[14px] bg-card2 p-1">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={theme === t.value}
              onClick={() => setTheme(t.value)}
              className={`flex h-10 items-center gap-1.5 rounded-[10px] px-3.5 text-sm font-semibold ${
                theme === t.value ? "bg-card text-ink shadow-soft" : "text-mute"
              }`}
            >
              <Icon name={t.icon} size={18} />
              {t.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
