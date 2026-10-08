import type { Metadata } from "next";
import CoachChat from "@/components/coach/CoachChat";

export const metadata: Metadata = { title: "Coach · Nido" };

export default function CoachPage() {
  return <CoachChat />;
}
