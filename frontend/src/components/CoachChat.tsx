"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  clearChatHistory,
  getChatHistory,
  getHealth,
  getProfile,
  sendChat,
  type ChatMessage,
  type HealthResponse,
} from "@/lib/api";

type Status = { kind: "loading" } | { kind: "ok"; health: HealthResponse } | { kind: "down" };

export default function CoachChat() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [nickname, setNickname] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then((health) => setStatus({ kind: "ok", health }))
      .catch(() => setStatus({ kind: "down" }));
    getProfile()
      .then((profile) => {
        if (profile) setNickname(profile.nickname);
        else router.replace("/onboarding");
      })
      .catch(() => {}); // backend down: the status badge already says so
    getChatHistory()
      .then((history) => setMessages(history.map(({ role, content }) => ({ role, content }))))
      .catch(() => {});
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const before = messages;
    const next: ChatMessage[] = [...before, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    setError(null);
    try {
      const { reply } = await sendChat(text);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      // The backend only saves a turn after a reply, so put the text back for a retry.
      setMessages(before);
      setInput(text);
      setError("No se pudo contactar al coach. ¿Está corriendo el backend?");
    } finally {
      setSending(false);
    }
  }

  async function onClear() {
    if (!window.confirm("¿Empezar una conversación nueva? El coach olvidará este chat.")) return;
    try {
      await clearChatHistory();
      setMessages([]);
      setError(null);
    } catch {
      setError("No se pudo borrar la conversación.");
    }
  }

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <StatusBadge status={status} />
        <div className="flex items-center gap-4">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              disabled={sending}
              className="text-xs font-medium text-zinc-500 hover:underline disabled:opacity-50"
            >
              Nueva conversación
            </button>
          )}
          {nickname && (
            <Link href="/onboarding" className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400">
              Editar perfil
            </Link>
          )}
        </div>
      </div>

      <div className="flex min-h-64 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">
            {nickname && `Hola, ${nickname} 👋 `}
            Prueba: “Arma una rutina de 3 días, juego fútbol los sábados y tengo mancuernas”.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
              m.role === "user"
                ? "self-end bg-teal-600 text-white"
                : "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && <p className="self-start text-sm text-zinc-500">El coach está escribiendo…</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escríbele a tu coach…"
          className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status.kind === "loading") {
    return <span className="text-xs text-zinc-500">Conectando con el backend…</span>;
  }
  if (status.kind === "down") {
    return <span className="text-xs font-medium text-red-600">● Backend sin conexión</span>;
  }
  return status.health.mock_mode ? (
    <span className="text-xs font-medium text-amber-600">● Backend conectado · modo simulado (sin Nebius)</span>
  ) : (
    <span className="text-xs font-medium text-teal-600">● Backend conectado · Nemotron activo</span>
  );
}
