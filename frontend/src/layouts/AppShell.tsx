import { useEffect, useState } from "react";
import {
  CalendarDays,
  Home,
  MapPin,
  Plus,
  Search,
  UserRound,
  WifiOff,
  Download,
} from "lucide-react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useOnline } from "../hooks/useOnline";
import { useProfile } from "../hooks/ProfileContext";
import { demoMode } from "../services/api";
const navigation = [
  { to: "/", text: "Início", Icon: Home },
  { to: "/busca", text: "Busca", Icon: Search },
  { to: "/agenda", text: "Agenda", Icon: CalendarDays },
  { to: "/perfil", text: "Perfil", Icon: UserRound },
];
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export default function AppShell() {
  const online = useOnline(),
    { profile, save } = useProfile(),
    location = useLocation(),
    [install, setInstall] = useState<InstallEvent>();
  useEffect(() => {
    const listener = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  if (profile.signedOut)
    return (
      <div className="signed-out">
        <h1>Você saiu da demonstração</h1>
        <p>Não há uma conta autenticada nesta versão.</p>
        <button
          className="primary"
          onClick={() => save({ ...profile, signedOut: false })}
        >
          Voltar à demonstração
        </button>
      </div>
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="e aí, marcou? — Início">
          <span className="brand-icon">
            <CalendarDays size={43} />
            <Plus className="brand-plus" size={23} />
            <MapPin className="brand-pin" size={27} />
          </span>
          <span>
            e aí,<strong>marcou?</strong>
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="navigation">
          {navigation.map(({ to, text, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                isActive ||
                (to === "/busca" &&
                  /^\/(profissional|confirmar)/.test(location.pathname))
                  ? "active"
                  : ""
              }
            >
              <Icon size={21} />
              <span>{text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar small" aria-hidden="true">
            {profile.patient.nome
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")}
          </span>
          <div>
            <strong>{profile.patient.nome}</strong>
            <span>Paciente{demoMode ? " · demonstração" : ""}</span>
          </div>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1}>
        {demoMode && (
          <div className="demo-notice">
            Demonstração · dados fictícios e agendamentos locais, sem reserva
            real.
          </div>
        )}
        {!online && (
          <div className="offline-notice" role="status">
            <WifiOff size={18} />
            Você está sem internet. Agendar, remarcar e cancelar exigem conexão.
          </div>
        )}
        {install && (
          <button
            className="install-button"
            onClick={async () => {
              await install.prompt();
              await install.userChoice;
              setInstall(undefined);
            }}
          >
            <Download size={16} />
            Instalar aplicativo
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}
