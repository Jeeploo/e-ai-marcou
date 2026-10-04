import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  professionals as samples,
  specialties as sampleSpecialties,
  type Professional,
} from "../data/catalog";
import { catalogApi, demoMode, friendlyError } from "../services/api";
interface Catalog {
  professionals: Professional[];
  specialties: string[];
  loading: boolean;
  error: string;
  reload: () => void;
}
const Context = createContext<Catalog | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] = useState<Professional[]>(
      demoMode ? samples : [],
    ),
    [specialties, setSpecialties] = useState(demoMode ? sampleSpecialties : []),
    [loading, setLoading] = useState(!demoMode),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      catalogApi.professionals(),
      catalogApi.specialties(),
      catalogApi.clinics(),
    ])
      .then(([people, specs, clinics]) => {
        if (!active) return;
        const mapped = people
          .filter((raw) => (raw as Record<string, unknown>).ativo !== false)
          .map((raw) => {
            const p = raw as Record<string, unknown>;
            if (
              typeof p.id !== "string" ||
              typeof p.nome !== "string" ||
              typeof p.valorConsulta !== "number"
            )
              throw new Error("Formato da API incompatível");
            return {
              id: p.id,
              name: p.nome,
              specialty:
                specs.find((s) => s.id === p.especialidadeId)?.nome ||
                "Especialidade não informada",
              clinic:
                clinics.find((c) => c.id === p.clinicaId)?.nome ||
                "Clínica não informada",
              crm: typeof p.crm === "string" ? p.crm : undefined,
              address: clinics
                .filter((c) => c.id === p.clinicaId)
                .map((c) => `${c.endereco}, ${c.cidade} / ${c.uf}`)[0],
              price: p.valorConsulta,
              distance: NaN,
              rating: NaN,
              initials: p.nome
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join(""),
            };
          });
        setProfessionals(mapped);
        setSpecialties(specs.map((s) => s.nome));
      })
      .catch((e) => {
        if (active) setError(friendlyError(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  return (
    <Context.Provider
      value={{
        professionals,
        specialties,
        loading,
        error,
        reload: () => setRevision((r) => r + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCatalog() {
  const context = useContext(Context);
  if (!context) throw new Error("CatalogProvider ausente");
  return context;
}
