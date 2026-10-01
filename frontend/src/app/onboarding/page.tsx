import type { Metadata } from "next";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = {
  title: "Tu perfil · AI Wellness Coach",
};

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col px-4 py-10 sm:px-8">
        <OnboardingForm />
      </main>
    </div>
  );
}
