export type Lang = 'tr' | 'en' | 'de';

export interface T {
  studio: string;
  title: string;
  subtitle: string;
  available: string;
  nav: { about: string; solutions: string; contact: string };
  home: {
    eyebrow: string;
    lede: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    marquee: string[];
    proof: Array<{ label: string }>;
    approach: {
      label: string;
      title: string;
      desc: string;
      items: Array<{ title: string; desc: string }>;
    };
    signal: {
      label: string;
      title: string;
      cta: string;
      questions: [string, string, string];
      yes: string;
      no: string;
      resultLabel: string;
      resultHigh: string;
      resultMid: string;
      resultLow: string;
      restart: string;
    };
    outcomes: {
      label: string;
      items: Array<{ title: string; desc: string }>;
    };
  };
  capabilities: { label: string; items: Array<{ title: string; desc: string }> };
  sections: { experience: string; education: string; founder: string };
  about: {
    headline: string;
    extended: string;
    tabs: { studio: string; can: string };
    companyTitle: string;
    companyBody: string;
    founderTitle: string;
    experienceTitle: string;
    educationTitle: string;
  };
  solutionsPage: { eyebrow: string; title: string; desc: string; framework: string; work: string; allProjects: string };
  founder: {
    name: string;
    role: string;
    bio: string;
    studioLine: string;
    badge: string;
  };
  experience: Array<{ role: string; company: string; period: string; desc: string; bullets: string[] }>;
  education: { school: string; field: string; period: string; tags: [string, string] };
  projects: Array<{ tagline: string; desc: string; role: string; bullets: string[] }>;
  statusMap: Record<string, string>;
  projectMeta: { privateRepo: string; instagram: string };
  contact: {
    big: string;
    sub: string;
    viewProject: string;
    available: string;
    responseTitle: string;
    responseItems: string[];
  };
  footer: {
    motto: string;
    toTop: string;
    links: [string, string, string];
  };
  notFound: {
    kicker: string;
    title: string;
    desc: string;
    home: string;
    contact: string;
  };
}

