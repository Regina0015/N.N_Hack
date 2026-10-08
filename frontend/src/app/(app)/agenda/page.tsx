import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Agenda · Nido" };

export default function AgendaPage() {
  return (
    <ComingSoon
      title="Agenda"
      text="Aquí vas a programar tus entrenos y caminatas, marcarlos como hechos o moverlos a otro día, sin culpa."
    />
  );
}
