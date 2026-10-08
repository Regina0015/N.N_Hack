import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = { title: "Perfil · Nido" };

export default function PerfilPage() {
  return <ProfileView />;
}
