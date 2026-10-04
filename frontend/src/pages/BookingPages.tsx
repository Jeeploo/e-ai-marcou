import { prototypeExtras } from "../data/features";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useCatalog } from "../hooks/CatalogContext";
import { useOnline } from "../hooks/useOnline";
import { currency, professionalDetails } from "../data/catalog";
import {
  bookingService,
  dateLabel,
  day,
  demoMode,
  friendlyError,
} from "../services/api";
import type { Slot } from "../types/models";
import Modal from "../components/Modal";
export function ProfessionalPage() {
  const { id } = useParams(),
    { professionals, loading, error, reload } = useCatalog(),
    doctor = professionals.find((p) => p.id === id),
    [params] = useSearchParams(),
    navigate = useNavigate(),
    location = useLocation(),
    online = useOnline();
  const [date, setDate] = useState(day(1)),
    [slots, setSlots] = useState<Slot[]>([]),
    [selected, setSelected] = useState(""),
    [pending, setPending] = useState(true),
    [slotError, setSlotError] = useState(""),
    [revision, setRevision] = useState(0);
  const reschedule = params.get("remarcar");
  const back =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/busca")
      ? location.state.from
      : "/busca";
  useEffect(() => {
    let active = true;
    setSelected("");
    setSlots([]);
    setPending(true);
    setSlotError("");
    if (id)
      bookingService
        .slots(id, date)
        .then((data) => {
          if (active) setSlots(data);
        })
        .catch((e) => {
          if (active) setSlotError(friendlyError(e));
        })
        .finally(() => {
          if (active) setPending(false);
        });
    return () => {
      active = false;
    };
  }, [id, date, revision]);
  if (loading)
    return (
      <div className="page-content" role="status">
        Carregando profissional…
      </div>
    );
  if (error)
    return (
      <div className="page-content" role="alert">
        {error}
        <button className="outline" onClick={reload}>
          Tentar novamente
        </button>
      </div>
    );
  if (!doctor)
    return (
      <div className="page-content">
        <h1>Profissional não encontrado</h1>
        <Link to="/busca">Voltar à busca</Link>
      </div>
    );
  const details = demoMode ? professionalDetails[doctor.id] : undefined;
  return (
    <>
      <header className="page-header">
        <Link
          className="icon-button"
          aria-label="Voltar"
          to={reschedule ? "/agenda" : back}
        >
          <ArrowLeft />
        </Link>
        <h1>{reschedule ? "Remarcar consulta" : "Perfil do profissional"}</h1>
      </header>
      <div className="page-content professional-layout">
        <section>
          <div className="avatar portrait" aria-hidden="true">
            {doctor.initials}
          </div>
          <h2>{doctor.name}</h2>
          <p className="professional-specialty">{doctor.specialty}</p>
          <p>{doctor.crm || details?.crm || "Consulte o CRM com a clínica"}</p>
          <h3 className="spaced-heading">Sobre o médico</h3>
          <p>
            {details?.bio ||
              "Entre em contato com a clínica para mais informações sobre o profissional."}
          </p>
          <h3 className="spaced-heading">
            <MapPin size={19} className="inline-icon" /> {doctor.clinic}
          </h3>
          <p>
            {doctor.address ||
              details?.address ||
              "Endereço a confirmar com a clínica"}
          </p>
        </section>
        <section className="panel availability">
          <p>Valor da consulta</p>
          <h2>{currency(doctor.price)}</h2>
          <h3>Escolha o dia</h3>
          <div className="date-strip">
            {Array.from({ length: 4 }, (_, i) => day(i + 1)).map((value) => (
              <button
                key={value}
                aria-pressed={date === value}
                onClick={() => setDate(value)}
              >
                <span>
                  {new Intl.DateTimeFormat("pt-BR", {
                    weekday: "short",
                  }).format(new Date(value + "T12:00:00"))}
                </span>
                <strong>{value.slice(-2)}</strong>
                <span>
                  {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
                    new Date(value + "T12:00:00"),
                  )}
                </span>
              </button>
            ))}
          </div>
          <label className="date-input">
            Outra data
            <input
              type="date"
              min={day(0)}
              max={day(90)}
              value={date}
              onChange={(e) => {
                if (e.target.value) setDate(e.target.value);
              }}
            />
          </label>
          <h3>Horários · {dateLabel(date)}</h3>
          {pending ? (
            <p role="status">Buscando horários…</p>
          ) : slotError ? (
            <div role="alert">
              <p>{slotError}</p>
              <button
                className="outline"
                onClick={() => setRevision((r) => r + 1)}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <div className="slot-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    className="slot"
                    disabled={!slot.disponivel}
                    aria-pressed={selected === slot.id}
                    aria-label={`${slot.hora}${!slot.disponivel ? " indisponível" : ""}`}
                    onClick={() => setSelected(slot.id)}
                  >
                    {slot.hora}
                  </button>
                ))}
              </div>
              {!slots.some((s) => s.disponivel) && (
                <p role="status">
                  Nenhum horário disponível. Escolha outra data.
                </p>
              )}
            </>
          )}
          <button
            className="primary button-wide"
            disabled={!selected || pending || !online}
            onClick={() =>
              navigate(
                `/confirmar?horario=${encodeURIComponent(selected)}&profissional=${doctor.id}&data=${date}${reschedule ? `&remarcar=${encodeURIComponent(reschedule)}` : ""}`,
              )
            }
          >
            Avançar para agendamento
          </button>
          {!online && (
            <p role="status">Conecte-se à internet para continuar.</p>
          )}
        </section>
      </div>
    </>
  );
}
export function ConfirmPage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    { professionals } = useCatalog(),
    online = useOnline();
  const id = params.get("profissional") || "",
    slotId = params.get("horario") || "",
    date = params.get("data") || "",
    reschedule = params.get("remarcar"),
    doctor = professionals.find((p) => p.id === id);
  const [slot, setSlot] = useState<Slot>(),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false),
    [payment, setPayment] = useState("Pix");
  useEffect(() => {
    let active = true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setLoading(false);
      setError("Escolha uma data e um horário antes de confirmar.");
      return;
    }
    bookingService
      .slots(id, date)
      .then((slots) => {
        if (active) setSlot(slots.find((s) => s.id === slotId && s.disponivel));
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
  }, [id, date, slotId]);
  async function confirm() {
    if (!slot || busy) return;
    setBusy(true);
    setError("");
    try {
      reschedule
        ? await bookingService.reschedule(reschedule, slot.id)
        : await bookingService.create(slot.id);
      setSuccess(true);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  if (!doctor)
    return (
      <div className="page-content">
        <h1>Selecione um profissional</h1>
        <Link to="/busca">Ir para a busca</Link>
      </div>
    );
  return (
    <>
      <header className="page-header">
        <Link
          className="icon-button"
          aria-label="Voltar aos horários"
          to={`/profissional/${id}${reschedule ? `?remarcar=${reschedule}` : ""}`}
        >
          <ArrowLeft />
        </Link>
        <h1>{reschedule ? "Confirmar remarcação" : "Confirmar agendamento"}</h1>
      </header>
      <div className="checkout page-content">
        {loading ? (
          <p role="status">Conferindo horário…</p>
        ) : (
          <>
            <section className="receipt">
              <h2>Resumo</h2>
              <dl>
                <div>
                  <dt>Data</dt>
                  <dd>{date ? dateLabel(date) : "Não selecionada"}</dd>
                </div>
                <div>
                  <dt>Horário</dt>
                  <dd>{slot?.hora || "Horário indisponível"}</dd>
                </div>
                <div>
                  <dt>Profissional</dt>
                  <dd>
                    {doctor.name} · {doctor.specialty}
                  </dd>
                </div>
                <div>
                  <dt>Localização</dt>
                  <dd>
                    {doctor.clinic}
                    <br />
                    {demoMode
                      ? professionalDetails[id]?.address
                      : doctor.address}
                  </dd>
                </div>
                <div className="receipt-total">
                  <dt>Total a pagar</dt>
                  <dd>{currency(doctor.price)}</dd>
                </div>
              </dl>
            </section>
            {prototypeExtras && demoMode && (
              <fieldset className="payment-options">
                <legend>Como prefere pagar?</legend>
                <p className="hint">
                  Escolha sua preferência. O pagamento deverá ser combinado com
                  a clínica.
                </p>
                <div>
                  {["Pix", "Cartão de crédito", "Pagar na clínica"].map(
                    (method) => (
                      <label key={method}>
                        <input
                          type="radio"
                          name="payment"
                          checked={payment === method}
                          onChange={() => setPayment(method)}
                        />
                        <span>{method}</span>
                      </label>
                    ),
                  )}
                </div>
              </fieldset>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {!slot && (
              <p role="status">
                Esse horário não está disponível. Volte e escolha outro.
              </p>
            )}
            <button
              className="primary button-wide"
              disabled={!slot || busy || !online}
              onClick={confirm}
            >
              {busy
                ? "Confirmando…"
                : reschedule
                  ? "Confirmar remarcação"
                  : "Confirmar agendamento"}
            </button>
            <Link
              className="checkout-back"
              to={`/profissional/${id}${reschedule ? `?remarcar=${reschedule}` : ""}`}
            >
              Escolher outro horário
            </Link>
          </>
        )}
      </div>
      {success && (
        <Modal
          title="Tudo certo! Consulta confirmada."
          onClose={() => navigate("/agenda")}
        >
          <div className="success-content">
            <div className="success-check">
              <Check size={44} />
            </div>
            <p>
              {demoMode
                ? "Solicitação salva neste dispositivo. A confirmação com a clínica ainda é necessária."
                : "Seu agendamento foi registrado."}
            </p>
            <div className="success-summary">
              <strong>{doctor.name}</strong>
              <p>{doctor.clinic}</p>
              <p>
                {dateLabel(date)} · {slot?.hora}
              </p>
            </div>
            <Link className="primary button-wide" to="/agenda">
              Ver minhas consultas
            </Link>
            <Link className="outline button-wide" to="/">
              Voltar ao início
            </Link>
          </div>
        </Modal>
      )}
    </>
  );
}
