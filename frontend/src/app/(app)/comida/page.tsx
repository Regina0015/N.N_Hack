import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Comida · Nido" };

export default function ComidaPage() {
  return (
    <ComingSoon
      title="Comida"
      text="Aquí vas a tomarle foto a tu comida para estimar calorías y macros, y recibir ideas ricas que quepan en tu bolsillo."
    />
  );
}
