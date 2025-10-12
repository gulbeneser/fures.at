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

const KVKK_DOCUMENT: Record<Language, LegalDocumentContent> = {
  tr: {
    title: "KVKK Aydınlatma Metni",
    updatedOn: "Güncelleme tarihi: 10 Şubat 2025",
    intro: [
      "Fures Tech olarak kişisel verilerinizin güvenliğini sağlamak ve şeffaf bir şekilde bilgilendirmek önceliğimizdir. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla işlediğimiz kişisel verilere ilişkin sizleri aydınlatıyoruz.",
      "Bu metin; veri toplama yöntemlerimizi, amaçlarımızı, hukuki sebeplerimizi, aktarım süreçlerimizi ve veri sahibi olarak haklarınızı açıklar."
    ],
    sections: [
      {
        id: "methods",
        heading: "1. Kişisel Verilerin Toplanma Yöntemi",
        body: [
          "Kişisel verileriniz; web sitemizde yer alan iletişim formları, çevrimiçi toplantı planlama araçları, e-posta/telefon yazışmaları, fiziki formlar, iş ortaklarımız ve hizmet sözleşmelerimiz aracılığıyla otomatik veya kısmen otomatik yollarla toplanabilir.",
          "Müşteri adaylarımız, tedarikçilerimiz, iş ortaklarımız, çalışan adaylarımız ve etkinlik katılımcılarımız veri işleme kapsamındadır."
        ]
      },
      {
        id: "purposes",
        heading: "2. İşleme Amaçları",
        body: [
          "Kişisel verilerinizi aşağıdaki amaçlarla işleriz:",
          "• Hizmet tekliflerinin hazırlanması, sözleşmelerin kurulması ve ifası",
          "• Proje, bakım ve destek süreçlerinin yürütülmesi",
          "• Finans, muhasebe ve vergi yükümlülüklerinin yerine getirilmesi",
          "• Kurumsal iletişim, etkinlik yönetimi ve pazarlama faaliyetlerinin planlanması",
          "• Yasal taleplerin takibi ve yükümlülüklerin yerine getirilmesi",
          "• Bilgi güvenliği ve operasyonel risklerin yönetilmesi"
        ]
      },
      {
        id: "legal-basis",
        heading: "3. Hukuki Sebepler",
        body: [
          "Kişisel verilerinizi KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanarak işleriz:",
          "• Kanunlarda açıkça öngörülmesi",
          "• Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması",
          "• Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi",
          "• Bir hakkın tesisi, kullanılması veya korunması",
          "• Temel hak ve özgürlüklerinize zarar vermemek kaydıyla veri sorumlusunun meşru menfaati",
          "• Açık rızanızın bulunması (özellikle pazarlama iletişimleri ve etkinlikler için)"
        ]
      },
      {
        id: "transfers",
        heading: "4. Veri Aktarımları",
        body: [
          "Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:",
          "• Bulut bilişim, barındırma, e-posta ve iletişim teknolojileri sağlayıcıları",
          "• Muhasebe, finans ve hukuk danışmanları",
          "• İş ortaklarımız ve alt yüklenicilerimiz (sözleşme kapsamında gerekli hallerde)",
          "• Yetkili kamu kurum ve kuruluşları",
          "• Yurt dışına veri aktarımı gereken durumlarda, KVKK'nın 9. maddesi kapsamında Kurul tarafından belirlenen yeterlilik kararlarına ve standart sözleşmelere uygun hareket edilir."
        ]
      },
      {
        id: "rights",
        heading: "5. Veri Sahibi Hakları",
        body: [
          "KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:",
          "• Kişisel verilerinizin işlenip işlenmediğini öğrenme",
          "• İşlenmişse buna ilişkin bilgi talep etme",
          "• İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
          "• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
          "• Eksik veya yanlış işlenmişse düzeltilmesini isteme",
          "• KVKK'nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme",
          "• Bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
          "• İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
          "• Kanuna aykırı işleme sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme"
        ]
      },
      {
        id: "application",
        heading: "6. Başvuru Yöntemleri",
        body: [
          "Haklarınıza ilişkin taleplerinizi yazılı olarak veya kayıtlı elektronik posta (KEP), güvenli elektronik imza ya da tarafımıza daha önce bildirdiğiniz ve sistemimizde kayıtlı bulunan e-posta adresinizi kullanarak info@fures.at adresine iletebilirsiniz.",
          "Başvurularınızı kimliğinizi doğrulayan belgelerle birlikte bize ulaştırmanız gerekmektedir. Talepleriniz en geç 30 gün içinde sonuçlandırılır; maliyet gerektiren işlemler için Kişisel Verileri Koruma Kurumu tarafından belirlenen tarifedeki ücret talep edilebilir."
        ]
      }
    ],
    closingNote:
      "Bu Aydınlatma Metni, faaliyetlerimiz veya mevzuattaki değişiklikler doğrultusunda güncellenebilir. Güncel metne her zaman bu sayfadan erişebilirsiniz."
  },
  en: {
    title: "KVKK Disclosure (Information Notice)",
    updatedOn: "Last updated: 10 February 2025",
    intro: [
      "Fures Tech is committed to protecting your personal data and keeping you informed transparently. This notice explains our processing activities as the data controller under the Turkish Personal Data Protection Law No. 6698 (KVKK).",
      "It outlines how we collect personal data, the purposes and legal bases for processing, transfer mechanisms and the rights granted to data subjects."
    ],
    sections: [
      {
        id: "methods",
        heading: "1. Collection Methods",
        body: [
          "We collect personal data through the contact forms on our website, online meeting scheduling tools, email/phone correspondence, physical forms, business partners and service agreements using automated or partially automated means.",
          "Prospective clients, suppliers, business partners, job candidates and event participants fall within the scope of our data processing activities."
        ]
      },
      {
        id: "purposes",
        heading: "2. Purposes of Processing",
        body: [
          "We process personal data for the following purposes:",
          "• Preparing service proposals, concluding and performing contracts",
          "• Managing project delivery, maintenance and support",
          "• Fulfilling financial, accounting and tax obligations",
          "• Planning corporate communications, events and marketing activities",
          "• Following up on legal claims and meeting regulatory obligations",
          "• Managing information security and operational risks"
        ]
      },
      {
        id: "legal-basis",
        heading: "3. Legal Bases",
        body: [
          "Personal data are processed on the legal bases set out in Articles 5 and 6 of the KVKK:",
          "• Where expressly permitted by law",
          "• When necessary to conclude or perform a contract",
          "• For compliance with the data controller's legal obligations",
          "• For the establishment, exercise or protection of a right",
          "• For the legitimate interests of the data controller provided that your fundamental rights and freedoms are not harmed",
          "• Based on your explicit consent (especially for marketing communications and events)"
        ]
      },
      {
        id: "transfers",
        heading: "4. Data Transfers",
        body: [
          "We may share personal data with:",
          "• Cloud computing, hosting, email and communications technology providers",
          "• Accounting, finance and legal advisors",
          "• Our business partners and subcontractors where required under contractual obligations",
          "• Competent public authorities",
          "• Where data are transferred abroad, we comply with Article 9 of the KVKK by relying on adequacy decisions or standard contractual clauses approved by the Turkish Data Protection Authority."
        ]
      },
      {
        id: "rights",
        heading: "5. Data Subject Rights",
        body: [
          "You have the following rights under Article 11 of the KVKK:",
          "• To learn whether your personal data are processed",
          "• To request information about processing activities",
          "• To learn the purposes of processing and whether data are used accordingly",
          "• To learn the third parties to whom data are transferred domestically or abroad",
          "• To request correction of incomplete or inaccurate data",
          "• To request deletion or destruction under Article 7 of the KVKK",
          "• To request notification of such actions to third parties",
          "• To object to outcomes against you resulting from automated processing",
          "• To claim compensation in case you incur loss due to unlawful processing"
        ]
      },
      {
        id: "application",
        heading: "6. Application Procedure",
        body: [
          "You may submit your requests via written application, registered electronic mail (KEP), secure electronic signature or the email address previously notified to us by sending a message to info@fures.at.",
          "Please include documents verifying your identity. We will finalise your requests within 30 days. If your application requires additional cost, we may charge the fee set by the Turkish Data Protection Authority."
        ]
      }
    ],
    closingNote:
      "We may update this notice to reflect changes in our operations or legislation. The latest version is always available on this page."
  },
  ru: {
    title: "Уведомление KVKK",
    updatedOn: "Дата обновления: 10 февраля 2025 года",
    intro: [
      "Fures Tech стремится к прозрачной и безопасной обработке персональных данных. Настоящее уведомление подготовлено в соответствии с Законом Турецкой Республики Северного Кипра о защите персональных данных № 6698 (KVKK) и информирует о наших процессах обработки.",
      "Документ описывает способы сбора данных, цели и правовые основания обработки, передачу информации и права субъектов данных."
    ],
    sections: [
      {
        id: "methods",
        heading: "1. Методы сбора данных",
        body: [
          "Мы собираем данные через формы на сайте, инструменты планирования встреч, электронные письма, телефонные звонки, офлайн-документы, партнерские организации и договоры, используя автоматические или частично автоматические средства.",
          "К обработке относятся потенциальные клиенты, поставщики, партнеры, кандидаты и участники мероприятий."
        ]
      },
      {
        id: "purposes",
        heading: "2. Цели обработки",
        body: [
          "• Подготовка предложений, заключение и исполнение договоров",
          "• Ведение проектов, техническая поддержка и обслуживание",
          "• Выполнение финансовых, бухгалтерских и налоговых обязательств",
          "• Корпоративные коммуникации, управление мероприятиями и маркетинг",
          "• Реагирование на юридические запросы и выполнение нормативных требований",
          "• Управление информационной безопасностью и операционными рисками"
        ]
      },
      {
        id: "legal-basis",
        heading: "3. Правовые основания",
        body: [
          "Мы опираемся на основания, предусмотренные статьями 5 и 6 KVKK:",
          "• Наличие явного предписания закона",
          "• Необходимость заключения или исполнения договора",
          "• Исполнение юридических обязанностей контролера",
          "• Защита правовых интересов и предъявление требований",
          "• Законный интерес контролера при соблюдении ваших основных прав",
          "• Наличие вашего явного согласия (например, для маркетинга и мероприятий)"
        ]
      },
      {
        id: "transfers",
        heading: "4. Передача данных",
        body: [
          "Персональные данные могут передаваться:",
          "• Поставщикам облачных сервисов, хостинга, e-mail и коммуникационных платформ",
          "• Нашим бухгалтерам, финансовым и юридическим консультантам",
          "• Партнерам и подрядчикам, когда это требуется условиями договора",
          "• Уполномоченным государственным органам",
          "• При трансграничной передаче мы соблюдаем решения о надлежащем уровне защиты и стандартные договорные положения, утвержденные Управлением по защите данных."
        ]
      },
      {
        id: "rights",
        heading: "5. Права субъектов данных",
        body: [
          "Вы имеете права, перечисленные в статье 11 KVKK:",
          "• Узнавать, обрабатываются ли ваши данные",
          "• Запрашивать информацию об обработке",
          "• Узнавать цели и соответствие обработки",
          "• Получать сведения о получателях данных в Турции и за рубежом",
          "• Требовать исправления неполных или неверных данных",
          "• Требовать удаления или уничтожения данных в рамках статьи 7 KVKK",
          "• Требовать уведомления третьих лиц о выполненных операциях",
          "• Возражать против результатов, основанных исключительно на автоматизированной обработке",
          "• Требовать компенсации в случае ущерба"
        ]
      },
      {
        id: "application",
        heading: "6. Порядок обращения",
        body: [
          "Вы можете направить запрос письменно, через зарегистрированную электронную почту (KEP), с использованием защищённой электронной подписи или с зарегистрированного адреса электронной почты на info@fures.at.",
          "Необходимо предоставить документы, подтверждающие вашу личность. Запросы обрабатываются в течение 30 дней. В случае дополнительных затрат взимается сбор, установленный Управлением по защите данных."
        ]
      }
    ],
    closingNote:
      "Мы можем обновлять этот документ при изменении процессов или законодательства. Актуальная версия всегда доступна на этой странице."
  },
  de: {
    title: "KVKK-Hinweis",
    updatedOn: "Aktualisiert am: 10. Februar 2025",
    intro: [
      "Fures Tech informiert transparent über die Verarbeitung personenbezogener Daten. Dieser Hinweis erfüllt die Informationspflichten nach dem türkisch-zyprischen Datenschutzgesetz KVKK.",
      "Er erläutert unsere Erhebungsmethoden, Verarbeitungszwecke, Rechtsgrundlagen, Datenübermittlungen sowie die Rechte betroffener Personen."
    ],
    sections: [
      {
        id: "methods",
        heading: "1. Erhebungsmethoden",
        body: [
          "Daten werden über Website-Formulare, Online-Terminplanung, E-Mail-, Telefon- und Offline-Kommunikation, über Partner sowie im Rahmen von Dienstleistungsverträgen automatisiert oder teilautomatisiert erhoben.",
          "Betroffen sind Interessent:innen, Lieferant:innen, Partner, Bewerber:innen und Veranstaltungsteilnehmende."
        ]
      },
      {
        id: "purposes",
        heading: "2. Verarbeitungszwecke",
        body: [
          "• Erstellung von Angeboten, Vertragsabschluss und -erfüllung",
          "• Projektabwicklung, Support und Wartung",
          "• Erfüllung von Finanz-, Buchhaltungs- und Steuerpflichten",
          "• Unternehmenskommunikation, Event-Management und Marketing",
          "• Bearbeitung rechtlicher Anfragen und Einhaltung regulatorischer Vorgaben",
          "• Informationssicherheit und Risikomanagement"
        ]
      },
      {
        id: "legal-basis",
        heading: "3. Rechtsgrundlagen",
        body: [
          "Wir verarbeiten Daten gemäß Art. 5 und 6 KVKK auf folgenden Grundlagen:",
          "• Gesetzliche Verpflichtung",
          "• Erforderlichkeit zur Anbahnung oder Erfüllung eines Vertrags",
          "• Erfüllung rechtlicher Pflichten des Verantwortlichen",
          "• Geltendmachung, Ausübung oder Verteidigung rechtlicher Ansprüche",
          "• Berechtigtes Interesse des Verantwortlichen unter Wahrung Ihrer Grundrechte",
          "• Ihre ausdrückliche Einwilligung (z. B. für Marketing oder Events)"
        ]
      },
      {
        id: "transfers",
        heading: "4. Datenübermittlungen",
        body: [
          "Wir können Daten weitergeben an:",
          "• Anbieter von Cloud-, Hosting-, E-Mail- und Kommunikationstechnologien",
          "• Steuer-, Finanz- und Rechtsberater:innen",
          "• Geschäftspartner und Subunternehmer im Rahmen vertraglicher Verpflichtungen",
          "• Zuständige Behörden",
          "• Bei Auslandsübermittlungen halten wir uns an Angemessenheitsbeschlüsse oder von der Datenschutzbehörde genehmigte Standardvertragsklauseln."
        ]
      },
      {
        id: "rights",
        heading: "5. Betroffenenrechte",
        body: [
          "Gemäß Art. 11 KVKK haben Sie das Recht:",
          "• Zu erfahren, ob Daten verarbeitet werden",
          "• Informationen über Verarbeitungstätigkeiten zu erhalten",
          "• Den Zweck der Verarbeitung und die zweckentsprechende Nutzung zu prüfen",
          "• Empfänger:innen im In- und Ausland zu erfahren",
          "• Unrichtige oder unvollständige Daten berichtigen zu lassen",
          "• Löschung oder Vernichtung nach Art. 7 KVKK zu verlangen",
          "• Über Benachrichtigungen an Dritte informiert zu werden",
          "• Widerspruch gegen ausschließlich automatisierte Entscheidungen einzulegen",
          "• Schadensersatz bei unrechtmäßiger Verarbeitung zu fordern"
        ]
      },
      {
        id: "application",
        heading: "6. Antragsverfahren",
        body: [
          "Anfragen können schriftlich, per registrierter elektronischer Post (KEP), mit qualifizierter elektronischer Signatur oder über Ihre zuvor hinterlegte E-Mail-Adresse an info@fures.at gestellt werden.",
          "Bitte fügen Sie Identitätsnachweise bei. Wir beantworten Anfragen innerhalb von 30 Tagen; etwaige Gebühren richten sich nach den Vorgaben der Datenschutzbehörde."
        ]
      }
    ],
    closingNote:
      "Wir aktualisieren diesen Hinweis bei Änderungen unserer Prozesse oder der Rechtslage. Die aktuelle Version finden Sie jederzeit auf dieser Seite."
  }
};

export function KvkkDisclosurePage() {
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
      `${t("seo.common.keywords")}, ${t("seo.kvkk.keywords")}`
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
        { name: t("footer.kvkk"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath]
  );

  useSEO({
    title: t("seo.kvkk.title"),
    description: t("seo.kvkk.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.kvkk.title"),
      description: t("seo.kvkk.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.kvkk.title"),
      description: t("seo.kvkk.description")
    },
    structuredData
  });

  return <LegalDocument content={KVKK_DOCUMENT[language]} />;
}
