import { useDeviceLocation } from "../hooks/useLocation";
import { distanceKm } from "../services/location";
import { prototypeExtras } from "../data/features";
import { useOnline } from "../hooks/useOnline";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { List, MapPin, SlidersHorizontal } from "lucide-react";
import DoctorCard from "../components/DoctorCard";
import { useCatalog } from "../hooks/CatalogContext";
export function SearchPage() {
  const online = useOnline();
  const gps = useDeviceLocation();
  const { professionals, specialties, loading, error, reload } = useCatalog(),
    [params, setParams] = useSearchParams(),
    [filters, setFilters] = useState(false);
  const q = params.get("q") || "",
    specialty = params.get("especialidade") || "",
    sort = params.get("ordem") || "preco",
    map = prototypeExtras && params.get("visualizacao") === "mapa",
    maximum = Number(params.get("max") || 0);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const located = professionals.map((p) => ({
    ...p,
    distance:
      gps.position && p.coordinates
        ? distanceKm(gps.position, p.coordinates)
        : NaN,
    distanceMeasured: true,
  }));
  const canSortDistance = located.some((p) => Number.isFinite(p.distance));
  const results = located
    .filter(
      (p) =>
        (!specialty || p.specialty === specialty) &&
        (!maximum || p.price <= maximum) &&
        normalize(`${p.name} ${p.clinic} ${p.specialty}`).includes(
          normalize(q),
        ),
    )
    .sort((a, b) =>
      sort === "distancia"
        ? (Number.isFinite(a.distance) ? a.distance : Infinity) -
          (Number.isFinite(b.distance) ? b.distance : Infinity)
        : sort === "avaliacao"
          ? b.rating - a.rating
          : a.price - b.price,
    );
  const active =
    results.find((p) => p.id === params.get("destaque")) || results[0];
  const mapAddress = active?.address || "São Paulo, SP";
  return (
    <>
      <header className="page-header">
        <h1>Busca</h1>
      </header>
      <div className={`search-layout ${map ? "map-open" : ""}`}>
        <div className="page-content search-results">
          <div className="search-controls">
            <label>
              Pesquisar
              <input
                value={q}
                placeholder="O que procura hoje?"
                onChange={(e) => update("q", e.target.value)}
              />
            </label>
            <button
              className="outline filter-toggle"
              aria-expanded={filters}
              onClick={() => setFilters(!filters)}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>
            <label className="specialty-select">
              Especialidade
              <select
                value={specialty}
                onChange={(e) => update("especialidade", e.target.value)}
              >
                <option value="">Todas as especialidades</option>
                {specialties.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          {filters && (
            <label className="price-filter">
              Valor máximo da consulta
              <input
                type="number"
                min="0"
                step="10"
                placeholder="Sem limite"
                value={params.get("max") || ""}
                onChange={(e) => update("max", e.target.value)}
              />
            </label>
          )}
          <div className="location-controls">
            <button
              className="outline"
              onClick={gps.locate}
              disabled={gps.busy}
            >
              {gps.busy
                ? "Buscando localização…"
                : gps.position
                  ? "Atualizar minha localização"
                  : "Usar minha localização"}
            </button>
            {(gps.position || gps.busy) && (
              <button className="outline" onClick={gps.clear}>
                Parar de usar localização
              </button>
            )}
            <p>
              Sua localização fica apenas nesta tela. Ao abrir uma rota, ela
              será compartilhada com o Google Maps.
            </p>
            {gps.message && <p role="status">{gps.message}</p>}
            {gps.position && (
              <p>
                {canSortDistance
                  ? "Distâncias aproximadas em linha reta. O trajeto pelas ruas pode ser maior."
                  : "As clínicas ainda não informaram suas coordenadas. Você pode consultar o trajeto pelo endereço no Google Maps."}
              </p>
            )}
          </div>
          <div className="filter-row">
            {[
              ["preco", "Menor preço"],
              ["distancia", "Mais próximo"],
              ["avaliacao", "Melhor avaliação"],
            ]
              .filter(
                ([key]) =>
                  key === "preco" ||
                  (key === "distancia" && canSortDistance),
              )
              .map(([value, label]) => (
                <button
                  className="filter"
                  key={value}
                  aria-pressed={sort === value}
                  onClick={() => update("ordem", value)}
                >
                  {label}
                </button>
              ))}
          </div>
          {loading ? (
            <p role="status">Buscando profissionais…</p>
          ) : error ? (
            <div role="alert" className="error-message">
              {error}
              <button className="outline" onClick={reload}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <p className="results-count" role="status">
                {results.length} profissionais encontrados
              </p>
              <div className="doctor-grid">
                {results.map((doctor) => (
                  <div key={doctor.id}>
                    <DoctorCard doctor={doctor} />
                    {map && (
                      <button
                        className="outline button-wide"
                        aria-pressed={active?.id === doctor.id}
                        onClick={() => update("destaque", doctor.id)}
                      >
                        Mostrar no mapa
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!results.length && (
                <div className="empty-state">
                  <h2>Nenhum resultado encontrado</h2>
                  <p>Tente outra especialidade, nome ou clínica.</p>
                  <button className="outline" onClick={() => setParams({})}>
                    Limpar filtros
                  </button>
                </div>
              )}
            </>
          )}
          {prototypeExtras && (
            <button
              className="map-toggle"
              onClick={() => update("visualizacao", map ? "" : "mapa")}
            >
              {map ? <List size={18} /> : <MapPin size={18} />}{" "}
              {map ? "Ver lista" : "Ver no mapa"}
            </button>
          )}
        </div>
        {prototypeExtras && map && (
          <section
            className="demo-map"
            aria-label="Localização da clínica no Google Maps"
          >
            <p className="map-disclaimer">
              Google Maps · confira o endereço antes de sair
            </p>
            <label className="map-selection">
              Profissional no mapa
              <select
                value={active?.id || ""}
                onChange={(e) => update("destaque", e.target.value)}
              >
                {results.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.clinic}
                  </option>
                ))}
              </select>
            </label>
            {!online && (
              <p role="status" className="error-message">
                O mapa precisa de internet. Reconecte-se para consultar a
                localização.
              </p>
            )}
            {online && (
              <iframe
                title="Google Maps: localização da clínica"
                className="region-map"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
              />
            )}
            <a
              className="map-full-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`}
              target="_blank"
              rel="noreferrer"
            >
              Ampliar mapa
            </a>
            {active && (
              <div className="map-preview">
                <DoctorCard doctor={active} />
                {gps.position && online && (
                  <a
                    className="outline button-wide"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&origin=${gps.position.latitude},${gps.position.longitude}&destination=${encodeURIComponent(active.coordinates ? `${active.coordinates.latitude},${active.coordinates.longitude}` : mapAddress)}`}
                  >
                    Traçar rota da minha localização
                  </a>
                )}
                <a
                  className="outline button-wide"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`}
                >
                  Consultar endereço no mapa
                </a>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
export function NotFoundPage() {
  return (
    <div className="page-content empty-state">
      <h1>Página não encontrada</h1>
      <Link className="primary" to="/">
        Voltar ao início
      </Link>
    </div>
  );
}
