import { prototypeExtras } from "../data/features";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { List, MapPin, SlidersHorizontal } from "lucide-react";
import DoctorCard from "../components/DoctorCard";
import { useCatalog } from "../hooks/CatalogContext";
import { currency } from "../data/catalog";
import { demoMode } from "../services/api";
export function SearchPage() {
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
  const results = professionals
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
        ? a.distance - b.distance
        : sort === "avaliacao"
          ? b.rating - a.rating
          : a.price - b.price,
    );
  const active =
    results.find((p) => p.id === params.get("destaque")) || results[0];
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
          <div className="filter-row">
            {[
              ["preco", "Menor preço"],
              ["distancia", "Mais próximo"],
              ["avaliacao", "Melhor avaliação"],
            ]
              .filter(([key]) => demoMode || key === "preco")
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
                  <DoctorCard key={doctor.id} doctor={doctor} />
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
          {prototypeExtras && demoMode && (
            <button
              className="map-toggle"
              onClick={() => update("visualizacao", map ? "" : "mapa")}
            >
              {map ? <List size={18} /> : <MapPin size={18} />}{" "}
              {map ? "Ver lista" : "Ver no mapa"}
            </button>
          )}
        </div>
        {prototypeExtras && demoMode && map && (
          <section
            className="demo-map"
            aria-label="Mapa de referência de São Paulo"
          >
            <p className="map-disclaimer">
              Região de referência · consulte o endereço da clínica
            </p>
            <iframe
              title="Mapa da região de São Paulo"
              className="region-map"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-46.6800%2C-23.5750%2C-46.6350%2C-23.5450&layer=mapnik"
            />
            <a
              className="map-full-link"
              href="https://www.openstreetmap.org/#map=14/-23.5600/-46.6575"
              target="_blank"
              rel="noreferrer"
            >
              Ampliar mapa
            </a>
            {active && (
              <div className="map-preview">
                <DoctorCard doctor={active} />
                <a
                  className="outline button-wide"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(active.address || active.clinic + ", São Paulo")}`}
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
