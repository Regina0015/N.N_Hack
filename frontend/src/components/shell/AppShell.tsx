"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import Semi from "@/components/ui/Semi";
import { ProfileProvider } from "./ProfileContext";

type Tab = { href: string; label: string; icon: IconName };

const TABS: Tab[] = [
  { href: "/", label: "Hoy", icon: "today" },
  { href: "/agenda", label: "Agenda", icon: "calendar_month" },
  { href: "/coach", label: "Coach", icon: "forum" },
  { href: "/comida", label: "Comida", icon: "restaurant" },
  { href: "/progreso", label: "Progreso", icon: "insights" },
];
const PROFILE_TAB: Tab = { href: "/perfil", label: "Perfil", icon: "person" };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Bottom tab bar on phones, sidebar on desktop (lg+), as in the Nido design. */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ProfileProvider>
      <div className="flex min-h-dvh flex-1 bg-bg text-ink lg:h-dvh">
        <aside className="hidden w-62 flex-none flex-col gap-1.5 border-r border-line bg-card px-4 py-6 lg:flex">
          <Link href="/" className="flex items-center gap-2.5 px-2.5 pb-5">
            <Semi size={38} />
            <span className="font-display text-[28px] font-semibold text-teal-ink">nido</span>
          </Link>
          {[...TABS, PROFILE_TAB].map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-12.5 items-center gap-3 rounded-[14px] px-3.5 text-base transition-colors ${
                  active ? "bg-teal-soft font-bold text-teal-ink" : "font-medium text-ink hover:bg-card2"
                }`}
              >
                <Icon name={tab.icon} filled={active} />
                {tab.label}
              </Link>
            );
          })}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-24 lg:overflow-y-auto lg:pb-0">{children}</div>

        <nav
          aria-label="Secciones"
          className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-line bg-card px-1.5 pt-2 pb-[max(14px,env(safe-area-inset-bottom))] lg:hidden"
        >
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.75 text-xs ${active ? "font-bold text-teal-ink" : "font-medium text-mute"}`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-2xl ${active ? "bg-teal-soft" : ""}`}>
                  <Icon name={tab.icon} filled={active} />
                </span>
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </ProfileProvider>
  );
}
