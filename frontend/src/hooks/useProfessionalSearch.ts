import { useEffect, useState } from "react";
import { catalogApi, friendlyError } from "../services/api";
import type { Professional } from "../data/catalog";
import { useSearchContext } from "./SearchContext";
export function useProfessionalSearch(
  ordem = "recomendados",
  especialidadeId = "",
  q = "",
  valorMaximo = "",
) {
  const { reference } = useSearchContext();
  const [items, setItems] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const lat = reference?.coordinates.latitude,
    lon = reference?.coordinates.longitude;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ ordem, q });
    if (especialidadeId) params.set("especialidadeId", especialidadeId);
    if (valorMaximo) params.set("valorMaximo", valorMaximo);
    if (lat !== undefined && lon !== undefined) {
      params.set("latitude", String(lat));
      params.set("longitude", String(lon));
    }
    catalogApi
      .search(params)
      .then((data) => {
        if (active)
          setItems(
            data.map((p) => ({
              id: p.id,
              name: p.nome,
              specialty: p.especialidade,
              clinic: p.clinica.nome,
              price: p.valorConsulta,
              photoUrl: p.fotoUrl,
              initials: p.nome
                .split(" ")
                .slice(-2)
                .map((s) => s[0])
                .join(""),
              address: [
                p.clinica.endereco,
                p.clinica.bairro,
                p.clinica.cidade,
                p.clinica.uf,
                p.clinica.cep,
                p.clinica.complemento,
              ]
                .filter(Boolean)
                .join(", "),
              distance: p.distanciaKm ?? NaN,
              distanceMeasured: true,
              rating: NaN,
              nextSlot: p.proximoHorario,
            })),
          );
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
  }, [ordem, especialidadeId, q, valorMaximo, lat, lon, revision]);
  return { items, loading, error, reload: () => setRevision((r) => r + 1) };
}
