import { useState } from "react";
import type { Professional } from "../data/catalog";
export default function ProfessionalAvatar({
  doctor,
  portrait = false,
}: {
  doctor: Professional;
  portrait?: boolean;
}) {
  const [failed, setFailed] = useState<string>();
  const source = doctor.photoUrl;
  const allowed =
    source && (/^https?:\/\//i.test(source) || /^\/(?!\/)/.test(source));
  return (
    <div className={`avatar${portrait ? " portrait" : ""}`} aria-hidden="true">
      {allowed && failed !== source ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(source)}
        />
      ) : (
        doctor.initials
      )}
    </div>
  );
}
