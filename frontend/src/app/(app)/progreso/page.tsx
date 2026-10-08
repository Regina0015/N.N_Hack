import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Progreso · Nido" };

export default function ProgresoPage() {
  return (
    <ComingSoon
      title="Progreso"
      text="Aquí vas a ver tu semana: movimiento, sueño y ánimo, y cómo Semi crece con tus hábitos."
    />
  );
}
