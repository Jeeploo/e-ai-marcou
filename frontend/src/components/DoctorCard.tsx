import ProfessionalAvatar from "./ProfessionalAvatar";
import { MapPin, Star } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { currency, type Professional } from "../data/catalog";
export default function DoctorCard({ doctor }: { doctor: Professional }) {
  const location = useLocation();
  return (
    <article className="doctor-card">
      <div className="doctor-intro">
        <ProfessionalAvatar doctor={doctor} />
        <div>
          <h3>{doctor.name}</h3>
          <p>{doctor.specialty}</p>
          <p>{doctor.clinic}</p>
        </div>
      </div>
      <div className="doctor-meta">
        {Number.isFinite(doctor.rating) && (
          <span>
            <Star size={16} className="star" aria-label="Avaliação" />
            {doctor.rating.toLocaleString("pt-BR")}
          </span>
        )}
        {Number.isFinite(doctor.distance) && (
          <span>
            <MapPin size={16} aria-label="Distância" />
            {doctor.distance.toLocaleString("pt-BR")} km
          </span>
        )}
      </div>
      <div className="doctor-price">
        <span>Consulta</span>
        <strong>{currency(doctor.price)}</strong>
      </div>
      <Link
        className="primary button-wide"
        to={`/profissional/${doctor.id}`}
        state={{ from: location.pathname + location.search }}
      >
        Ver horários
      </Link>
    </article>
  );
}
