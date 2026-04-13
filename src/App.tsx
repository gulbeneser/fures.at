import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from "./components/Header";
import { HeaderDE } from "./components/HeaderDE";
import { Footer } from "./components/Footer";
import { FooterDE } from "./components/FooterDE";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TeamPage } from "./pages/TeamPage";
import { FAQPage } from "./pages/FAQPage";
import { ContactPage } from "./pages/ContactPage";
import { ProfileViewer, PROFILE_CONFIG } from "./pages/ProfileViewer";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { CookiePolicyPage } from "./pages/CookiePolicyPage";
import { KvkkDisclosurePage } from "./pages/KvkkDisclosurePage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { CampaignListPage } from "./pages/CampaignListPage";
import { CampaignPostPage } from "./pages/CampaignPostPage";
import { HomePageDE } from "./pages/de/HomePageDE";
import { ServicesPageDE } from "./pages/de/ServicesPageDE";
import { ContactPageDE } from "./pages/de/ContactPageDE";
import AssistantWidget from "./furesai/components/AssistantWidget";
import ChatWindow from "./furesai/components/ChatWindow";

// Detects browser language and redirects to /de or /tr
function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const langs = Array.isArray(navigator.languages)
      ? navigator.languages
      : [navigator.language];
    const isDE = langs.some((l) => {
      const code = l.toLowerCase();
      return code.startsWith('de') || code.startsWith('at') || code === 'gsw';
    });
    navigate(isDE ? '/de' : '/tr', { replace: true });
  }, [navigate]);

  return null;
}

// TR site layout – dark neon theme
function TRLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ThemeProvider theme="dark">
      <LanguageProvider initialLanguage="tr">
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hakkimizda/*" element={<AboutPage />} />
              <Route path="/hizmetler/*" element={<ServicesPage />} />
              <Route path="/projeler/*" element={<ProjectsPage />} />
              <Route path="/ekip/*" element={<TeamPage />} />
              <Route path="/sss/*" element={<FAQPage />} />
              <Route path="/iletisim/*" element={<ContactPage />} />
              <Route path="/gizlilik-politikasi" element={<PrivacyPolicyPage />} />
              <Route path="/cerez-politikasi" element={<CookiePolicyPage />} />
              <Route path="/kvkk-aydinlatma-metni" element={<KvkkDisclosurePage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/kampanyalar" element={<CampaignListPage />} />
              <Route path="/kampanyalar/:slug" element={<CampaignPostPage />} />
              <Route path="*" element={<Navigate to="/tr" replace />} />
            </Routes>
          </main>
          <Footer />
          <AssistantWidget isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
          {isChatOpen && <ChatWindow closeChat={() => setIsChatOpen(false)} />}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// DE site layout – minimal light theme for DACH market
function DELayout() {
  return (
    <ThemeProvider theme="light">
      <LanguageProvider initialLanguage="de">
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
          <HeaderDE />
          <main>
            <Routes>
              <Route path="/" element={<HomePageDE />} />
              <Route path="/leistungen" element={<ServicesPageDE />} />
              <Route path="/kontakt" element={<ContactPageDE />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="*" element={<Navigate to="/de" replace />} />
            </Routes>
          </main>
          <FooterDE />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Root: auto-redirect by browser language */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/preview_page.html" element={<RootRedirect />} />

        {/* Legacy un-prefixed paths → redirect to /tr */}
        <Route path="/hakkimizda/*" element={<Navigate to="/tr/hakkimizda" replace />} />
        <Route path="/hizmetler/*" element={<Navigate to="/tr/hizmetler" replace />} />
        <Route path="/projeler/*" element={<Navigate to="/tr/projeler" replace />} />
        <Route path="/ekip/*" element={<Navigate to="/tr/ekip" replace />} />
        <Route path="/sss/*" element={<Navigate to="/tr/sss" replace />} />
        <Route path="/iletisim/*" element={<Navigate to="/tr/iletisim" replace />} />
        <Route path="/blog" element={<Navigate to="/tr/blog" replace />} />
        <Route path="/blog/:slug" element={<Navigate to="/tr/blog" replace />} />
        <Route path="/kampanyalar" element={<Navigate to="/tr/kampanyalar" replace />} />
        <Route path="/kampanyalar/:slug" element={<Navigate to="/tr/kampanyalar" replace />} />

        {/* Profile pages (keep at root for backwards-compat) */}
        <Route path="/furkanyonat/*" element={
          <LanguageProvider initialLanguage="tr">
            <ProfileViewer profile={PROFILE_CONFIG.furkanyonat} />
          </LanguageProvider>
        } />
        <Route path="/gulbeneser/*" element={
          <LanguageProvider initialLanguage="tr">
            <ProfileViewer profile={PROFILE_CONFIG.gulbeneser} />
          </LanguageProvider>
        } />
        <Route path="/kariyer/*" element={
          <LanguageProvider initialLanguage="tr">
            <ProfileViewer profile={PROFILE_CONFIG.kariyer} />
          </LanguageProvider>
        } />

        {/* TR locale */}
        <Route path="/tr/*" element={<TRLayout />} />

        {/* DE locale */}
        <Route path="/de/*" element={<DELayout />} />

        {/* Catch-all */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}
