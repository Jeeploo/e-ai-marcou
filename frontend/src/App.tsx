import { SearchProvider } from "./hooks/SearchContext";
import { Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import HomePage from "./pages/HomePage";
import { SearchPage, NotFoundPage } from "./pages/DiscoveryPages";
import { ProfessionalPage, ConfirmPage } from "./pages/BookingPages";
import AgendaPage from "./pages/AgendaPage";
import ProfilePage from "./pages/ProfilePage";
import { ProfileProvider } from "./hooks/ProfileContext";
import { CatalogProvider } from "./hooks/CatalogContext";
import { AccessibilityWidget } from "./accessibility-module";
export default function App() {
  return (
    <ProfileProvider>
      <SearchProvider>
        <CatalogProvider>
          <div data-a11y-content>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/busca" element={<SearchPage />} />
                <Route
                  path="/profissional/:id"
                  element={<ProfessionalPage />}
                />
                <Route path="/confirmar" element={<ConfirmPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/perfil/:section" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </div>
          <AccessibilityWidget
            title="Preferências — e aí, marcou?"
            storageKey="marcou:a11y:v1"
          />
        </CatalogProvider>
      </SearchProvider>
    </ProfileProvider>
  );
}