export const translations: Record<Lang, T> = {

  /* ── TÜRKÇE ───────────────────────────────────────────── */
  tr: {
    studio: 'yapay zekâ çözümleri',
    title: 'yapay zekâ çözümleri',
    subtitle: 'full-stack studio',
    available: 'müsait',
    nav: { about: 'hakkımızda', solutions: 'çözümler', contact: 'iletişim' },
    home: {
      eyebrow: 'Canquesse AI Solutions',
      lede: 'Yapay zekâ fikirlerini çalışan ürünlere dönüştürüyoruz.',
      sub: 'Canquesse, karmaşık yapay zekâ fikirlerini anlaşılır deneyimlere ve üretimde çalışan ürünlere dönüştüren bağımsız bir ürün stüdyosudur.',
      ctaPrimary: 'çözümleri gör',
      ctaSecondary: 'nasıl çalışıyoruz',
      marquee: [
        'Bağlam Mühendisliği', 'Ajan Tabanlı Akışlar', 'Çok Modlu Ürünler',
        'Bilgi Getirme Sistemleri', 'Model Değerlendirme', 'İnsan Onaylı Otomasyon',
        'Gizlilik Odaklı AI', 'Uyarlanabilir Arayüzler',
      ],
      proof: [
        { label: 'Fikirden çalışan ürüne tek akış' },
        { label: 'Yapay zekâ, ürün deneyimi ve altyapı birlikte tasarlanır' },
        { label: 'Net hedef, hızlı doğrulama, ölçülebilir sonuç' },
      ],
      approach: {
        label: 'NASIL ÇALIŞIRIZ',
        title: 'Önce doğru problemi bulur, sonra çalışan ürünü kurarız.',
        desc: 'Kullanıcı ihtiyacını, yapay zekânın rolünü ve ürün deneyimini tek bir karar akışında netleştiririz.',
        items: [
          { title: 'Problemi netleştir', desc: 'Kullanıcıyı, hedefi ve gerçek değer üreten noktayı birlikte tanımlarız.' },
          { title: 'Sistemi tasarla', desc: 'Ürün akışını güvenlik, maliyet ve sürdürülebilirlikle beraber kurgularız.' },
          { title: 'Gerçek akışta dene', desc: 'Sunumluk bir demo yerine ölçülebilir, test edilebilir bir ilk sürüm çıkarırız.' },
          { title: 'Ürünü büyüt', desc: 'Canlı kullanım verisiyle öğrenen, sade bir geliştirme döngüsü kurarız.' },
        ],
      },
      signal: {
        label: 'AI ÜRÜN KONTROLÜ',
        title: 'Fikriniz yapay zekâ için doğru problem mi?',
        cta: '3 soruda kontrol et',
        questions: [
          'Kullanıcı bugün tekrar eden bir karar veya araştırma işi yapıyor mu?',
          'Bu işi iyileştirecek erişilebilir veri ya da içerik var mı?',
          'Sonucun doğruluğunu insan veya sistem tarafından ölçebilir misiniz?',
        ],
        yes: 'evet',
        no: 'henüz değil',
        resultLabel: 'KISA DEĞERLENDİRME',
        resultHigh: 'Güçlü bir AI ürün adayı. Sonraki adım, en küçük ölçülebilir kullanım senaryosunu kurmak.',
        resultMid: 'Potansiyel var. Önce belirsiz kalan ihtiyacı veya veri kaynağını netleştirmek gerekir.',
        resultLow: 'AI eklemeden önce problem ve veri tarafını doğrulamak daha doğru bir sonraki adım olur.',
        restart: 'yeniden değerlendir',
      },
      outcomes: {
        label: 'HER PROJEDE',
        items: [
          { title: 'Çalışan sürüm', desc: 'Gerçek kullanıcı akışında test edilebilen bir ürün.' },
          { title: 'Ölçüm çerçevesi', desc: 'Başarıyı ve model davranışını izleyen net ölçütler.' },
          { title: 'Devralınabilir sistem', desc: 'Belgelenmiş, geliştirilebilir ve size ait bir temel.' },
        ],
      },
    },
    capabilities: {
      label: 'YETKİNLİKLER',
      items: [
        { title: 'Yapay Zekâ Ürünleri', desc: 'Yapay zekâyı gösteri katmanı değil, ürünün gerçek değer üreten parçası olarak tasarlarız.' },
        { title: 'Ürün Mühendisliği', desc: 'Fikirden canlı kullanıma uzanan güvenilir, ölçülebilir ürün sistemleri kurarız.' },
        { title: 'Uyarlanabilir Deneyimler', desc: 'Bağlama göre değişen, hızlı ve erişilebilir dijital deneyimler tasarlarız.' },
      ],
    },
    sections: { experience: 'DENEYİM', education: 'EĞİTİM', founder: 'CAN KARA' },
    about: {
      headline: 'Yapay zekâ çözümleri tasarlıyor, uçtan uca geliştiriyoruz.',
      extended: 'Canquesse AI Solutions; fikirden ürüne, yapay zekâ destekli yazılım çözümleri üretir. Ürün mühendisliği, uyarlanabilir deneyimler ve yapay zekâ sistemlerini tek akışta birleştiriyoruz.',
      tabs: { studio: 'stüdyo', can: 'Can Kara' },
      companyTitle: 'Canquesse AI Solutions bir ürün geliştirme stüdyosudur.',
      companyBody: 'Canquesse, AI destekli ürün geliştirme için konumlandırılmış bağımsız bir stüdyo markasıdır. Odağı; problemi netleştirmek, çözüm mimarisini kurmak ve çalışan yazılımı teslim etmektir.',
      founderTitle: 'Teknik profil, çalışma deneyimi ve eğitim aynı yerde.',
      experienceTitle: 'Deneyim',
      educationTitle: 'Eğitim',
    },
    solutionsPage: {
      eyebrow: 'ÇÖZÜM MİMARİSİ',
      title: 'AI, backend ve arayüz aynı ürün kararında birleşir.',
      desc: 'Hazır şablon hissi vermeyen, kullanılabilir ve sürdürülebilir yazılım üretmek için çözüm alanlarını net ayırıyoruz.',
      framework: 'YETKİNLİKLER',
      work: 'PROJELER',
      allProjects: "GITHUB'DAKİ TÜM PROJELER",
    },
    founder: {
      name: 'Can Kara',
      role: 'Product engineer · AI systems builder',
      bio: 'Fikirden ürüne yazılım kuruyorum — ürün mühendisliği ve yapay zekâ sistemlerini bir arada geliştiriyorum.',
      studioLine: 'Canquesse AI Studio kurucusu',
      badge: 'KURUCU',
    },
    experience: [
      {
        role:    'Full-Stack Developer',
        company: 'DBH',
        period:  '2024 — şimdi',
        desc:    'Java ve Spring ile backend tarafında servis ve API geliştirme üzerine çalışıyorum.',
        bullets: [],
      },
      {
        role:    'Bağımsız AI Ürün Geliştiricisi',
        company: 'Bağımsız',
        period:  '2023 — şimdi',
        desc:    'Müşteri projelerinde yapay zekâ destekli ürün akışları ve uçtan uca uygulamalar geliştiriyorum.',
        bullets: [],
      },
    ],
    education: {
      school: 'Bremen Üniversitesi',
      field: 'Bilgisayar Bilimi',
      period: '2023 — devam',
      tags: ['AI mühendisliği', 'veri analizi'],
    },
    projects: [
      {
        tagline: 'AI ajanları için ölçüm ve gözlemlenebilirlik platformu',
        desc:    'Ajan davranışını ölçmek, regresyonları yakalamak ve görevleri uçtan uca izlemek için altı aylık yol haritasıyla geliştirilen platform.',
        role:    'Platform mimarisi + eval altyapısı',
        bullets: ['Python/FastAPI ajan çalışma zamanı ve Java 21 kontrol düzlemi', 'Adım adım izleme, eval harness ve maliyet/gecikme takibi'],
      },
      {
        tagline: 'YouTube için cihaz üzerinde AI yüz tanıma',
        desc:    'Seçilen kişileri cihaz üzerinde tanıyıp göründükleri sahneleri otomatik atlayan, gizlilik odaklı Chrome uzantısı.',
        role:    'AI ürün mühendisliği',
        bullets: ['BlazeFace, FaceMesh ve ArcFace tabanlı yüz algılama ve eşleştirme', 'Tam video taraması, videolar arası karakter hafızası ve tamamen yerel çalışma'],
      },
      {
        tagline: 'Medikal teknoloji istihbarat platformu',
        desc:    '30’dan fazla küresel kaynaktan medikal teknoloji haberlerini, FDA ve CE/MDR onaylarını tek akışta izleyen kişisel platform.',
        role:    'Ürün geliştirme + veri toplama',
        bullets: ['Gerçek zamanlı haber toplama ve otomatik Türkçe başlık çevirisi', 'Onay takibi, kategori filtreleri ve favori sistemi'],
      },
      {
        tagline: 'JavaFX tabanlı hisse analiz aracı',
        desc:    'Piyasa verilerini teknik göstergelerle işleyip alım-satım sinyalleri üreten masaüstü uygulaması.',
        role:    'Java uygulama geliştirme',
        bullets: ['10 teknik gösterge ve kural tabanlı sinyal üretimi', 'Veri sağlayıcı katmanı, testler ve JavaFX arayüz'],
      },
      {
        tagline: 'Gerçek veri setleriyle makine öğrenmesi deneyleri',
        desc:    'Iris veri seti üzerinde veri inceleme, modelleme ve sınıflandırma adımlarını belgeleyen notebook çalışması.',
        role:    'Veri analizi + modelleme',
        bullets: ['Veri hazırlama ve keşifsel analiz', 'Sınıflandırma algoritmalarının uygulanması ve karşılaştırılması'],
      },
    ],
    statusMap: { canlı: 'canlı', wip: 'WIP', arşiv: 'arşiv' },
    projectMeta: { privateRepo: 'özel repo', instagram: 'Instagram' },
    contact: {
      big:         'KONUŞALIM.',
      sub:         'Bir projeniz ya da bir fikriniz mi var? Birlikte çözelim.',
      viewProject: 'projeyi görüntüle ↗',
      available:   'yeni projelere açığız — hemen dönüş yapabiliriz',
      responseTitle: 'İlk konuşmada netleştireceğimiz şeyler',
      responseItems: ['problem ve kullanıcı bağlamı', 'mevcut teknik altyapı', 'AI entegrasyonunun gerçekten değer kattığı nokta'],
    },
    footer: { motto: 'builds.', toTop: 'başa dön', links: ['GITHUB', 'LINKEDIN', 'E-POSTA'] },
    notFound: {
      kicker: 'SAYFA BULUNAMADI',
      title: 'Bu adreste bir şey yok.',
      desc: 'Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Aşağıdan devam edebilirsin.',
      home: 'ana sayfa',
      contact: 'iletişime geç',
    },
  },

  /* ── ENGLISH ──────────────────────────────────────────── */
  en: {
    studio: 'ai solutions',
    title: 'ai solutions',
    subtitle: 'full-stack studio',
    available: 'available',
    nav: { about: 'about', solutions: 'solutions', contact: 'contact' },
    home: {
      eyebrow: 'Canquesse AI Solutions',
      lede: 'We turn AI ideas into products that work.',
      sub: 'Canquesse is an independent product studio turning complex AI ideas into clear experiences and production-ready products.',
      ctaPrimary: 'see our solutions',
      ctaSecondary: 'how we work',
      marquee: [
        'Context Engineering', 'Agentic Workflows', 'Multimodal Products',
        'Retrieval Systems', 'Model Evaluation', 'Human-in-the-Loop',
        'Privacy-First AI', 'Adaptive Interfaces',
      ],
      proof: [
        { label: 'One flow from idea to working product' },
        { label: 'AI, product experience and infrastructure designed together' },
        { label: 'Clear goals, fast validation and measurable outcomes' },
      ],
      approach: {
        label: 'HOW WE WORK',
        title: 'We find the right problem, then build the product that solves it.',
        desc: 'We align the user need, the role of AI and the product experience in one clear decision flow.',
        items: [
          { title: 'Clarify the problem', desc: 'We define the user, the goal and the point where real value is created.' },
          { title: 'Design the system', desc: 'We shape the product flow together with security, cost and sustainability.' },
          { title: 'Test the real flow', desc: 'We build a measurable first version instead of a presentation-only demo.' },
          { title: 'Grow the product', desc: 'We create a focused improvement loop informed by real usage.' },
        ],
      },
      signal: {
        label: 'AI PRODUCT CHECK',
        title: 'Is your idea solving the right problem with AI?',
        cta: 'check in 3 questions',
        questions: [
          'Does the user currently repeat a decision-making or research task?',
          'Is there accessible data or content that could improve this task?',
          'Can a person or system measure the quality of the result?',
        ],
        yes: 'yes',
        no: 'not yet',
        resultLabel: 'QUICK ASSESSMENT',
        resultHigh: 'A strong AI product candidate. The next step is a small, measurable use case.',
        resultMid: 'There is potential. Clarify the unresolved user need or data source first.',
        resultLow: 'Validating the problem and data is a better next step before adding AI.',
        restart: 'check again',
      },
      outcomes: {
        label: 'EVERY PROJECT LEAVES',
        items: [
          { title: 'A working release', desc: 'A product tested in a real user flow.' },
          { title: 'A measurement frame', desc: 'Clear signals for success and model behavior.' },
          { title: 'An ownable system', desc: 'A documented foundation your team can extend.' },
        ],
      },
    },
    capabilities: {
      label: 'CAPABILITIES',
      items: [
        { title: 'AI Products', desc: 'We design AI as the part of a product that creates real value, not as a decorative layer.' },
        { title: 'Product Engineering', desc: 'We build reliable, measurable product systems from the first idea to live use.' },
        { title: 'Adaptive Experiences', desc: 'We design fast, accessible digital experiences that respond to context.' },
      ],
    },
    sections: { experience: 'EXPERIENCE', education: 'EDUCATION', founder: 'CAN KARA' },
    about: {
      headline: 'We design AI solutions and build them end to end.',
      extended: 'Canquesse AI Solutions builds AI-powered software from idea to product. We bring product engineering, adaptive experiences and AI systems into one flow.',
      tabs: { studio: 'studio', can: 'Can Kara' },
      companyTitle: 'Canquesse AI Solutions is a product development studio.',
      companyBody: 'Canquesse is an independent studio brand for AI-assisted product development. The focus is understanding the problem, shaping the solution architecture and delivering working software.',
      founderTitle: 'Technical profile, work experience and education in one place.',
      experienceTitle: 'Experience',
      educationTitle: 'Education',
    },
    solutionsPage: {
      eyebrow: 'SOLUTION ARCHITECTURE',
      title: 'AI, backend and interface decisions belong in the same product system.',
      desc: 'We separate the solution areas clearly so the result feels useful, maintainable and not like a template.',
      framework: 'CAPABILITIES',
      work: 'PROJECTS',
      allProjects: 'view all GitHub projects',
    },
    founder: {
      name: 'Can Kara',
      role: 'Product engineer · AI systems builder',
      bio: 'I build software from idea to product — product engineering and AI systems together.',
      studioLine: 'Founder, Canquesse AI Studio',
      badge: 'FOUNDER',
    },
    experience: [
      {
        role:    'Full-Stack Developer',
        company: 'DBH',
        period:  '2024 — present',
        desc:    'Backend-focused work — building services and APIs with Java and Spring.',
        bullets: [],
      },
      {
        role:    'Independent AI Product Engineer',
        company: 'Independent',
        period:  '2023 — present',
        desc:    'Building AI-assisted product flows and end-to-end applications for client projects.',
        bullets: [],
      },
    ],
    education: {
      school: 'University of Bremen',
      field: 'Computer Science',
      period: '2023 — ongoing',
      tags: ['AI engineering', 'data analysis'],
    },
    projects: [
      {
        tagline: 'Measurement and observability platform for AI agents',
        desc:    'A platform being developed through a six-month roadmap to measure agent behavior, catch regressions and trace tasks end to end.',
        role:    'Platform architecture + eval infrastructure',
        bullets: ['Python/FastAPI agent runtime with a Java 21 control plane', 'Step-level tracing, eval harness and cost/latency tracking'],
      },
      {
        tagline: 'On-device AI face recognition for YouTube',
        desc:    'A privacy-first Chrome extension that recognizes selected people on device and automatically skips the scenes where they appear.',
        role:    'AI product engineering',
        bullets: ['Face detection and matching with BlazeFace, FaceMesh and ArcFace', 'Full-video scanning, cross-video character memory and fully local processing'],
      },
      {
        tagline: 'Medical technology intelligence platform',
        desc:    'A personal platform that monitors medtech news from more than 30 global sources alongside FDA and CE/MDR approvals.',
        role:    'Product development + data collection',
        bullets: ['Real-time news aggregation and automatic Turkish headline translation', 'Approval tracking, category filters and favorites'],
      },
      {
        tagline: 'JavaFX stock analysis tool',
        desc:    'A desktop application that processes market data with technical indicators and generates trading signals.',
        role:    'Java application engineering',
        bullets: ['Ten technical indicators and rule-based signal generation', 'Data-provider layer, tests and a JavaFX interface'],
      },
      {
        tagline: 'Machine learning experiments on real data',
        desc:    'A notebook documenting data exploration, modeling and classification on the Iris dataset.',
        role:    'Data analysis + modeling',
        bullets: ['Data preparation and exploratory analysis', 'Implementation and comparison of classification algorithms'],
      },
    ],
    statusMap: { canlı: 'live', wip: 'wip', arşiv: 'archive' },
    projectMeta: { privateRepo: 'private repo', instagram: 'Instagram' },
    contact: {
      big:         "LET'S TALK.",
      sub:         'Have a project or an idea? Let\'s build a solution together.',
      viewProject: 'view project ↗',
      available:   'open to new projects — we\'ll get back to you soon',
      responseTitle: 'What we clarify in the first conversation',
      responseItems: ['problem and user context', 'current technical foundation', 'where AI integration creates real value'],
    },
    footer: { motto: 'builds.', toTop: 'back to top', links: ['GITHUB', 'LINKEDIN', 'EMAIL'] },
    notFound: {
      kicker: 'PAGE NOT FOUND',
      title: 'There is nothing at this address.',
      desc: 'The page you are looking for may have moved, or it may never have existed. Pick a way forward below.',
      home: 'home',
      contact: 'get in touch',
    },
  },

  /* ── DEUTSCH ──────────────────────────────────────────── */
  de: {
    studio: 'ki-lösungen',
    title: 'ki-lösungen',
    subtitle: 'full-stack studio',
    available: 'verfügbar',
    nav: { about: 'über uns', solutions: 'lösungen', contact: 'kontakt' },
    home: {
      eyebrow: 'Canquesse AI Solutions',
      lede: 'Aus KI-Ideen werden Produkte, die funktionieren.',
      sub: 'Canquesse ist ein unabhängiges Produktstudio, das komplexe KI-Ideen in klare Erlebnisse und produktionsreife Produkte übersetzt.',
      ctaPrimary: 'lösungen ansehen',
      ctaSecondary: 'so arbeiten wir',
      marquee: [
        'Context Engineering', 'Agenten-Workflows', 'Multimodale Produkte',
        'Retrieval-Systeme', 'Modell-Evaluation', 'Human-in-the-Loop',
        'Privacy-First AI', 'Adaptive Interfaces',
      ],
      proof: [
        { label: 'Ein Ablauf von der Idee zum funktionierenden Produkt' },
        { label: 'KI, Produkterlebnis und Infrastruktur gemeinsam gedacht' },
        { label: 'Klare Ziele, schnelle Validierung und messbare Ergebnisse' },
      ],
      approach: {
        label: 'SO ARBEITEN WIR',
        title: 'Wir finden das richtige Problem und bauen das Produkt, das es löst.',
        desc: 'Wir bringen Nutzerbedarf, die Rolle der KI und das Produkterlebnis in einen klaren Entscheidungsfluss.',
        items: [
          { title: 'Problem klären', desc: 'Wir definieren Nutzer, Ziel und den Punkt, an dem echter Wert entsteht.' },
          { title: 'System gestalten', desc: 'Wir formen den Produktfluss gemeinsam mit Sicherheit, Kosten und Nachhaltigkeit.' },
          { title: 'Im echten Ablauf testen', desc: 'Wir bauen eine messbare erste Version statt einer reinen Präsentationsdemo.' },
          { title: 'Produkt weiterentwickeln', desc: 'Wir schaffen einen fokussierten Lernzyklus auf Basis realer Nutzung.' },
        ],
      },
      signal: {
        label: 'KI-PRODUKT-CHECK',
        title: 'Löst Ihre Idee mit KI das richtige Problem?',
        cta: 'in 3 fragen prüfen',
        questions: [
          'Wiederholt der Nutzer heute eine Entscheidung oder Rechercheaufgabe?',
          'Gibt es zugängliche Daten oder Inhalte, die diese Aufgabe verbessern können?',
          'Kann die Qualität des Ergebnisses durch Mensch oder System gemessen werden?',
        ],
        yes: 'ja',
        no: 'noch nicht',
        resultLabel: 'KURZE EINSCHÄTZUNG',
        resultHigh: 'Ein starker Kandidat für ein KI-Produkt. Als Nächstes braucht es einen kleinen, messbaren Anwendungsfall.',
        resultMid: 'Potenzial ist vorhanden. Zuerst sollte der offene Nutzerbedarf oder die Datenquelle geklärt werden.',
        resultLow: 'Vor dem Einsatz von KI sollten Problem und Daten als Nächstes validiert werden.',
        restart: 'erneut prüfen',
      },
      outcomes: {
        label: 'JEDES PROJEKT HINTERLÄSST',
        items: [
          { title: 'Einen funktionierenden Release', desc: 'Ein Produkt, das im echten Nutzerfluss getestet ist.' },
          { title: 'Einen Messrahmen', desc: 'Klare Signale für Erfolg und Modellverhalten.' },
          { title: 'Ein übernehmbares System', desc: 'Eine dokumentierte Basis, die Ihr Team erweitern kann.' },
        ],
      },
    },
    capabilities: {
      label: 'KOMPETENZEN',
      items: [
        { title: 'KI-Produkte', desc: 'Wir gestalten KI als wertschöpfenden Teil des Produkts, nicht als dekorative Ebene.' },
        { title: 'Produktentwicklung', desc: 'Wir bauen verlässliche, messbare Produktsysteme von der ersten Idee bis zur Nutzung.' },
        { title: 'Adaptive Erlebnisse', desc: 'Wir gestalten schnelle, barrierefreie digitale Erlebnisse, die auf Kontext reagieren.' },
      ],
    },
    sections: { experience: 'ERFAHRUNG', education: 'AUSBILDUNG', founder: 'CAN KARA' },
    about: {
      headline: 'Wir entwerfen KI-Lösungen und bauen sie end-to-end.',
      extended: 'Canquesse AI Solutions entwickelt KI-gestützte Software von der Idee zum Produkt. Wir vereinen Produktentwicklung, adaptive Erlebnisse und KI-Systeme in einem Fluss.',
      tabs: { studio: 'studio', can: 'Can Kara' },
      companyTitle: 'Canquesse AI Solutions ist ein Studio für Produktentwicklung.',
      companyBody: 'Canquesse ist eine unabhängige Studio-Marke für KI-gestützte Produktentwicklung. Fokus: Problem verstehen, Lösungsarchitektur formen und funktionierende Software liefern.',
      founderTitle: 'Technisches Profil, Berufserfahrung und Ausbildung an einem Ort.',
      experienceTitle: 'Erfahrung',
      educationTitle: 'Ausbildung',
    },
    solutionsPage: {
      eyebrow: 'LÖSUNGSARCHITEKTUR',
      title: 'KI, Backend und Interface gehören in dieselbe Produktentscheidung.',
      desc: 'Wir trennen die Lösungsbereiche klar, damit das Ergebnis nutzbar, wartbar und nicht wie ein Template wirkt.',
      framework: 'KOMPETENZEN',
      work: 'PROJEKTE',
      allProjects: 'alle GitHub-Projekte ansehen',
    },
    founder: {
      name: 'Can Kara',
      role: 'Product engineer · AI systems builder',
      bio: 'Ich baue Software von der Idee zum Produkt — Produktentwicklung und KI-Systeme zusammen.',
      studioLine: 'Gründer des Canquesse AI Studio',
      badge: 'GRÜNDER',
    },
    experience: [
      {
        role:    'Full-Stack Developer',
        company: 'DBH',
        period:  '2024 — heute',
        desc:    'Backend-fokussierte Arbeit — Services und APIs mit Java und Spring.',
        bullets: [],
      },
      {
        role:    'Freiberuflicher KI-Produktentwickler',
        company: 'Freiberuflich',
        period:  '2023 — heute',
        desc:    'Entwicklung KI-gestützter Produktabläufe und durchgängiger Anwendungen für Kundenprojekte.',
        bullets: [],
      },
    ],
    education: {
      school: 'Universität Bremen',
      field: 'Informatik',
      period: '2023 — laufend',
      tags: ['KI-Engineering', 'Datenanalyse'],
    },
    projects: [
      {
        tagline: 'Mess- und Observability-Plattform für KI-Agenten',
        desc:    'Eine Plattform, die in einer sechsmonatigen Roadmap entwickelt wird, um Agentenverhalten zu messen, Regressionen zu erkennen und Aufgaben lückenlos nachzuverfolgen.',
        role:    'Plattformarchitektur + Eval-Infrastruktur',
        bullets: ['Python/FastAPI-Agent-Runtime mit Java-21-Control-Plane', 'Schrittweises Tracing, Eval-Harness und Kosten-/Latenz-Tracking'],
      },
      {
        tagline: 'Lokale KI-Gesichtserkennung für YouTube',
        desc:    'Eine datenschutzorientierte Chrome-Erweiterung, die ausgewählte Personen lokal erkennt und Szenen mit ihnen automatisch überspringt.',
        role:    'KI-Produktentwicklung',
        bullets: ['Gesichtserkennung und Abgleich mit BlazeFace, FaceMesh und ArcFace', 'Vollständiger Videoscan, videoübergreifendes Figurengedächtnis und lokale Verarbeitung'],
      },
      {
        tagline: 'Monitoring-Plattform für Medizintechnik',
        desc:    'Eine persönliche Plattform für Medizintechnik-Nachrichten aus mehr als 30 globalen Quellen sowie FDA- und CE/MDR-Zulassungen.',
        role:    'Produktentwicklung + Datenerfassung',
        bullets: ['Nachrichtenaggregation in Echtzeit und automatische türkische Titelübersetzung', 'Zulassungsverfolgung, Kategoriefilter und Favoriten'],
      },
      {
        tagline: 'JavaFX-basiertes Aktienanalyse-Tool',
        desc:    'Eine Desktop-Anwendung, die Marktdaten mit technischen Indikatoren verarbeitet und Handelssignale erzeugt.',
        role:    'Java-Anwendungsentwicklung',
        bullets: ['Zehn technische Indikatoren und regelbasierte Signalerzeugung', 'Datenanbieter-Schicht, Tests und JavaFX-Oberfläche'],
      },
      {
        tagline: 'Machine-Learning-Experimente mit realen Daten',
        desc:    'Ein Notebook, das Datenexploration, Modellierung und Klassifikation am Iris-Datensatz dokumentiert.',
        role:    'Datenanalyse + Modellierung',
        bullets: ['Datenaufbereitung und explorative Analyse', 'Anwendung und Vergleich von Klassifikationsalgorithmen'],
      },
    ],
    statusMap: { canlı: 'live', wip: 'wip', arşiv: 'archiv' },
    projectMeta: { privateRepo: 'privates Repo', instagram: 'Instagram' },
    contact: {
      big:         'REDEN WIR.',
      sub:         'Haben Sie ein Projekt oder eine Idee? Lassen Sie uns gemeinsam eine Lösung bauen.',
      viewProject: 'Projekt ansehen ↗',
      available:   'offen für neue Projekte — wir melden uns bald',
      responseTitle: 'Was wir im ersten Gespräch klären',
      responseItems: ['Problem und Nutzerkontext', 'aktuelle technische Basis', 'wo KI-Integration echten Wert schafft'],
    },
    footer: { motto: 'builds.', toTop: 'nach oben', links: ['GITHUB', 'LINKEDIN', 'E-MAIL'] },
    notFound: {
      kicker: 'SEITE NICHT GEFUNDEN',
      title: 'Unter dieser Adresse ist nichts.',
      desc: 'Die gesuchte Seite wurde vielleicht verschoben oder hat nie existiert. Unten geht es weiter.',
      home: 'startseite',
      contact: 'kontakt aufnehmen',
    },
  },
};
