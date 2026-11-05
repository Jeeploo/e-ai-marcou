import { useEffect, type ReactNode } from "react";
import { useDeviceLocation } from "../hooks/useLocation";
import { useProfile } from "../hooks/ProfileContext";
import { demoReferences, useSearchContext } from "../hooks/SearchContext";
import { coordinates } from "../services/location";
export default function SearchReference({
  compact = false,
  children,
}: {
  compact?: boolean;
  children?: ReactNode;
}) {
  const { reference, setReference, paraQuem, setParaQuem } = useSearchContext();
  const { profile } = useProfile();
  const gps = useDeviceLocation();
  const saved = profile.addresses.flatMap((a) => {
    const c = coordinates(a.latitude, a.longitude);
    return c
      ? [
          {
            id: a.id,
            label: a.nome || a.tipo,
            source: "saved" as const,
            coordinates: c,
          },
        ]
      : [];
  });
  const options = [...demoReferences, ...saved];
  useEffect(() => {
    if (gps.position)
      setReference({
        id: "device",
        label: "Localização atual",
        source: "device",
        coordinates: gps.position,
      });
  }, [gps.position, setReference]);
  return (
    <div
      className={`location-controls${compact ? " location-controls-compact" : ""}`}
    >
      <label>
        Buscar perto de
        <select
          value={reference?.id || ""}
          onChange={(e) =>
            setReference(options.find((r) => r.id === e.target.value))
          }
        >
          <option value="">Sem referência</option>
          {options.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
          {reference?.source === "device" && (
            <option value="device">Localização atual</option>
          )}
        </select>
      </label>
      <button
        className="outline"
        aria-label={
          compact && !gps.busy ? "Usar minha localização atual" : undefined
        }
        onClick={gps.locate}
        disabled={gps.busy}
      >
        {gps.busy
          ? "Buscando localização…"
          : compact
            ? "Usar localização"
            : "Usar minha localização atual"}
      </button>
      <label>
        Para quem é esta consulta?
        <select
          value={paraQuem}
          onChange={(e) =>
            setParaQuem(e.target.value as "mim" | "outra_pessoa")
          }
        >
          <option value="mim">Para mim</option>
          <option value="outra_pessoa">Para outra pessoa</option>
        </select>
      </label>
      {children}
      {compact && gps.message.startsWith("Localização obtida") ? (
        <div className="location-feedback">
          <span className="sr-only" role="status">
            {gps.message}
          </span>
          <details>
            <summary>Localização obtida · ver precisão</summary>
            <p>{gps.message}</p>
          </details>
        </div>
      ) : (
        gps.message && (
          <p className="location-feedback" role="status">
            {gps.message}
          </p>
        )
      )}
      <p className="location-note">
        Locais “Minha casa” e “Casa de Mainha” são fictícios para o teste.
        Distâncias em linha reta.
      </p>
    </div>
  );
}
