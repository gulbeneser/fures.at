import { useState } from 'react';
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
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { CookiePolicyPage } from "./pages/CookiePolicyPage";
import { KvkkDisclosurePage } from "./pages/KvkkDisclosurePage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import AssistantWidget from "./furesai/components/AssistantWidget";
import ChatWindow from "./furesai/components/ChatWindow";

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

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
              <Route path="/gizlilik-politikasi" element={<PrivacyPolicyPage />} />
              <Route path="/cerez-politikasi" element={<CookiePolicyPage />} />
              <Route path="/kvkk-aydinlatma-metni" element={<KvkkDisclosurePage />} />
              <Route path="/furkanyonat/*" element={<ProfileViewer profile={PROFILE_CONFIG.furkanyonat} />} />
              <Route path="/gulbeneser/*" element={<ProfileViewer profile={PROFILE_CONFIG.gulbeneser} />} />
              <Route path="/kariyer/*" element={<ProfileViewer profile={PROFILE_CONFIG.kariyer} />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <AssistantWidget isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
          {isChatOpen && <ChatWindow closeChat={() => setIsChatOpen(false)} />}
        </div>
      </Router>
    </LanguageProvider>
  );
}
