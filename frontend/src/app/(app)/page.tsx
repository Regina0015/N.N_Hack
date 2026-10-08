import type { Metadata } from "next";
import Today from "@/components/today/Today";

export const metadata: Metadata = { title: "Hoy · Nido" };

export default function HoyPage() {
  return <Today />;
}
