export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type HealthResponse = { status: string; mock_mode: boolean };

export type ChatResponse = { reply: string; mock: boolean };

export type StoredMessage = ChatMessage & { created_at: string };

// Mirrors backend/app/schemas.py
export type Sex = "female" | "male" | "unspecified";
export type Goal = "build_muscle" | "lose_fat" | "maintain" | "more_energy" | "sport_performance";
export type Level = "beginner" | "intermediate" | "advanced";
export type Equipment = "full_gym" | "dumbbells" | "bands" | "bodyweight";
export type Budget = "tight" | "moderate" | "flexible";
export type Supplement = "protein" | "creatine" | "pre_workout";
export type MuscleUnit = "kg" | "percent";
export type CycleRegularity = "regular" | "irregular" | "unsure";
export type HormonalContraception = "no" | "yes" | "prefer_not";
export type CycleInfo = {
  last_period_start: string | null;
  average_cycle_days: number | null;
  period_days: number | null;
  regularity: CycleRegularity | null;
  hormonal_contraception: HormonalContraception | null;
};

export type Profile = {
  nickname: string;
  age: number;
  sex: Sex;
  height_cm: number;
  weight_kg: number | null;
  body_composition: {
    body_fat_percent: number | null;
    muscle_value: number | null;
    muscle_unit: MuscleUnit;
  } | null;
  goals: Goal[];
  level: Level;
  sports: string[];
  days_per_week: number;
  minutes_per_session: number;
  equipment: Equipment[];
  injuries: string;
  track_cycle: boolean;
  cycle: CycleInfo | null;
  budget: Budget;
  dietary_restrictions: string;
  supplements: Supplement[];
};

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

/** Sends only the new message; the backend stores the conversation and adds earlier turns as context. */
export async function sendChat(message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/coach/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}

export async function getChatHistory(): Promise<StoredMessage[]> {
  const res = await fetch(`${API_URL}/api/coach/history`);
  if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
  return (await res.json()).messages;
}

export async function clearChatHistory(): Promise<void> {
  const res = await fetch(`${API_URL}/api/coach/history`, { method: "DELETE" });
  if (!res.ok) throw new Error(`History clear failed: ${res.status}`);
}

/** Returns null when the user has not completed onboarding yet. */
export async function getProfile(): Promise<Profile | null> {
  const res = await fetch(`${API_URL}/api/profile`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`Profile save failed: ${res.status}`);
  return res.json();
}
