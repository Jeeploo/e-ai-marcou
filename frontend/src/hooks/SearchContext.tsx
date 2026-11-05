import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { coordinates, type Coordinates } from "../services/location";
export type Reference = {
  id: string;
  label: string;
  source: "saved" | "device";
  coordinates: Coordinates;
};
export const demoReferences: Reference[] = [
  {
    id: "casa",
    label: "Minha casa",
    source: "saved",
    coordinates: { latitude: -8.115, longitude: -34.895 },
  },
  {
    id: "mainha",
    label: "Casa de Mainha",
    source: "saved",
    coordinates: { latitude: -8.025, longitude: -34.915 },
  },
];
const Context = createContext<{
  reference?: Reference;
  setReference: (r: Reference | undefined) => void;
  paraQuem: "mim" | "outra_pessoa";
  setParaQuem: (p: "mim" | "outra_pessoa") => void;
} | null>(null);
export function SearchProvider({ children }: { children: ReactNode }) {
  const [reference, updateReference] = useState<Reference | undefined>(() => {
    try {
      const r = JSON.parse(
        sessionStorage.getItem("marcou:reference") || "null",
      );
      return r?.source === "saved" &&
        typeof r.id === "string" &&
        typeof r.label === "string" &&
        coordinates(r.coordinates?.latitude, r.coordinates?.longitude)
        ? r
        : undefined;
    } catch {
      return undefined;
    }
  });
  const setReference = useCallback((r: Reference | undefined) => {
    updateReference(r);
    try {
      if (r?.source === "saved")
        sessionStorage.setItem("marcou:reference", JSON.stringify(r));
      else sessionStorage.removeItem("marcou:reference");
    } catch {
      /* Estado em memória continua disponível. */
    }
  }, []);
  const [paraQuem, setParaQuem] = useState<"mim" | "outra_pessoa">("mim");
  return (
    <Context.Provider
      value={{ reference, setReference, paraQuem, setParaQuem }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSearchContext() {
  const c = useContext(Context);
  if (!c) throw Error("SearchProvider ausente");
  return c;
}
