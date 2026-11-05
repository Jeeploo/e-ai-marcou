import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "../types/models";
import { useAccessibilityStore } from "../accessibility-module";
const initial: Profile = {
  patient: {
    nome: "Lucas Ferreira",
    email: "lucas.ferreira@example.com",
    cpf: "",
    nascimento: "",
    celular: "",
  },
  addresses: [],
  notifications: {
    WhatsApp: true,
    SMS: true,
    Push: true,
    "E-mails promocionais": false,
  },
  textSize: "normal",
  signedOut: false,
};
const Context = createContext<{
  profile: Profile;
  save: (profile: Profile) => void;
} | null>(null);
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const raw = JSON.parse(
        sessionStorage.getItem("marcou:profile") || "null",
      );
      return raw &&
        typeof raw.patient?.nome === "string" &&
        Array.isArray(raw.addresses)
        ? { ...initial, ...raw }
        : initial;
    } catch {
      return initial;
    }
  });
  const textSize = useAccessibilityStore((state) => state.textSize);
  useEffect(() => {
    // The widget hydrates the new preferences before this parent effect runs.
    // Only migrate the legacy preference when no new record exists.
    try {
      if (
        !localStorage.getItem("marcou:a11y:v1") &&
        profile.textSize === "large"
      ) {
        useAccessibilityStore.getState().updateValue("textSize", 125);
      }
    } catch {
      // Storage restrictions must not prevent using the controls in memory.
    }
  }, []);
  const currentProfile: Profile = {
    ...profile,
    textSize: textSize > 100 ? "large" : "normal",
  };
  const save = (next: Profile) => {
    if (next.textSize !== currentProfile.textSize) {
      useAccessibilityStore
        .getState()
        .updateValue("textSize", next.textSize === "large" ? 125 : 100);
    }
    setProfile(next);
    try {
      sessionStorage.setItem("marcou:profile", JSON.stringify(next));
    } catch {
      /* In-memory state remains usable when storage is blocked. */
    }
  };
  return (
    <Context.Provider value={{ profile: currentProfile, save }}>
      {children}
    </Context.Provider>
  );
}
export function useProfile() {
  const value = useContext(Context);
  if (!value) throw new Error("ProfileProvider ausente");
  return value;
}
