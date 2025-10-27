import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const logoSrc = "/images/fures.png";

  const footerLinks = [
    { title: t('nav.about'), href: "/hakkimizda" },
    { title: t('nav.services'), href: "/hizmetler" },
    { title: t('nav.projects'), href: "/projeler" },
    { title: t('nav.campaigns'), href: "/kampanyalar" },
    { title: t('nav.blog'), href: "/blog" },
    { title: 'Ekip', href: "/ekip" },
    { title: 'SSS', href: "/sss" },
    { title: t('nav.contact'), href: "/iletisim" }
  ];

  const legalLinks = [
    { title: t('footer.privacy'), href: "/gizlilik-politikasi" },
    { title: t('footer.cookies'), href: "/cerez-politikasi" },
    { title: t('footer.kvkk'), href: "/kvkk-aydinlatma-metni" }
  ];

  return (
    <footer className="relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          {/* Logo */}
          <div>
            <Link to="/">
              <img
                src={logoSrc}
                alt="Fures Tech"
                className="h-10 w-auto transition-transform hover:scale-110 duration-300"
              />
            </Link>
          </div>

          {/* Links with Hover Glow */}
          <nav className="flex flex-wrap gap-6">
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="relative text-gray-400 hover:text-orange-400 transition-colors duration-300 group"
              >
                {link.title}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider with Gradient */}
        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm text-center md:text-left">
            <p>{t('footer.copyright')}</p>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
