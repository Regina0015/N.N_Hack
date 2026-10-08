import Semi from "./Semi";

/** Placeholder for tabs whose feature is not built yet; says plainly what is coming. */
export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pt-8 lg:px-10 lg:pt-10">
      <h1 className="font-display text-[30px] leading-tight font-semibold">{title}</h1>
      <div className="flex flex-col items-center gap-4 rounded-[26px] border-[1.5px] border-dashed border-line2 bg-card px-6 py-10 text-center">
        <Semi size={96} asleep />
        <p className="font-display text-xl font-semibold">Semi está preparando esta sección</p>
        <p className="max-w-80 text-base leading-relaxed text-mute">{text}</p>
      </div>
    </main>
  );
}
