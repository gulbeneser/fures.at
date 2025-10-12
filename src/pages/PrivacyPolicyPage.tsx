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

const PRIVACY_DOCUMENT: Record<Language, LegalDocumentContent> = {
  tr: {
    title: "Gizlilik Politikası",
    updatedOn: "Güncelleme tarihi: 10 Şubat 2025",
    intro: [
      "Fures Tech olarak kişisel verilerinizin gizliliğini ve güvenliğini en yüksek standartlarda koruyoruz. Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) başta olmak üzere yürürlükteki mevzuata uyum sağlamak üzere hazırlanmıştır.",
      "Web sitemizden, sosyal medya hesaplarımızdan, e-posta ve telefon iletişimlerimizden ya da hizmet sözleşmelerimizden elde edilen tüm kişisel verileri bu metinde belirtilen ilkeler doğrultusunda işler, saklar ve güvence altına alırız."
    ],
    sections: [
      {
        id: "controller",
        heading: "1. Veri Sorumlusu",
        body: [
          "Veri sorumlusu: Fures Tech",
          "Adres: Gazimağusa, Kuzey Kıbrıs Türk Cumhuriyeti",
          "E-posta: info@fures.at",
          "Telefon: +90 (548) 876 68 19",
          "Bu metin kapsamındaki kişisel verilerinizden Fures Tech sorumludur. Sorularınız veya talepleriniz için bize dilediğiniz zaman ulaşabilirsiniz."
        ]
      },
      {
        id: "data",
        heading: "2. İşlediğimiz Kişisel Veri Kategorileri",
        body: [
          "İletişim ve proje planlama süreçlerinde aşağıdaki veri kategorilerini işleyebiliriz:",
          "• Kimlik ve iletişim bilgileri (ad, soyad, şirket bilgileri, e-posta, telefon, ülke).",
          "• Kurumsal bilgiler (marka adı, sektör, web sitesi, proje gereksinimleri).",
          "• Sözleşme ve faturalama verileri (vergi numarası, fatura adresi, yetkili kişi bilgileri).",
          "• Web sitesi ve dijital etkileşim verileri (IP adresi, tarayıcı bilgileri, ziyaret ettiğiniz sayfalar, çerez tercihleri).",
          "• Destek kayıtları ve yazışma geçmişi (e-posta, WhatsApp, çağrı kayıt notları)."
        ]
      },
      {
        id: "purposes",
        heading: "3. Kişisel Verileri İşleme Amaçlarımız ve Hukuki Sebepler",
        body: [
          "Kişisel verilerinizi yalnızca aşağıdaki amaçlar ve KVKK'nın 5. ve 6. maddelerinde belirtilen hukuki sebepler dahilinde işleriz:",
          "• Talep ve tekliflerinizi değerlendirmek, hizmet sözleşmeleri hazırlamak ve ifa etmek (sözleşmenin kurulması ve ifası için zorunlu olması).",
          "• Faturalama, yasal yükümlülüklerin yerine getirilmesi, muhasebe kayıtlarının tutulması (hukuki yükümlülüğün yerine getirilmesi).",
          "• Teknik destek, bakım ve güncelleme taleplerinizi yönetmek (meşru menfaatimiz).",
          "• Müşteri memnuniyetini ölçmek, hizmet kalitesini geliştirmek ve iletişim tercihlerinizi yönetmek (açık rıza veya meşru menfaat).",
          "• Dijital pazarlama faaliyetleri için gerekli olması halinde açık rızanıza dayalı kampanya ve duyuru gönderimleri yapmak."
        ]
      },
      {
        id: "cookies",
        heading: "4. Çerezler ve Benzeri Teknolojiler",
        body: [
          "Web sitemizde zorunlu, performans, işlevsel ve pazarlama kategorilerinde çerezler kullanabiliriz. Çerez kullanımımıza ilişkin detaylı bilgi ve yönetim seçenekleri için Çerez Politikamızı inceleyebilirsiniz.",
          "Tarayıcınızın ayarlarını değiştirerek çerez tercihlerinizi her zaman düzenleyebilir veya sitemizde yer alan çerez yönetim aracını kullanarak rıza durumunuzu güncelleyebilirsiniz."
        ]
      },
      {
        id: "sharing",
        heading: "5. Kişisel Verilerin Aktarımı",
        body: [
          "Kişisel verileriniz yalnızca hizmetlerin yürütülmesi için zorunlu olan durumlarda ve yeterli güvenlik önlemlerini sağlayan aşağıdaki alıcı gruplarıyla paylaşılabilir:",
          "• Bulut altyapısı, barındırma, e-posta ve proje yönetimi sağlayıcıları",
          "• Finansal süreçler için yetkili mali müşavirler ve ödeme kuruluşları",
          "• Hukuki talepler veya denetimler için yetkili kamu kurumları",
          "• Uluslararası veri aktarımı gereken durumlarda, GDPR 46. madde kapsamında standart sözleşme maddeleri ve ek güvenlik tedbirleri uygulanır."
        ]
      },
      {
        id: "retention",
        heading: "6. Saklama Süreleri",
        body: [
          "Kişisel verileriniz işleme amaçları ortadan kalktığında veya ilgili mevzuatta öngörülen süre dolduğunda silinir, anonim hale getirilir ya da imha edilir. Genel saklama sürelerimiz şöyledir:",
          "• Sözleşme ve faturalama kayıtları: Vergi ve ticaret mevzuatı gereği 10 yıl",
          "• Destek ve yazışma kayıtları: 3 yıl",
          "• Pazarlama iletişimleri: Açık rızanızı geri çekene kadar",
          "• Web sitesi trafiğine ilişkin teknik veriler: 2 yıl"
        ]
      },
      {
        id: "rights",
        heading: "7. KVKK Kapsamındaki Haklarınız",
        body: [
          "KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:",
          "• Kişisel verilerinizin işlenip işlenmediğini öğrenme",
          "• İşlenmişse bilgi talep etme",
          "• İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
          "• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
          "• Eksik veya yanlış işlenmişse düzeltilmesini isteme",
          "• İşleme şartlarının ortadan kalkması hâlinde silinmesini veya yok edilmesini isteme",
          "• Yapılan işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
          "• İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
          "• Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme"
        ]
      },
      {
        id: "security",
        heading: "8. Veri Güvenliği",
        body: [
          "Kişisel verilerinizi yetkisiz erişim, kayıp, yanlış kullanım, ifşa veya değiştirilmelere karşı korumak için teknik ve idari tedbirler uygularız. Güvenlik politikalarımızı düzenli olarak gözden geçirir, çalışanlarımızı veri koruma konusunda eğitir ve gerekli olduğu durumlarda bağımsız denetim desteği alırız."
        ]
      }
    ],
    closingNote:
      "Haklarınıza ilişkin başvurularınızı, kimliğinizi teyit eden bilgi ve belgelerle birlikte info@fures.at adresine e-posta göndererek veya Gazimağusa'daki merkezimize yazılı başvuru yaparak iletebilirsiniz. Başvurularınız mevzuatta öngörülen en geç 30 gün içinde ücretsiz olarak sonuçlandırılır."
  },
  en: {
    title: "Privacy Policy",
    updatedOn: "Last updated: 10 February 2025",
    intro: [
      "At Fures Tech, we take the confidentiality and security of your personal data seriously. This Privacy Policy has been prepared to comply with the Turkish Personal Data Protection Law No. 6698 (KVKK) and the EU General Data Protection Regulation (GDPR).",
      "We process, store and protect any personal information obtained through our website, social media accounts, email and telephone communications or service agreements in line with the principles described in this document."
    ],
    sections: [
      {
        id: "controller",
        heading: "1. Data Controller",
        body: [
          "Data Controller: Fures Tech",
          "Address: Famagusta, Turkish Republic of Northern Cyprus",
          "Email: info@fures.at",
          "Phone: +90 (548) 876 68 19",
          "Fures Tech is responsible for the personal data covered by this notice. You can contact us at any time regarding your privacy questions or requests."
        ]
      },
      {
        id: "data",
        heading: "2. Categories of Personal Data We Process",
        body: [
          "During our communication and project planning workflows we may process the following categories of personal data:",
          "• Identity and contact details (name, surname, company information, email, phone, country).",
          "• Corporate information (brand name, industry, website, project requirements).",
          "• Contracting and invoicing data (tax number, billing address, authorised contact person).",
          "• Website and digital interaction data (IP address, browser type, pages visited, cookie preferences).",
          "• Support records and correspondence history (emails, WhatsApp threads, call log notes)."
        ]
      },
      {
        id: "purposes",
        heading: "3. Purposes and Legal Bases",
        body: [
          "We process personal data exclusively for the purposes below and on the legal grounds described in Articles 5 and 6 of the KVKK (and Articles 6 and 9 GDPR):",
          "• Evaluating your enquiries and proposals, preparing and performing service contracts (necessity for entering into or performing a contract).",
          "• Fulfilling financial and regulatory obligations such as invoicing and bookkeeping (compliance with legal obligations).",
          "• Providing technical support, maintenance and product updates (our legitimate interest).",
          "• Measuring customer satisfaction, improving service quality and respecting your communication preferences (consent or legitimate interest).",
          "• Delivering marketing communications, campaigns or event invitations where we rely on your explicit consent."
        ]
      },
      {
        id: "cookies",
        heading: "4. Cookies and Similar Technologies",
        body: [
          "We may use essential, performance, functional and marketing cookies on our website. Please refer to our Cookie Policy for detailed explanations and management options.",
          "You can adjust your cookie preferences at any time by changing your browser settings or by using the consent management tool provided on our site."
        ]
      },
      {
        id: "sharing",
        heading: "5. Sharing Your Personal Data",
        body: [
          "Personal data may only be shared when strictly necessary for delivering our services and only with recipients who implement adequate safeguards:",
          "• Cloud infrastructure, hosting, email and project management providers",
          "• Licensed accountants and payment institutions for financial processing",
          "• Competent public authorities in case of legal requests or audits",
          "• Where international data transfers are required, we implement EU Standard Contractual Clauses and supplementary safeguards in line with GDPR Article 46."
        ]
      },
      {
        id: "retention",
        heading: "6. Retention Periods",
        body: [
          "We keep personal data only for as long as necessary for the purposes described above or as required by law. Typical retention periods include:",
          "• Contracts and invoicing records: 10 years (tax and commercial legislation)",
          "• Support interactions and correspondence: 3 years",
          "• Marketing communications: until you withdraw your consent",
          "• Technical website analytics data: 2 years"
        ]
      },
      {
        id: "rights",
        heading: "7. Your Rights",
        body: [
          "Under the KVKK and GDPR you have the following rights:",
          "• To learn whether your personal data are processed",
          "• To request information about processing activities",
          "• To learn the purposes of processing and whether data are used accordingly",
          "• To learn the domestic or foreign recipients to whom personal data are disclosed",
          "• To request correction of incomplete or inaccurate data",
          "• To request erasure or destruction of personal data where legal conditions are met",
          "• To request notification of such actions to third parties",
          "• To object to decisions based solely on automated processing",
          "• To claim compensation if you suffer damage due to unlawful processing"
        ]
      },
      {
        id: "security",
        heading: "8. Data Security",
        body: [
          "We implement technical and organisational security measures to protect your personal data against unauthorised access, loss, misuse, disclosure or alteration. We regularly review our security policies, train our team on data protection and engage independent auditors when necessary."
        ]
      }
    ],
    closingNote:
      "You can submit your privacy requests to info@fures.at or by sending a written notice to our headquarters in Famagusta, TRNC. We will respond free of charge within 30 days, as required by applicable legislation."
  },
  ru: {
    title: "Политика конфиденциальности",
    updatedOn: "Дата обновления: 10 февраля 2025 года",
    intro: [
      "Fures Tech уделяет первостепенное внимание конфиденциальности и безопасности персональных данных. Настоящая политика подготовлена в соответствии с Законом Турецкой Республики Северного Кипра о защите персональных данных № 6698 (KVKK) и Общим регламентом ЕС по защите данных (GDPR).",
      "Мы обрабатываем, храним и защищаем любую персональную информацию, полученную через наш сайт, социальные сети, электронную почту, телефонные каналы связи или договоры оказания услуг, строго в соответствии с принципами, изложенными в этом документе."
    ],
    sections: [
      {
        id: "controller",
        heading: "1. Контролер данных",
        body: [
          "Контролер данных: Fures Tech",
          "Адрес: Фамагуста, Турецкая Республика Северного Кипра",
          "Электронная почта: info@fures.at",
          "Телефон: +90 (548) 876 68 19",
          "Fures Tech отвечает за обработку персональных данных, описанную в настоящем уведомлении. Вы можете связаться с нами по любым вопросам конфиденциальности в удобное время."
        ]
      },
      {
        id: "data",
        heading: "2. Категории обрабатываемых персональных данных",
        body: [
          "В рамках коммуникации и подготовки проектов мы можем обрабатывать следующие категории данных:",
          "• Идентификационные и контактные сведения (имя, фамилия, данные компании, e-mail, телефон, страна).",
          "• Корпоративная информация (название бренда, отрасль, веб-сайт, требования к проекту).",
          "• Данные для договоров и выставления счетов (налоговый номер, адрес для счетов, контактное лицо).",
          "• Данные о взаимодействии с сайтом (IP-адрес, тип браузера, посещенные страницы, cookie-предпочтения).",
          "• История поддержки и переписки (электронные письма, переписка в WhatsApp, заметки о звонках)."
        ]
      },
      {
        id: "purposes",
        heading: "3. Цели и правовые основания обработки",
        body: [
          "Мы обрабатываем персональные данные исключительно в следующих целях и на основаниях, предусмотренных статьями 5 и 6 KVKK (а также статьями 6 и 9 GDPR):",
          "• Рассмотрение ваших запросов и предложений, подготовка и исполнение договоров (необходимость заключения или выполнения договора).",
          "• Выполнение финансовых и нормативных обязательств, включая выставление счетов и бухгалтерский учет (исполнение юридических обязанностей).",
          "• Предоставление технической поддержки, сопровождение и обновления (наше законное основание).",
          "• Оценка удовлетворенности клиентов, повышение качества услуг и учет ваших предпочтений в коммуникации (согласие или законный интерес).",
          "• Отправка маркетинговых сообщений и приглашений на мероприятия при наличии вашего явного согласия."
        ]
      },
      {
        id: "cookies",
        heading: "4. Cookies и аналогичные технологии",
        body: [
          "На нашем сайте могут использоваться обязательные, функциональные, аналитические и маркетинговые cookies. Подробная информация и инструменты управления доступны в нашей Политике cookie.",
          "Вы можете настроить свои cookie-предпочтения в любое время в настройках браузера или через баннер управления согласием на сайте."
        ]
      },
      {
        id: "sharing",
        heading: "5. Передача персональных данных",
        body: [
          "Персональные данные передаются только в случаях, когда это строго необходимо для оказания наших услуг, и исключительно получателям, обеспечивающим надлежащие меры безопасности:",
          "• Провайдерам облачной инфраструктуры, хостинга, электронной почты и проектного менеджмента",
          "• Лицензированным бухгалтерам и платежным организациям для финансовых операций",
          "• Уполномоченным государственным органам при наличии юридических запросов или проверок",
          "• При трансграничной передаче данных мы применяем стандартные договорные положения ЕС и дополнительные меры безопасности согласно статье 46 GDPR."
        ]
      },
      {
        id: "retention",
        heading: "6. Сроки хранения",
        body: [
          "Мы храним персональные данные только в течение периода, необходимого для указанных целей, либо в соответствии с требованиями закона. Типичные сроки:",
          "• Договоры и бухгалтерские документы: 10 лет (налоговое и торговое законодательство)",
          "• История поддержки и переписки: 3 года",
          "• Маркетинговые рассылки: до отзыва вашего согласия",
          "• Технические данные веб-аналитики: 2 года"
        ]
      },
      {
        id: "rights",
        heading: "7. Ваши права",
        body: [
          "В соответствии с KVKK и GDPR вы имеете право:",
          "• Узнать, обрабатываются ли ваши персональные данные",
          "• Получить информацию об операциях по обработке",
          "• Узнать цели обработки и соответствие использования заявленным целям",
          "• Получить сведения о третьих лицах в Турции или за рубежом, которым раскрываются данные",
          "• Требовать исправления неполных или неверных данных",
          "• Требовать удаления или уничтожения данных при наличии оснований",
          "• Требовать уведомления третьих лиц о выполненных операциях",
          "• Возражать против решений, основанных исключительно на автоматизированной обработке",
          "• Требовать возмещения убытков в случае незаконной обработки"
        ]
      },
      {
        id: "security",
        heading: "8. Безопасность данных",
        body: [
          "Мы применяем технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, потери, злоупотребления, раскрытия или изменения. Мы регулярно пересматриваем политики безопасности, обучаем сотрудников и при необходимости привлекаем независимых аудиторов."
        ]
      }
    ],
    closingNote:
      "Вы можете направить запрос по адресу info@fures.at или почтой на наш адрес в Фамагусте. Ваши обращения будут рассмотрены бесплатно в течение 30 дней, как того требует законодательство."
  },
  de: {
    title: "Datenschutzerklärung",
    updatedOn: "Aktualisiert am: 10. Februar 2025",
    intro: [
      "Fures Tech behandelt den Schutz personenbezogener Daten mit höchster Sorgfalt. Diese Datenschutzerklärung erfüllt die Anforderungen des türkisch-zyprischen Datenschutzgesetzes (KVKK) sowie der europäischen DSGVO.",
      "Alle personenbezogenen Informationen, die wir über unsere Website, soziale Netzwerke, E-Mail- oder Telefonkommunikation oder Serviceverträge erhalten, verarbeiten und speichern wir ausschließlich gemäß den in diesem Dokument beschriebenen Grundsätzen."
    ],
    sections: [
      {
        id: "controller",
        heading: "1. Verantwortlicher",
        body: [
          "Verantwortliche Stelle: Fures Tech",
          "Adresse: Famagusta, Türkische Republik Nordzypern",
          "E-Mail: info@fures.at",
          "Telefon: +90 (548) 876 68 19",
          "Fures Tech ist für die in dieser Erklärung beschriebenen Datenverarbeitungen verantwortlich. Bei Fragen zum Datenschutz können Sie uns jederzeit kontaktieren."
        ]
      },
      {
        id: "data",
        heading: "2. Verarbeitete Datenkategorien",
        body: [
          "Im Rahmen von Kommunikation und Projektplanung verarbeiten wir insbesondere folgende Daten:",
          "• Identitäts- und Kontaktdaten (Name, Unternehmen, E-Mail, Telefon, Land).",
          "• Unternehmensinformationen (Markenname, Branche, Website, Projektanforderungen).",
          "• Vertrags- und Abrechnungsdaten (Steuernummer, Rechnungsadresse, verantwortliche Kontaktperson).",
          "• Website- und Interaktionsdaten (IP-Adresse, Browsertyp, besuchte Seiten, Cookie-Präferenzen).",
          "• Support-Historie und Korrespondenz (E-Mails, WhatsApp-Verläufe, Gesprächsnotizen)."
        ]
      },
      {
        id: "purposes",
        heading: "3. Verarbeitungszwecke und Rechtsgrundlagen",
        body: [
          "Wir verarbeiten personenbezogene Daten ausschließlich zu folgenden Zwecken und auf Basis der in KVKK Art. 5/6 sowie DSGVO Art. 6/9 genannten Rechtsgrundlagen:",
          "• Bewertung Ihrer Anfragen, Angebotserstellung und Vertragsdurchführung (Vertragserfüllung).",
          "• Erfüllung gesetzlicher Verpflichtungen, insbesondere Rechnungsstellung und Buchhaltung (rechtliche Verpflichtung).",
          "• Bereitstellung von Support, Wartung und Updates (berechtigtes Interesse).",
          "• Messung der Kundenzufriedenheit, Qualitätsverbesserungen und Verwaltung Ihrer Kommunikationspräferenzen (Einwilligung oder berechtigtes Interesse).",
          "• Versand von Marketinginformationen und Veranstaltungseinladungen auf Basis Ihrer ausdrücklichen Einwilligung."
        ]
      },
      {
        id: "cookies",
        heading: "4. Cookies und ähnliche Technologien",
        body: [
          "Auf unserer Website können essenzielle, funktionale, Analyse- und Marketing-Cookies eingesetzt werden. Details und Steuerungsmöglichkeiten finden Sie in unserer Cookie-Richtlinie.",
          "Sie können Ihre Cookie-Einstellungen jederzeit über Ihren Browser oder über das Consent-Management-Tool auf der Website anpassen."
        ]
      },
      {
        id: "sharing",
        heading: "5. Weitergabe personenbezogener Daten",
        body: [
          "Eine Weitergabe erfolgt ausschließlich, wenn sie zur Leistungserbringung erforderlich ist und nur an Empfänger mit geeigneten Schutzmaßnahmen:",
          "• Anbieter von Cloud-Infrastruktur, Hosting, E-Mail- und Projektmanagement",
          "• Steuerberater:innen und Zahlungsdienstleister für finanzielle Abwicklungen",
          "• Zuständige Behörden im Rahmen rechtlicher Anfragen oder Prüfungen",
          "• Bei internationalen Übermittlungen setzen wir EU-Standardvertragsklauseln und ergänzende Schutzmaßnahmen gemäß Art. 46 DSGVO ein."
        ]
      },
      {
        id: "retention",
        heading: "6. Aufbewahrungsfristen",
        body: [
          "Personenbezogene Daten speichern wir nur solange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Vorgaben bestehen. Typische Fristen:",
          "• Vertrags- und Abrechnungsunterlagen: 10 Jahre (steuer- und handelsrechtliche Vorgaben)",
          "• Support- und Kommunikationshistorie: 3 Jahre",
          "• Marketingkommunikation: bis zum Widerruf Ihrer Einwilligung",
          "• Technische Webanalyse-Daten: 2 Jahre"
        ]
      },
      {
        id: "rights",
        heading: "7. Ihre Rechte",
        body: [
          "Nach KVKK und DSGVO haben Sie insbesondere das Recht:",
          "• Auskunft über die Verarbeitung Ihrer personenbezogenen Daten zu erhalten",
          "• Informationen über die Verarbeitungstätigkeiten anzufordern",
          "• Den Zweck der Verarbeitung und die zweckentsprechende Nutzung zu überprüfen",
          "• Empfänger:innen im In- und Ausland zu erfahren, denen Daten offengelegt werden",
          "• Unrichtige oder unvollständige Daten berichtigen zu lassen",
          "• Löschung oder Vernichtung zu verlangen, sofern die rechtlichen Voraussetzungen vorliegen",
          "• Über Mitteilungen an Dritte informiert zu werden",
          "• Entscheidungen anzufechten, die ausschließlich auf automatisierter Verarbeitung beruhen",
          "• Schadensersatz zu verlangen, wenn Sie durch unrechtmäßige Verarbeitung einen Schaden erleiden"
        ]
      },
      {
        id: "security",
        heading: "8. Datensicherheit",
        body: [
          "Wir setzen technische und organisatorische Maßnahmen ein, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Verlust, Missbrauch, Offenlegung oder Veränderung zu schützen. Sicherheitsrichtlinien werden regelmäßig überprüft, Mitarbeitende geschult und bei Bedarf unabhängige Audits durchgeführt."
        ]
      }
    ],
    closingNote:
      "Sie können Ihre Datenschutzanfragen an info@fures.at oder postalisch an unseren Standort in Famagusta richten. Wir beantworten sie innerhalb von 30 Tagen kostenlos gemäß den gesetzlichen Vorgaben."
  }
};

export function PrivacyPolicyPage() {
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
      `${t("seo.common.keywords")}, ${t("seo.privacy.keywords")}`
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
        { name: t("footer.privacy"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath]
  );

  useSEO({
    title: t("seo.privacy.title"),
    description: t("seo.privacy.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.privacy.title"),
      description: t("seo.privacy.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.privacy.title"),
      description: t("seo.privacy.description")
    },
    structuredData
  });

  return <LegalDocument content={PRIVACY_DOCUMENT[language]} />;
}
