"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNickname } from "@/components/shell/ProfileContext";
import Icon from "@/components/ui/Icon";
import Semi from "@/components/ui/Semi";
import {
  clearChatHistory,
  getChatHistory,
  getHealth,
  sendChat,
  type ChatMessage,
  type HealthResponse,
} from "@/lib/api";

type Status = { kind: "loading" } | { kind: "ok"; health: HealthResponse } | { kind: "down" };

const QUICK_PROMPTS = ["Arma mi rutina de hoy", "¿Qué ceno hoy?", "Me molesta la rodilla"];

export default function CoachChat() {
  const nickname = useNickname();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHealth()
      .then((health) => setStatus({ kind: "ok", health }))
      .catch(() => setStatus({ kind: "down" }));
    getChatHistory()
      .then((history) => setMessages(history.map(({ role, content }) => ({ role, content }))))
      .catch(() => {}); // backend down: the status line already says so
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, sending]);

  async function send(text: string) {
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
      setError("No pude contactar a Semi. ¿Está corriendo el backend?");
    } finally {
      setSending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    send(input.trim());
  }

  async function onClear() {
    if (!window.confirm("¿Empezar una conversación nueva? Semi olvidará este chat.")) return;
    try {
      await clearChatHistory();
      setMessages([]);
      setError(null);
    } catch {
      setError("No se pudo borrar la conversación.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      <header className="sticky top-0 z-[5] flex items-center gap-3 border-b border-line bg-bg px-5 pt-4 pb-3.5 lg:pt-6">
        <span className="grid size-12.5 flex-none place-items-center rounded-full bg-teal-soft">
          <Semi size={40} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold">Semi</h1>
          <p className="text-sm text-mute">Te sugiere; tú decides.</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            disabled={sending}
            aria-label="Nueva conversación"
            title="Nueva conversación"
            className="grid size-11 place-items-center rounded-full bg-card text-mute disabled:opacity-50"
          >
            <Icon name="restart_alt" />
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-4 pb-3">
        <StatusLine status={status} />
        {messages.length === 0 && (
          <Bubble from="assistant">
            {nickname ? `¡Hola, ${nickname}! ` : "¡Hola! "}
            Soy Semi. Puedo armarte una rutina, darte ideas de comida o ajustar tu día según cómo te sientas. ¿Por
            dónde empezamos?
          </Bubble>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} from={m.role}>
            {m.content}
          </Bubble>
        ))}
        {sending && <p className="self-start rounded-[20px] bg-card px-3.75 py-3 text-[15px] text-mute">Semi está escribiendo…</p>}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-24 bg-bg lg:bottom-0">
        {error && (
          <p role="alert" className="mx-4 mb-1 rounded-2xl bg-coral-soft px-4 py-2.5 text-[15px] text-coral-ink">
            {error}
          </p>
        )}
        <div className="flex gap-2 overflow-x-auto px-4 pt-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => send(prompt)}
              disabled={sending}
              className="h-10 flex-none rounded-full border-[1.5px] border-teal px-3.5 text-sm font-semibold text-teal-ink disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 pt-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escríbele a Semi…"
            aria-label="Mensaje para Semi"
            maxLength={4000}
            className="h-13 min-w-0 flex-1 rounded-[26px] border-[1.5px] border-line2 bg-card px-4.5 text-base outline-none focus:border-teal"
          />
          <button
            type="submit"
            aria-label="Enviar"
            disabled={sending || !input.trim()}
            className="grid size-13 flex-none place-items-center rounded-full bg-teal text-on-teal disabled:opacity-50"
          >
            <Icon name="arrow_upward" />
          </button>
        </form>
        <p className="px-4 pt-1.5 pb-2 text-center text-xs text-mute">Semi no sustituye a un profesional de la salud.</p>
      </div>
    </main>
  );
}

function Bubble({ from, children }: { from: ChatMessage["role"]; children: ReactNode }) {
  return from === "user" ? (
    <div className="max-w-[80%] self-end rounded-[20px_20px_6px_20px] bg-teal px-3.75 py-3 text-base leading-normal whitespace-pre-wrap text-on-teal">
      {children}
    </div>
  ) : (
    <div className="max-w-[84%] self-start rounded-[20px_20px_20px_6px] bg-card px-3.75 py-3 text-base leading-normal whitespace-pre-wrap text-pretty shadow-soft">
      {children}
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "loading") return null;
  if (status.kind === "down") {
    return <p className="text-center text-xs font-semibold text-coral-ink">● Sin conexión con el backend</p>;
  }
  return status.health.mock_mode ? (
    <p className="text-center text-xs font-semibold text-coral-ink">● Modo simulado (sin Nebius)</p>
  ) : (
    <p className="text-center text-xs font-semibold text-teal-ink">● Nemotron activo</p>
  );
}
