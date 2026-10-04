import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function SearchField() {
  const navigate = useNavigate();
  return (
    <form
      className="search-field"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const query = String(
          new FormData(event.currentTarget).get("q") || "",
        ).trim();
        navigate(`/busca${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      }}
    >
      <label className="sr-only" htmlFor="site-search">
        Buscar especialidade, médico ou clínica
      </label>
      <input
        id="site-search"
        name="q"
        placeholder="Busque por especialidade, médico ou clínica"
      />
      <button aria-label="Buscar" type="submit">
        <Search size={20} />
      </button>
    </form>
  );
}
