"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getProfile, type Profile } from "@/lib/api";

type ProfileState =
  | { status: "loading" }
  | { status: "ready"; profile: Profile }
  | { status: "offline" }; // backend unreachable: pages still render, without personal data

const ProfileContext = createContext<ProfileState>({ status: "loading" });

/** Loads the profile once for every tab; users without one are sent to onboarding. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<ProfileState>({ status: "loading" });

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (profile) setState({ status: "ready", profile });
        else router.replace("/onboarding");
      })
      .catch(() => setState({ status: "offline" }));
  }, [router]);

  return <ProfileContext.Provider value={state}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileState {
  return useContext(ProfileContext);
}

/** Nickname when known, so greetings degrade gracefully while loading or offline. */
export function useNickname(): string | null {
  const state = useProfile();
  return state.status === "ready" ? state.profile.nickname : null;
}
