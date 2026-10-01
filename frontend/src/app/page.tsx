import CoachChat from "@/components/CoachChat";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Coach de Bienestar con IA
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Tu entrenador personal que se adapta a tu cuerpo, tu energía y tu bolsillo.
          </p>
        </header>
        <CoachChat />
      </main>
    </div>
  );
}
