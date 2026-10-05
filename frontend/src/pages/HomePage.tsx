import { useEffect, useState } from "react";
import {
  Bone,
  createLucideIcon,
  Heart,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import SearchField from "../components/SearchField";
import { useCatalog } from "../hooks/CatalogContext";
import { useProfile } from "../hooks/ProfileContext";
import { bookingService, dateLabel, isPast } from "../services/api";
import type { Appointment } from "../types/models";

// lucide-react 0.468 does not yet export Venus.
const Venus = createLucideIcon("Venus", [
  ["circle", { cx: "12", cy: "8", r: "5", key: "circle" }],
  ["path", { d: "M12 13v8M9 18h6", key: "cross" }],
]);

const specialtyVisuals: Record<
  string,
  { icon: LucideIcon; color: string; background: string }
> = {
  Cardiologia: { icon: Heart, color: "#b83b48", background: "#ffe5e8" },
  "Clínica Geral": {
    icon: Stethoscope,
    color: "#137568",
    background: "#def4ed",
  },
  Dermatologia: { icon: Sparkles, color: "#b85416", background: "#ffecd9" },
  Ginecologia: { icon: Venus, color: "#7844b4", background: "#f0e5fc" },
  Ortopedia: { icon: Bone, color: "#2864b5", background: "#e2edff" },
};
const fallbackSpecialtyVisual = {
  icon: Stethoscope,
  color: "#137568",
  background: "#def4ed",
};

export default function HomePage() {
  const { professionals, specialties, loading, error, reload } = useCatalog(),
    { profile } = useProfile(),
    [next, setNext] = useState<Appointment>(),
    [appointmentError, setAppointmentError] = useState(false);
  useEffect(() => {
    let active = true;
    bookingService
      .list()
      .then((items) => {
        if (active)
          setNext(
            items
              .filter((a) => a.status === "agendado" && !isPast(a.data, a.hora))
              .sort((a, b) =>
                `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`),
              )[0],
          );
      })
      .catch(() => {
        if (active) setAppointmentError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const doctor = professionals.find((p) => p.id === next?.profissionalId);
  return (
    <>
      <header className="home-header">
        <div>
          <p className="desktop-date">
            {new Intl.DateTimeFormat("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </p>
          <h1>Olá, {profile.patient.nome.split(" ")[0]}!</h1>
        </div>
        <SearchField />
      </header>
      <div className="page-content home-content">
        <section className="next-visit" aria-labelledby="next-title">
          <h2 id="next-title">Sua próxima visita</h2>
          {next ? (
            <div className="visit-row">
              <span className="avatar" aria-hidden="true">
                {doctor?.initials || "•"}
              </span>
              <div className="visit-professional">
                <h3>{doctor?.name || "Sua consulta"}</h3>
                <p>
                  {doctor?.specialty} · {doctor?.clinic}
                </p>
              </div>
              <div className="visit-time">
                <span>{dateLabel(next.data)}</span>
                <strong>{next.hora}</strong>
              </div>
              <Link className="outline" to="/agenda">
                Ver detalhes
              </Link>
            </div>
          ) : (
            <div className="visit-row">
              <p>
                {appointmentError
                  ? "Não foi possível consultar sua agenda."
                  : "Você ainda não tem uma consulta marcada."}
              </p>
              <Link
                className="outline"
                to={appointmentError ? "/agenda" : "/busca"}
              >
                {appointmentError ? "Ver agenda" : "Encontrar profissional"}
              </Link>
            </div>
          )}
        </section>
        {loading ? (
          <p role="status">Carregando especialidades…</p>
        ) : error ? (
          <div className="error-message" role="alert">
            {error}
            <button className="outline" onClick={reload}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <section aria-labelledby="specialties-title">
              <h2 id="specialties-title">O que você procura hoje?</h2>
              <div className="specialties">
                {specialties.map((s) => {
                  const {
                    icon: Icon,
                    color,
                    background,
                  } = specialtyVisuals[s] ?? fallbackSpecialtyVisual;
                  const count = new Set(
                    professionals
                      .filter((p) => p.specialty === s)
                      .map((p) => p.clinic),
                  ).size;
                  return (
                    <Link
                      key={s}
                      to={`/busca?especialidade=${encodeURIComponent(s)}`}
                      style={{ justifyContent: "flex-start", gap: "12px" }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "clamp(40px, 5vw, 56px)",
                          height: "clamp(40px, 5vw, 56px)",
                          flexShrink: 0,
                          borderRadius: "14px",
                          color,
                          background,
                        }}
                      >
                        <Icon
                          size={30}
                          strokeWidth={1.8}
                          style={{ display: "block" }}
                        />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                          {s}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--muted)",
                          }}
                        >
                          {count} {count === 1 ? "clínica" : "clínicas"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
            <section aria-labelledby="nearby-title">
              <div className="section-heading">
                <h2 id="nearby-title">Clínicas próximas</h2>
                <Link to="/busca">Ver todas</Link>
              </div>
              <div className="doctor-grid home-doctors">
                {professionals.slice(0, 3).map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
