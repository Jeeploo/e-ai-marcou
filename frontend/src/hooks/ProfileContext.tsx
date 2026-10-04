import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "../types/models";
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
  useEffect(() => {
    document.documentElement.dataset.textSize = profile.textSize;
  }, [profile.textSize]);
  const save = (next: Profile) => {
    setProfile(next);
    try {
      sessionStorage.setItem("marcou:profile", JSON.stringify(next));
    } catch {
      /* In-memory state remains usable when storage is blocked. */
    }
  };
  return (
    <Context.Provider value={{ profile, save }}>{children}</Context.Provider>
  );
}
export function useProfile() {
  const value = useContext(Context);
  if (!value) throw new Error("ProfileProvider ausente");
  return value;
}
