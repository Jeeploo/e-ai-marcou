import { Link, useSearchParams } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import SearchReference from "../components/SearchReference";
import { useProfessionalSearch } from "../hooks/useProfessionalSearch";
import { useCatalog } from "../hooks/CatalogContext";
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { specialtyOptions } = useCatalog();
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  const specialty = params.get("especialidade") || "";
  const id =
    specialtyOptions.find((s) => s.nome === specialty || s.id === specialty)
      ?.id || "";
  const { items, loading, error, reload } = useProfessionalSearch(
    params.get("ordem") || "recomendados",
    id,
    params.get("q") || "",
    params.get("max") || "",
  );
  return (
    <>
      <header className="page-header">
        <h1>Busca</h1>
      </header>
      <div className="page-content search-page">
        <div className="search-controls">
          <label>
            Pesquisar
            <input
              value={params.get("q") || ""}
              placeholder="O que procura hoje?"
              onChange={(e) => update("q", e.target.value)}
            />
          </label>
          <label>
            Especialidade
            <select
              value={specialty}
              onChange={(e) => update("especialidade", e.target.value)}
            >
              <option value="">Todas as especialidades</option>
              {specialtyOptions.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Valor máximo da consulta
            <input
              type="number"
              min="0"
              value={params.get("max") || ""}
              onChange={(e) => update("max", e.target.value)}
            />
          </label>
        </div>
        <SearchReference compact>
          <label>
            Ordenar por
            <select
              value={params.get("ordem") || "recomendados"}
              onChange={(e) => update("ordem", e.target.value)}
            >
              <option value="recomendados">Recomendados</option>
              <option value="distancia">Mais perto</option>
              <option value="preco">Menor preço</option>
            </select>
          </label>
        </SearchReference>
        <p className="search-hint">
          Combina proximidade e preço. Sem referência, ordenamos pelo menor
          preço.
        </p>
        {loading ? (
          <p role="status">Buscando profissionais…</p>
        ) : error ? (
          <div role="alert">
            {error}
            <button onClick={reload}>Tentar novamente</button>
          </div>
        ) : (
          <>
            <p role="status">{items.length} profissionais encontrados</p>
            <div className="doctor-grid">
              {items.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
            {!items.length && (
              <div className="empty-state">
                <h2>Nenhum resultado encontrado</h2>
                <button className="outline" onClick={() => setParams({})}>
                  Limpar filtros
                </button>
              </div>
            )}
          </>
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
