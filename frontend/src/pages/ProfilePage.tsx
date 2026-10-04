import { prototypeExtras } from "../data/features";
import { lookupPostalCode } from "../services/postal";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  HelpCircle,
  Home,
  LogOut,
  Plus,
  Type,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProfile } from "../hooks/ProfileContext";
import Modal from "../components/Modal";
import type { Address } from "../types/models";
const options = [
  { path: "dados", label: "Dados pessoais", Icon: UserRound },
  { path: "notificacoes", label: "Notificações", Icon: Bell },
  { path: "enderecos", label: "Endereços", Icon: Home },
  { path: "texto", label: "Tamanho do texto", Icon: Type },
  { path: "ajuda", label: "Ajuda e suporte", Icon: HelpCircle },
  { path: "sair", label: "Sair da conta", Icon: LogOut },
];
const blank: Address = {
  id: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  tipo: "Casa",
};
export default function ProfilePage() {
  const { section } = useParams(),
    { profile, save } = useProfile(),
    [patient, setPatient] = useState(profile.patient),
    [message, setMessage] = useState(""),
    [address, setAddress] = useState<Address>(),
    [postalBusy, setPostalBusy] = useState(false),
    [addressError, setAddressError] = useState(""),
    [support, setSupport] = useState(false);
  const active =
    section === "notificacoes" && !prototypeExtras
      ? "dados"
      : section || "dados";
  function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    if (address.cep.replace(/\D/g, "").length !== 8) {
      setAddressError("Informe um CEP com 8 números.");
      return;
    }
    save({
      ...profile,
      addresses: [
        ...profile.addresses.filter((a) => a.id !== address.id),
        { ...address, id: address.id || crypto.randomUUID() },
      ],
    });
    setAddress(undefined);
    setMessage("Endereço salvo.");
  }
  return (
    <>
      <header className="page-header">
        <Link
          to="/perfil"
          className="mobile-only icon-button"
          aria-label="Voltar ao perfil"
        >
          <ArrowLeft />
        </Link>
        <h1>Meu perfil</h1>
      </header>
      <div
        className={`page-content profile-layout ${section ? "has-section" : ""}`}
      >
        <aside className="profile-menu">
          <div className="profile-identity">
            <span className="avatar">
              {profile.patient.nome
                .split(" ")
                .slice(0, 2)
                .map((s) => s[0])
                .join("")}
            </span>
            <div>
              <h2>{profile.patient.nome}</h2>
              <p>Paciente</p>
            </div>
          </div>
          <nav aria-label="Opções do perfil">
            {options
              .filter(
                (option) => prototypeExtras || option.path !== "notificacoes",
              )
              .map(({ path, label, Icon }) => (
                <Link
                  className={active === path ? "active" : ""}
                  key={path}
                  to={`/perfil/${path}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  <ChevronRight size={16} />
                </Link>
              ))}
          </nav>
        </aside>
        <section className="panel profile-content">
          {message && (
            <p role="status" className="success-message">
              {message}
            </p>
          )}
          {active === "dados" && (
            <>
              <h2>Dados pessoais</h2>
              <p>
                Mantenha seus dados atualizados para agilizar seus agendamentos.
              </p>

              <form
                className="profile-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  save({ ...profile, patient });
                  setMessage("Dados salvos.");
                }}
              >
                <label>
                  Nome completo
                  <input
                    required
                    minLength={3}
                    maxLength={100}
                    autoComplete="name"
                    value={patient.nome}
                    onChange={(e) =>
                      setPatient({ ...patient, nome: e.target.value })
                    }
                  />
                </label>
                <label>
                  E-mail
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={patient.email}
                    onChange={(e) =>
                      setPatient({ ...patient, email: e.target.value })
                    }
                  />
                </label>
                <label>
                  CPF
                  <input
                    inputMode="numeric"
                    maxLength={14}
                    pattern="[0-9.\-]{11,14}"
                    placeholder="000.000.000-00"
                    value={patient.cpf}
                    onChange={(e) =>
                      setPatient({ ...patient, cpf: e.target.value })
                    }
                  />
                </label>
                <label>
                  Celular
                  <input
                    type="tel"
                    autoComplete="tel"
                    pattern="[0-9 ()+\-]{10,20}"
                    value={patient.celular}
                    onChange={(e) =>
                      setPatient({ ...patient, celular: e.target.value })
                    }
                  />
                </label>
                <label>
                  Data de nascimento
                  <input
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={patient.nascimento}
                    onChange={(e) =>
                      setPatient({ ...patient, nascimento: e.target.value })
                    }
                  />
                </label>
                <div className="form-submit">
                  <button className="primary">Salvar alterações</button>
                </div>
              </form>
            </>
          )}
          {active === "notificacoes" && (
            <>
              <h2>Preferências de notificação</h2>
              <p>Escolha como você prefere receber lembretes e novidades.</p>
              <p className="hint">
                Preferências salvas neste dispositivo. O envio de avisos ainda
                não está disponível.
              </p>
              {Object.entries(profile.notifications).map(([name, enabled]) => (
                <div className="notification-row" key={name}>
                  <div>
                    <h3>
                      {name === "WhatsApp" ? "Lembrete por WhatsApp" : name}
                    </h3>
                    <p>
                      {name === "E-mails promocionais"
                        ? "Novidades, conteúdos de saúde e ofertas."
                        : "Confirmações e lembretes antes da consulta."}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={name}
                    className="switch"
                    onClick={() =>
                      save({
                        ...profile,
                        notifications: {
                          ...profile.notifications,
                          [name]: !enabled,
                        },
                      })
                    }
                  >
                    <span />
                  </button>
                </div>
              ))}
            </>
          )}
          {active === "enderecos" && (
            <>
              <Home className="section-icon" />
              <h2>Endereços</h2>
              <p>
                Cadastre seus endereços para encontrar clínicas próximas com
                mais facilidade.
              </p>
              {profile.addresses.map((a) => (
                <article className="address-card" key={a.id}>
                  <h3>{a.tipo}</h3>
                  <p>
                    {a.rua}, {a.numero} {a.complemento}
                  </p>
                  <p>
                    {a.bairro} · {a.cidade} / {a.uf}
                  </p>
                  <p>CEP {a.cep}</p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setAddressError("");
                      setAddress(a);
                    }}
                  >
                    Editar endereço
                  </button>
                </article>
              ))}
              <button
                className="outline"
                onClick={() => {
                  setAddressError("");
                  setAddress({ ...blank });
                }}
              >
                <Plus size={17} /> Adicionar endereço
              </button>
            </>
          )}
          {active === "texto" && (
            <>
              <h2>Tamanho do texto</h2>
              <p>Escolha o tamanho mais confortável para ler.</p>
              <div className="filter-row">
                {(["normal", "large"] as const).map((value) => (
                  <button
                    key={value}
                    className="filter"
                    aria-pressed={profile.textSize === value}
                    onClick={() => save({ ...profile, textSize: value })}
                  >
                    {value === "normal" ? "Normal" : "Grande"}
                  </button>
                ))}
              </div>
            </>
          )}
          {active === "ajuda" && (
            <>
              <HelpCircle className="section-icon" />
              <h2>Ajuda e suporte</h2>
              <p>Como podemos ajudar? Encontre respostas para suas dúvidas.</p>
              <div className="faq">
                {[
                  [
                    "Como cancelar uma consulta?",
                    "Abra Agenda, escolha a consulta e toque em Cancelar consulta. Confirme para cancelar. O registro continuará no histórico.",
                  ],
                  [
                    "Como pedir reembolso?",
                    "Consulte as condições de cancelamento e reembolso diretamente com a clínica.",
                  ],
                  [
                    "Posso remarcar meu horário?",
                    "Sim. Na Agenda, use Remarcar e escolha outro horário disponível.",
                  ],
                  [
                    "Onde encontro meus agendamentos?",
                    "Na opção Agenda do menu. As consultas canceladas ou passadas ficam no Histórico.",
                  ],
                ].map(([title, answer]) => (
                  <details key={title}>
                    <summary>{title}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
              <button className="primary" onClick={() => setSupport(true)}>
                Falar com o suporte
              </button>
            </>
          )}
          {active === "sair" && (
            <>
              <LogOut className="section-icon" />
              <h2>Sair da conta</h2>
              <p>Encerre a sessão e volte ao início quando quiser.</p>
              <button
                className="primary"
                onClick={() => save({ ...profile, signedOut: true })}
              >
                Sair da conta
              </button>
            </>
          )}
        </section>
      </div>
      {address && (
        <Modal
          title={address.id ? "Editar endereço" : "Adicionar novo endereço"}
          onClose={() => setAddress(undefined)}
        >
          <form onSubmit={saveAddress} className="address-form">
            <label>
              CEP
              <input
                required
                inputMode="numeric"
                maxLength={9}
                value={address.cep}
                placeholder="00000-000"
                onChange={(e) =>
                  setAddress({ ...address, cep: e.target.value })
                }
              />
            </label>
            <button
              type="button"
              className="outline"
              disabled={postalBusy}
              onClick={async () => {
                const queried = address.cep;
                setPostalBusy(true);
                setAddressError("");
                try {
                  const found = await lookupPostalCode(queried);
                  setAddress((current) =>
                    current?.cep === queried
                      ? { ...current, ...found }
                      : current,
                  );
                } catch (error) {
                  setAddressError(
                    error instanceof Error &&
                      error.name !== "TimeoutError" &&
                      error.name !== "TypeError"
                      ? error.message
                      : "Não foi possível buscar o CEP. Preencha manualmente.",
                  );
                } finally {
                  setPostalBusy(false);
                }
              }}
            >
              {postalBusy ? "Buscando CEP…" : "Buscar CEP"}
            </button>
            <p className="hint">
              Confira o endereço e informe o número. Você também pode preencher
              manualmente.
            </p>
            <label>
              Rua / Avenida
              <input
                required
                value={address.rua}
                onChange={(e) =>
                  setAddress({ ...address, rua: e.target.value })
                }
              />
            </label>
            <div className="form-columns">
              <label>
                Número
                <input
                  required
                  value={address.numero}
                  onChange={(e) =>
                    setAddress({ ...address, numero: e.target.value })
                  }
                />
              </label>
              <label>
                Complemento
                <input
                  value={address.complemento}
                  onChange={(e) =>
                    setAddress({ ...address, complemento: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Bairro
              <input
                required
                value={address.bairro}
                onChange={(e) =>
                  setAddress({ ...address, bairro: e.target.value })
                }
              />
            </label>
            <div className="form-columns">
              <label>
                Cidade
                <input
                  required
                  value={address.cidade}
                  onChange={(e) =>
                    setAddress({ ...address, cidade: e.target.value })
                  }
                />
              </label>
              <label>
                Estado (UF)
                <input
                  required
                  pattern="[A-Za-z]{2}"
                  maxLength={2}
                  value={address.uf}
                  onChange={(e) =>
                    setAddress({ ...address, uf: e.target.value.toUpperCase() })
                  }
                />
              </label>
            </div>
            <fieldset>
              <legend>Salvar como</legend>
              <div className="filter-row">
                {["Casa", "Trabalho", "Outro"].map((tipo) => (
                  <label key={tipo} className="address-type">
                    <input
                      type="radio"
                      name="tipo"
                      checked={address.tipo === tipo}
                      onChange={() => setAddress({ ...address, tipo })}
                    />
                    {tipo}
                  </label>
                ))}
              </div>
            </fieldset>
            {addressError && (
              <p className="error-message" role="alert">
                {addressError}
              </p>
            )}
            <div className="modal-actions">
              <button
                className="outline"
                type="button"
                onClick={() => setAddress(undefined)}
              >
                Cancelar
              </button>
              <button className="primary">Salvar endereço</button>
            </div>
          </form>
        </Modal>
      )}
      {support && (
        <Modal title="Falar com o suporte" onClose={() => setSupport(false)}>
          <p>
            O canal de atendimento ainda não foi informado pela equipe. Enquanto
            isso, consulte as respostas de ajuda desta página.
          </p>
          <button className="outline" onClick={() => setSupport(false)}>
            Voltar à ajuda
          </button>
        </Modal>
      )}
    </>
  );
}
