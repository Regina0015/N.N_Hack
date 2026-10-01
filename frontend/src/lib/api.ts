export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type HealthResponse = { status: string; mock_mode: boolean };

export type ChatResponse = { reply: string; mock: boolean };

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function sendChat(messages: ChatMessage[]): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/coach/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}
