import type { Metadata } from "next";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = {
  title: "Tu perfil · Nido",
};

/** `?paso=3` opens step 3 directly (used by "Editar" in Perfil). */
export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { paso } = await searchParams;
  const step = Number(paso) - 1;
  const initialStep = Number.isInteger(step) && step >= 0 && step <= 5 ? step : 0;

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-bg text-ink">
      <OnboardingForm key={initialStep} initialStep={initialStep} />
    </div>
  );
}
