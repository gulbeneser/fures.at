import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LegalDocument, type LegalDocumentContent } from "../components/LegalDocument";
import { useLanguage, type Language } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createOrganizationSchema
} from "../hooks/useSEO";

const COOKIE_DOCUMENT: Record<Language, LegalDocumentContent> = {
  tr: {
    title: "Çerez Politikası",
    updatedOn: "Güncelleme tarihi: 10 Şubat 2025",
    intro: [
      "Bu Çerez Politikası, fures.at adresli web sitemizi ziyaret ettiğinizde kullanılan çerez ve benzeri teknolojiler hakkında sizi bilgilendirmek için hazırlanmıştır. Çerez tercihlerinizi dilediğiniz zaman yönetebilir, açık rızanızı geri çekebilirsiniz.",
      "Çerezler, web sitemizin doğru çalışması, kullanım deneyiminin iyileştirilmesi, performansın ölçülmesi ve pazarlama faaliyetlerinin optimize edilmesi için kullanılan küçük metin dosyalarıdır."
    ],
    sections: [
      {
        id: "definitions",
        heading: "1. Çerez Türleri",
        body: [
          "Web sitemizde aşağıdaki çerez kategorileri kullanılabilir:",
          "• Zorunlu çerezler: Sitenin temel fonksiyonları için gereklidir. Oturum açma, form doldurma ve güvenlik gibi işlemler bu çerezler olmadan yürütülemez.",
          "• Performans çerezleri: Ziyaretçi sayılarını, trafik kaynaklarını ve sayfa etkileşimlerini anonim şekilde analiz ederek deneyimi optimize etmemizi sağlar.",
          "• İşlevsel çerezler: Dil seçimi, bölge gibi kişiselleştirilmiş tercihlerinizi hatırlayarak kullanım kolaylığı sunar.",
          "• Pazarlama çerezleri: İlgi alanlarınıza göre kampanya ve içerik önerileri sunmamıza yardımcı olur. Bu çerezler yalnızca açık rızanızla etkinleştirilir."
        ]
      },
      {
        id: "third-parties",
        heading: "2. Üçüncü Taraf Çerezleri",
        body: [
          "Google Analytics, Meta Pixel, LinkedIn Insights Tag gibi analiz ve reklam araçları, anonimleştirilmiş istatistikler üretmek veya dönüşüm ölçmek amacıyla çerez kullanabilir.",
          "Bu sağlayıcılar aracılığıyla toplanan veriler, yalnızca ilgili hizmetlerin sağlanması için kullanılır; KVKK ve GDPR kapsamında gerekli teknik ve idari önlemler alınır.",
          "Üçüncü taraf sağlayıcıların çerez politikalarına erişmek için ilgili servislerin web sitelerini ziyaret edebilirsiniz."
        ]
      },
      {
        id: "management",
        heading: "3. Çerezleri Yönetme",
        body: [
          "Çerez tercihlerinizi üç şekilde yönetebilirsiniz:",
          "• Web sitemizdeki çerez yönetim paneli üzerinden hangi çerezlere izin verdiğinizi güncelleyebilirsiniz.",
          "• Tarayıcınızın ayarları aracılığıyla mevcut çerezleri silebilir ve gelecekteki çerezleri engelleyebilirsiniz.",
          "• Üçüncü taraf reklam sağlayıcılarının tercih sayfalarından hedefli reklamcılık ayarlarınızı kontrol edebilirsiniz.",
          "Çerezleri devre dışı bırakmanız durumunda, web sitemizin bazı özellikleri beklediğiniz gibi çalışmayabilir."
        ]
      },
      {
        id: "storage",
        heading: "4. Saklama Süreleri",
        body: [
          "Oturum çerezleri tarayıcınızı kapattığınızda otomatik olarak silinir. Kalıcı çerezler ise amaçlarına bağlı olarak en fazla 24 ay boyunca cihazınızda tutulur.",
          "Rıza tabanlı çerezler için verdiğiniz onayı dilediğiniz zaman geri çekebilir, çerezleri silebilir ya da yeniden etkinleştirebilirsiniz."
        ]
      },
      {
        id: "updates",
        heading: "5. Politika Güncellemeleri",
        body: [
          "Çerez kullanımımıza yönelik değişiklikler olması halinde bu politikayı güncelleriz. Güncel sürüme her zaman bu sayfadan ulaşabilirsiniz."
        ]
      }
    ],
    closingNote:
      "Çerez tercihlerinize veya kişisel verilerinizin işlenmesine ilişkin sorularınızı info@fures.at adresine iletebilirsiniz. Gizlilik Politikamız ve KVKK Aydınlatma Metnimiz çerezler dışında kalan tüm veri işleme faaliyetlerini açıklar."
  },
  en: {
    title: "Cookie Policy",
    updatedOn: "Last updated: 10 February 2025",
    intro: [
      "This Cookie Policy explains how we use cookies and similar technologies when you visit our website at fures.at. You can manage your preferences or withdraw your consent at any time.",
      "Cookies are small text files that enable the website to function properly, improve user experience, measure performance and tailor marketing activities."
    ],
    sections: [
      {
        id: "definitions",
        heading: "1. Types of Cookies",
        body: [
          "We may use the following categories of cookies on our website:",
          "• Strictly necessary cookies: Required for core site functionality such as session management, form submissions and security.",
          "• Performance cookies: Help us analyse visits, traffic sources and page interactions in an anonymous way to optimise the experience.",
          "• Functional cookies: Remember your preferences (e.g. language, region) to deliver a personalised experience.",
          "• Marketing cookies: Allow us to present campaigns and content aligned with your interests. These cookies are activated only with your explicit consent."
        ]
      },
      {
        id: "third-parties",
        heading: "2. Third-Party Cookies",
        body: [
          "Tools such as Google Analytics, Meta Pixel and LinkedIn Insights Tag may use cookies to generate anonymised statistics or measure conversions.",
          "Data collected through these providers are used solely to deliver the respective services, and we implement the technical and organisational safeguards required under KVKK and GDPR.",
          "You can review the cookie policies of each provider on their official websites."
        ]
      },
      {
        id: "management",
        heading: "3. Managing Cookies",
        body: [
          "You can manage your cookie preferences in three ways:",
          "• Update your selections through the cookie consent banner available on our website.",
          "• Configure your browser settings to delete existing cookies or block future cookies.",
          "• Control interest-based advertising preferences on the settings pages of third-party ad providers.",
          "If you disable cookies, certain features of our website may not operate as expected."
        ]
      },
      {
        id: "storage",
        heading: "4. Retention",
        body: [
          "Session cookies are deleted automatically when you close your browser. Persistent cookies remain on your device for up to 24 months depending on their purpose.",
          "You may withdraw your consent for optional cookies at any time, delete the cookies or enable them again when needed."
        ]
      },
      {
        id: "updates",
        heading: "5. Updates to This Policy",
        body: [
          "We will update this policy whenever we make changes to our use of cookies. The latest version is always available on this page."
        ]
      }
    ],
    closingNote:
      "For questions about your cookie preferences or the processing of your personal data, please contact info@fures.at. Our Privacy Policy and KVKK Disclosure explain all processing activities beyond cookies."
  },
  ru: {
    title: "Политика файлов cookie",
    updatedOn: "Дата обновления: 10 февраля 2025 года",
    intro: [
      "Настоящая политика описывает использование cookie и аналогичных технологий при посещении сайта fures.at. Вы можете в любой момент изменить свои предпочтения или отозвать согласие.",
      "Cookie — это небольшие текстовые файлы, которые помогают сайту корректно работать, улучшать пользовательский опыт, измерять производительность и адаптировать маркетинговые активности."
    ],
    sections: [
      {
        id: "definitions",
        heading: "1. Типы cookie",
        body: [
          "Мы можем использовать следующие категории:",
          "• Обязательные cookie: обеспечивают базовые функции сайта, такие как управление сессией, отправка форм и безопасность.",
          "• Аналитические cookie: анонимно измеряют посещаемость, источники трафика и взаимодействие со страницами.",
          "• Функциональные cookie: запоминают предпочтения, например язык и регион, чтобы предоставить персонализированный опыт.",
          "• Маркетинговые cookie: позволяют показывать релевантные кампании и предложения. Активируются только с вашего согласия."
        ]
      },
      {
        id: "third-parties",
        heading: "2. Сторонние cookie",
        body: [
          "Инструменты Google Analytics, Meta Pixel, LinkedIn Insights и другие партнёры могут использовать cookie для создания агрегированных статистик или измерения конверсий.",
          "Полученные данные применяются исключительно для предоставления соответствующих сервисов, а Fures Tech обеспечивает технические и организационные меры защиты в соответствии с KVKK и GDPR.",
          "Политики cookie сторонних провайдеров доступны на их официальных веб-сайтах."
        ]
      },
      {
        id: "management",
        heading: "3. Управление cookie",
        body: [
          "Вы можете управлять настройками следующими способами:",
          "• Через баннер/панель согласия на нашем сайте.",
          "• Через настройки браузера, удаляя существующие cookie и блокируя будущие.",
          "• На страницах предпочтений сторонних рекламных сетей, регулируя персонализированную рекламу.",
          "Отключение cookie может привести к некорректной работе отдельных функций сайта."
        ]
      },
      {
        id: "storage",
        heading: "4. Срок хранения",
        body: [
          "Сессионные cookie удаляются при закрытии браузера. Постоянные cookie хранятся на устройстве до 24 месяцев в зависимости от цели.",
          "Вы можете отозвать согласие, удалить или вновь активировать cookie в любое время."
        ]
      },
      {
        id: "updates",
        heading: "5. Обновления политики",
        body: [
          "В случае изменений в использовании cookie мы обновим данный документ. Актуальная версия всегда доступна на этой странице."
        ]
      }
    ],
    closingNote:
      "По вопросам, связанным с cookie или обработкой персональных данных, обращайтесь на info@fures.at. Политика конфиденциальности и уведомление KVKK описывают все прочие процессы обработки данных."
  },
  de: {
    title: "Cookie-Richtlinie",
    updatedOn: "Aktualisiert am: 10. Februar 2025",
    intro: [
      "Diese Richtlinie erläutert die Verwendung von Cookies und ähnlichen Technologien, wenn Sie fures.at besuchen. Sie können Ihre Präferenzen jederzeit anpassen oder Ihre Einwilligung widerrufen.",
      "Cookies sind kleine Textdateien, die den ordnungsgemäßen Betrieb der Website unterstützen, die Nutzererfahrung verbessern, die Leistung messen und Marketingaktivitäten personalisieren."
    ],
    sections: [
      {
        id: "definitions",
        heading: "1. Cookie-Kategorien",
        body: [
          "Wir setzen gegebenenfalls folgende Cookies ein:",
          "• Erforderliche Cookies: Notwendig für grundlegende Funktionen wie Sitzungsverwaltung, Formularübermittlungen und Sicherheit.",
          "• Analyse-Cookies: Erfassen anonymisierte Statistiken zu Besuchern, Traffic-Quellen und Seiteninteraktionen.",
          "• Funktionale Cookies: Speichern Einstellungen wie Sprache oder Region für ein personalisiertes Erlebnis.",
          "• Marketing-Cookies: Unterstützen zielgerichtete Kampagnen und Angebote. Sie werden nur mit Ihrer ausdrücklichen Einwilligung aktiviert."
        ]
      },
      {
        id: "third-parties",
        heading: "2. Cookies von Drittanbietern",
        body: [
          "Tools wie Google Analytics, Meta Pixel oder LinkedIn Insights Tag können Cookies einsetzen, um statistische Auswertungen zu erstellen oder Conversions zu messen.",
          "Die dabei verarbeiteten Daten werden ausschließlich zur Bereitstellung der jeweiligen Dienste genutzt; Fures Tech gewährleistet die technischen und organisatorischen Schutzmaßnahmen gemäß KVKK und DSGVO.",
          "Weitere Informationen finden Sie in den Cookie-Richtlinien der jeweiligen Anbieter."
        ]
      },
      {
        id: "management",
        heading: "3. Verwaltung von Cookies",
        body: [
          "Sie können Ihre Einstellungen wie folgt anpassen:",
          "• Über das Consent-Banner auf unserer Website.",
          "• In den Browser-Einstellungen, indem Sie Cookies löschen oder blockieren.",
          "• Über die Präferenzseiten von Drittanbietern für personalisierte Werbung.",
          "Bitte beachten Sie, dass bestimmte Funktionen der Website bei deaktivierten Cookies eingeschränkt sein können."
        ]
      },
      {
        id: "storage",
        heading: "4. Speicherdauer",
        body: [
          "Sitzungscookies werden beim Schließen des Browsers gelöscht. Persistente Cookies verbleiben je nach Zweck bis zu 24 Monate auf Ihrem Gerät.",
          "Sie können Ihre Einwilligung jederzeit widerrufen, Cookies löschen oder erneut aktivieren."
        ]
      },
      {
        id: "updates",
        heading: "5. Aktualisierung der Richtlinie",
        body: [
          "Wenn wir den Einsatz von Cookies ändern, aktualisieren wir diese Richtlinie. Die aktuelle Version finden Sie stets auf dieser Seite."
        ]
      }
    ],
    closingNote:
      "Bei Fragen zu Cookies oder zur Verarbeitung personenbezogener Daten wenden Sie sich bitte an info@fures.at. Unsere Datenschutzerklärung und der KVKK-Hinweis erläutern alle weiteren Verarbeitungstätigkeiten."
  }
};

export function CookiePolicyPage() {
  const { language, t } = useLanguage();
  const location = useLocation();

  const canonicalPath = useMemo(
    () => canonicalPathForLanguage(location.pathname, language),
    [location.pathname, language]
  );

  const alternates = useMemo(
    () => buildLanguageAlternates(location.pathname),
    [location.pathname]
  );

  const keywords = useMemo(
    () =>
      `${t("seo.common.keywords")}, ${t("seo.cookies.keywords")}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, t]
  );

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      createBreadcrumbSchema([
        { name: t("nav.home"), path: canonicalPathForLanguage("/", language) },
        { name: t("footer.cookies"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath]
  );

  useSEO({
    title: t("seo.cookies.title"),
    description: t("seo.cookies.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.cookies.title"),
      description: t("seo.cookies.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.cookies.title"),
      description: t("seo.cookies.description")
    },
    structuredData
  });

  return <LegalDocument content={COOKIE_DOCUMENT[language]} />;
}
