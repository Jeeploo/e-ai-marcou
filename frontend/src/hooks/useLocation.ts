import { useEffect, useRef, useState } from "react";
import { coordinates, type Coordinates } from "../services/location";
export function useDeviceLocation() {
  const [position, setPosition] = useState<Coordinates>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  function clear() {
    generation.current++;
    setPosition(undefined);
    setBusy(false);
    setMessage("");
  }
  function locate() {
    if (busy) return;
    if (!window.isSecureContext) {
      setMessage(
        "A localização precisa de uma conexão segura (HTTPS). Você pode continuar buscando pelo endereço.",
      );
      return;
    }
    if (!navigator.geolocation) {
      setMessage(
        "Este navegador não oferece localização. Continue buscando pelo endereço.",
      );
      return;
    }
    const request = ++generation.current;
    setBusy(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (result) => {
        if (request !== generation.current) return;
        setBusy(false);
        const next = coordinates(
          result.coords.latitude,
          result.coords.longitude,
        );
        setPosition(next);
        setMessage(
          next
            ? `Localização obtida. Precisão aproximada: ${Math.round(result.coords.accuracy)} metros.`
            : "Não foi possível identificar sua localização. Tente novamente.",
        );
      },
      (error) => {
        if (request !== generation.current) return;
        setBusy(false);
        setMessage(
          error.code === 1
            ? "Permissão de localização negada. Você pode liberá-la nas configurações do navegador ou continuar pelo endereço."
            : error.code === 3
              ? "A localização demorou para responder. Tente novamente ou continue pelo endereço."
              : "Não foi possível obter sua localização. Tente novamente ou continue pelo endereço.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }
  return { position, busy, message, locate, clear };
}
