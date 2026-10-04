import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useCatalog } from "../hooks/CatalogContext";
import { useOnline } from "../hooks/useOnline";
import {
  bookingService,
  dateLabel,
  friendlyError,
  isPast,
  demoMode,
} from "../services/api";
import { currency, professionalDetails } from "../data/catalog";
import type { Appointment } from "../types/models";
import Modal from "../components/Modal";
export default function AgendaPage() {
  const { professionals } = useCatalog(),
    online = useOnline(),
    [items, setItems] = useState<Appointment[]>([]),
    [history, setHistory] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [cancel, setCancel] = useState<Appointment>(),
    [details, setDetails] = useState<Appointment>(),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    bookingService
      .list()
      .then((data) => {
        if (active) setItems(data);
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
  }, [revision]);
  const past = (a: Appointment) =>
      a.status !== "agendado" || isPast(a.data, a.hora),
    upcoming = items.filter((a) => !past(a)),
    previous = items.filter(past),
    visible = (history ? previous : upcoming).sort((a, b) =>
      history
        ? `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`)
        : `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`),
    );
  async function confirmCancel() {
    if (!cancel || busy) return;
    setBusy(true);
    setError("");
    try {
      await bookingService.cancel(cancel.id);
      setItems((current) =>
        current.map((item) =>
          item.id === cancel.id ? { ...item, status: "cancelado" } : item,
        ),
      );
      setRevision((value) => value + 1);
      setCancel(undefined);
      setMessage("Consulta cancelada. Ela continua disponível no histórico.");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="page-header">
        <h1>Minhas consultas</h1>
      </header>
      <div className="page-content agenda-content">
        <div className="tabs">
          <button aria-pressed={!history} onClick={() => setHistory(false)}>
            Próximas consultas ({upcoming.length})
          </button>
          <button aria-pressed={history} onClick={() => setHistory(true)}>
            Histórico ({previous.length})
          </button>
        </div>
        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}
        {error && !cancel && (
          <div className="error-message" role="alert">
            {error}
            <button
              className="outline"
              onClick={() => setRevision((r) => r + 1)}
            >
              Tentar novamente
            </button>
          </div>
        )}
        {loading ? (
          <p role="status">Carregando suas consultas…</p>
        ) : visible.length ? (
          visible.map((item) => {
            const doctor = professionals.find(
              (p) => p.id === item.profissionalId,
            );
            return (
              <article className="appointment" key={item.id}>
                <div className="appointment-time">
                  <span>{dateLabel(item.data)}</span>
                  <strong>{item.hora}</strong>
                </div>
                <div className="appointment-info">
                  <h2>
                    {doctor?.name || "Profissional"}{" "}
                    <span
                      className={`status-badge ${item.status === "cancelado" ? "cancelled" : ""}`}
                    >
                      {item.status === "cancelado"
                        ? "Cancelada"
                        : past(item)
                          ? "Concluída"
                          : "Confirmada"}
                    </span>
                  </h2>
                  <p>
                    {doctor?.specialty} · {currency(item.valor)}
                  </p>
                  <p>
                    <MapPin size={15} className="inline-icon" />{" "}
                    {doctor?.clinic}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setDetails(item)}
                  >
                    Ver detalhes
                  </button>
                </div>
                {!past(item) && (
                  <div className="appointment-actions">
                    <Link
                      className="outline"
                      to={`/profissional/${item.profissionalId}?remarcar=${encodeURIComponent(item.id)}`}
                    >
                      Remarcar
                    </Link>
                    <button
                      className="danger text-button"
                      onClick={() => {
                        setError("");
                        setCancel(item);
                      }}
                      disabled={!online}
                    >
                      Cancelar consulta
                    </button>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            <h2>
              {history
                ? "Nenhuma consulta no histórico"
                : "Você ainda não tem próximas consultas"}
            </h2>
            <p>
              {history
                ? "Consultas passadas e canceladas aparecerão aqui."
                : "Encontre um profissional e escolha seu horário."}
            </p>
            <Link className="primary" to="/busca">
              Buscar profissionais
            </Link>
          </div>
        )}
      </div>
      {cancel && (
        <Modal
          title="Cancelar consulta?"
          onClose={() => {
            if (!busy) setCancel(undefined);
          }}
        >
          <p>
            A consulta de {dateLabel(cancel.data)}, às {cancel.hora}, será
            cancelada e continuará no seu histórico.
          </p>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button
              className="outline"
              disabled={busy}
              onClick={() => setCancel(undefined)}
            >
              Manter consulta
            </button>
            <button
              className="primary"
              disabled={busy || !online}
              onClick={confirmCancel}
            >
              {busy ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
          </div>
        </Modal>
      )}
      {details && (
        <Modal
          title="Detalhes da consulta"
          onClose={() => setDetails(undefined)}
        >
          <h3>
            {professionals.find((p) => p.id === details.profissionalId)?.name}
          </h3>
          <p>
            {dateLabel(details.data)} · {details.hora}
          </p>
          <p>
            {demoMode
              ? professionalDetails[details.profissionalId]?.address
              : professionals.find((p) => p.id === details.profissionalId)
                  ?.address}
          </p>
          <p>
            {
              professionals.find((p) => p.id === details.profissionalId)
                ?.specialty
            }{" "}
            ·{" "}
            {professionals.find((p) => p.id === details.profissionalId)?.clinic}
          </p>
          <p>Valor: {currency(details.valor)}</p>
          <p>
            Situação:{" "}
            {details.status === "cancelado"
              ? "Cancelada"
              : past(details)
                ? "Concluída"
                : "Confirmada"}
          </p>
          <button className="outline" onClick={() => setDetails(undefined)}>
            Fechar detalhes
          </button>
        </Modal>
      )}
    </>
  );
}
