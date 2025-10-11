import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LanguageProvider } from "./contexts/LanguageContext";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TeamPage } from "./pages/TeamPage";
import { FAQPage } from "./pages/FAQPage";
import { ContactPage } from "./pages/ContactPage";
import { ProfileViewer, PROFILE_CONFIG } from "./pages/ProfileViewer";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/preview_page.html" element={<HomePage />} />
              <Route path="/hakkimizda/*" element={<AboutPage />} />
              <Route path="/hizmetler/*" element={<ServicesPage />} />
              <Route path="/projeler/*" element={<ProjectsPage />} />
              <Route path="/ekip/*" element={<TeamPage />} />
              <Route path="/sss/*" element={<FAQPage />} />
              <Route path="/iletisim/*" element={<ContactPage />} />
              <Route path="/furkanyonat/*" element={<ProfileViewer profile={PROFILE_CONFIG.furkanyonat} />} />
              <Route path="/gulbeneser/*" element={<ProfileViewer profile={PROFILE_CONFIG.gulbeneser} />} />
              <Route path="/kariyer/*" element={<ProfileViewer profile={PROFILE_CONFIG.kariyer} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}
