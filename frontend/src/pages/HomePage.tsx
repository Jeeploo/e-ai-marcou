import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import SearchField from "../components/SearchField";
import { useCatalog } from "../hooks/CatalogContext";
import { useProfile } from "../hooks/ProfileContext";
import { bookingService, dateLabel, isPast } from "../services/api";
import type { Appointment } from "../types/models";
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
                  const count = new Set(
                    professionals
                      .filter((p) => p.specialty === s)
                      .map((p) => p.clinic),
                  ).size;
                  return (
                    <Link
                      key={s}
                      to={`/busca?especialidade=${encodeURIComponent(s)}`}
                    >
                      <div>
                        <h3>{s}</h3>
                        <p>
                          {count} {count === 1 ? "clínica" : "clínicas"}
                        </p>
                      </div>
                      <ChevronRight size={18} />
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
