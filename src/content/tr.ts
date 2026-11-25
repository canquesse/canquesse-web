import type { Site } from './site';

export const tr: Site = {
  title: 'Can Kara — Backend, yapay zekâ uygulamaları ve agent sistemleri',
  description: 'Can Kara’nın (canquesse) portföyü. Bremen’de Java ve Python ile backend, yapay zekâ uygulamaları ve kontrollü agent sistemleri geliştiriyor.',
  skip: 'İçeriğe geç',
  chapters: [
    { id: 'top', label: 'Giriş' }, { id: 'about', label: 'Hakkımda' }, { id: 'work', label: 'İşler' }, { id: 'stack', label: 'Teknoloji' },
    { id: 'experience', label: 'Deneyim' }, { id: 'method', label: 'Yöntem' }, { id: 'community', label: 'Topluluk' }, { id: 'contact', label: 'İletişim' },
  ],
  nav: {
    links: [{ label: 'İşler', href: '#work' }, { label: 'Hakkımda', href: '#about' }, { label: 'Deneyim', href: '#experience' }],
    contact: 'İletişim', sections: 'Bölümler', main: 'Ana menü', language: 'Dil',
  },
  hero: {
    given: 'Can', surname: 'Kara',
    meta: ['Backend geliştirici', 'Yapay zekâ ve agent sistemleri', 'Bremen, Almanya'],
    line: ['Modeli çağırmak', 'işin kolay kısmı.'],
    lead: 'Java ve Python ile backend ve yapay zekâ uygulamaları.',
    cue: 'Kaydır',
  },
  about: {
    label: 'Hakkımda', title: 'Önce backend.', titleAccent: 'Yapay zekâ işin içinde.',
    statement: 'Ben Can, Bremen’de yaşayan bir geliştiriciyim. Java ve Python ile backend kuruyor, yapay zekâ servislerini gerçek uygulamalara bağlıyor, kontrolü elden bırakmayan agent sistemleri üzerinde çalışıyorum.',
    facts: [
      { k: 'Konum', v: 'Bremen, Almanya' },
      { k: 'Eğitim', v: 'Informatik B.Sc., 2027 baharına kadar' },
      { k: 'Temel', v: 'Java, Python, Spring Boot' },
    ],
  },
  work: {
    title: 'Seçili', titleAccent: 'işler.',
    note: 'Yayımlanmış bir tarayıcı eklentisinden pre-alpha aşamasındaki agent runtime’ına beş proje.',
    gate: {
      propose: 'Bir işlem öner', note: 'Ürünün kendisi değil, fikrin küçük bir gösterimi.', tap: 'Kapıya dokun', alt: 'Granit bir kapı olarak CAUTRUM logosu. İstekler ışıklı kapıya doğru ilerliyor.', logLabel: 'Kararlar',
      words: { allow: 'izin verildi', ask: 'onay bekliyor', deny: 'engellendi', approved: 'onaylandı, çalışıyor', expired: 'cevap yok, çalışmadı', approve: 'Onayla' },
    },
    projects: [
      {
        name: ['CAUTRUM'], kind: 'Agent sistemleri · Private pre-alpha', open: 'Instagram, @cautrumofficial',
        description: 'Model bir işlem önerir, çalışıp çalışmayacağına uygulama karar verir. Kontrollü araç kullanımı ve incelenebilen, test edilebilen, karşılaştırılabilen agent çalışmaları için bir runtime geliştiriyoruz.',
        facts: [
          { k: 'Payım', v: 'Python agent runtime’ı: modeller, araçlar, çok adımlı akışlar' },
          { k: 'Ekip', v: 'İki kişi, ortak bir API sözleşmesi' },
          { k: 'Durum', v: 'Geliştirme aşamasında, private pre-alpha' },
        ],
      },
      {
        name: ['LumiVox'], kind: 'Üniversite · Bachelor projesi', open: 'Projeye git',
        description: 'Bir oda fotoğrafı oynanabilir bir bölüme dönüşüyor. Computer vision mobilyaları buluyor, çıkan geometri oyunu besliyor, kumanda ise telefonun.',
        facts: [
          { k: 'Payım', v: 'Yedi kişilik ekibin liderliği, entegrasyon ve review düzeni' },
          { k: 'Akış', v: 'Fotoğraf, algılama, segmentasyon, RoomMap, oyun' },
          { k: 'Sonuç', v: 'Tamamlandı, notu 1,3' },
        ],
      },
      {
        name: ['Character', 'Skipper'], kind: 'Chrome eklentisi · Yayında', open: 'Chrome Web Store’da aç',
        description: 'Character Skipper for YouTube, seçtiğin kişileri tanıyıp sahnelerini atlıyor. Tanıma tarayıcının içinde çalışıyor, hiçbir kare benim bir sunucuma gitmiyor.',
        facts: [
          { k: 'Payım', v: 'Tamamı, tek başıma' },
          { k: 'Durum', v: 'Chrome Web Store’da yayında' },
        ],
      },
      {
        name: ['Yurt', 'Rezervasyon'], kind: 'Öğrenci yurdu · Mobil uygulama', open: 'Projeye git',
        description: 'Yaşadığım yurdun çamaşır makineleri, mutfakları ve ortak alanları tek uygulamada: doluluk planı, bildirimler, sakinler ve yöneticiler için ayrı roller.',
        facts: [
          { k: 'Ekip', v: 'İki kişi' },
          { k: 'Durum', v: 'Geliştirme bitti, devreye alma yönetimle görüşülüyor' },
        ],
      },
      {
        name: ['Home-Lab'], kind: 'Altyapı · Yerel modeller', open: 'Projeye git',
        description: 'Metin üretimi ve embedding, kendi iki bilgisayarımızda, OpenAI uyumlu API’lerin arkasında. Model çağrısını uygulama kodundan ayıran bir araştırma ve geliştirme ortamı.',
        facts: [
          { k: 'Modeller', v: 'Metin için Qwen3-8B, vektörler için Qwen3-Embedding' },
          { k: 'Erişim', v: 'Özel ağ, iki geliştirici' },
        ],
      },
    ],
  },
  stack: {
    title: 'Teknolojiler.',
    note: 'En güçlü olduğum yer backend ve yapay zekâ entegrasyonu. Frontend ve mobil deneyimim projelerden geliyor.',
    groups: [
      { title: 'Backend', items: ['Java', 'Python', 'Spring Boot', 'FastAPI', 'REST', 'OpenAPI'] },
      { title: 'Yapay zekâ', items: ['LLM entegrasyonu', 'RAG', 'Embedding', 'Retrieval ölçümü'] },
      { title: 'Agent', items: ['Çok adımlı runtime', 'Araç kayıtları', 'MCP'] },
      { title: 'Veri', items: ['PostgreSQL', 'pgvector', 'MariaDB', 'Redis / KeyDB', 'Streams'] },
      { title: 'Görüntü', items: ['YOLO', 'OneFormer', 'OpenCV', 'WebAssembly'] },
      { title: 'Arayüz', items: ['TypeScript', 'React', 'React Native', 'Expo', 'WebSockets'] },
      { title: 'Güvenlik', items: ['Keycloak', 'OAuth2 / OIDC', 'Spring Security'] },
      { title: 'Teslimat', items: ['Docker', 'GitLab CI', 'JUnit', 'Mockito', 'Linux'] },
    ],
  },
  experience: {
    label: 'Deneyim ve eğitim', title: 'İş', titleAccent: '& eğitim.',
    items: [
      {
        period: '11/2025 — 11/2026', organization: 'dbh Logistics IT', role: 'Werkstudent, Full-Stack Geliştirme', place: 'Bremen, ağırlık backend',
        description: 'Kurumsal bir ekipte backend servisleri ve yapay zekâ entegrasyonları üzerinde çalıştım: kendi bileşenlerimin yanında ortak bileşenlerde özellik, hata analizi ve kod incelemesi.',
        points: [
          { k: 'Belge ve veri', v: 'Belgeleri yapılandırılmış veriye dönüştüren backend bileşenleri geliştirdim, hatalı girdilerin testleriyle birlikte.' },
          { k: 'Asenkron işleme', v: 'Uzun süren hazırlık işlerini kullanıcı isteğinden ayırıp görev tabanlı akışlara taşıdım.' },
          { k: 'Python ile yapay zekâ', v: 'Görüntüden bilgi çıkaran bir Python servisini tek başıma geliştirdim.' },
          { k: 'Retrieval değerlendirmesi', v: 'RAG için sabit sorular, Recall@k, Precision, MRR ve nDCG@k ile çalışan bir değerlendirme altyapısı kurdum.' },
          { k: 'API ve erişim', v: 'REST endpoint’leri ve DTO’lar tasarladım, belgeledim ve erişim kontrolünü entegre ettim.' },
          { k: 'Önbellek ve logging', v: 'Tekrarlanan işler için önbellekleme, model çağrılarının izlenebilmesi için logging ekledim.' },
          { k: 'Kontrollü AI araçları', v: 'Haricî sistemlerle çalışan agent’ların entegrasyonunda ve teknik risk değerlendirmesinde görev aldım.' },
        ],
      },
      {
        period: '10/2023 — 2027 baharı', organization: 'Universität Bremen', role: 'Informatik, B.Sc.', place: 'Bremen',
        description: 'Yapay zekâ, yazılım mimarisi, Java, fonksiyonel programlama ve formal modelleme.', points: [],
      },
    ],
  },
  method: {
    label: 'Yöntem', title: 'Nasıl', titleAccent: 'çalışırım.',
    items: [
      { k: 'Önce sözleşme', v: 'Beklenen davranış, girdiler, çıktılar ve hata durumları koddan önce netleşir. Servis sınırları özelliğin bir parçasıdır.' },
      { k: 'AI destekli, kontrolü bende', v: 'Tasarım, geliştirme ve karşı kontrolde AI araçları kullanırım. Sonra değişiklikleri, veri akışını ve test sonuçlarını kendim incelerim.' },
      { k: 'Küçük, incelenebilir adımlar', v: 'Amacı ve etkisi yazılı issue, branch ve pull request’ler. Review iki yönlü işler.' },
      { k: 'Demo değil, ölçüm', v: 'RAG ve agent işlerini sabit örneklerle karşılaştırır, hatalı sonuçları tek tek okurum.' },
    ],
  },
  community: {
    title: 'Türk Tech', titleAccent: 'Almanya.',
    steps: [
      { k: 'Bremen’de kuruldu', v: 'Türk Tech Almanya’yı kurdum: Türkçe konuşan öğrencileri, mühendisleri ve IT çalışanlarını buluşturan bir ağ. Bremen’de doğdu, tüm Almanya’ya açık.' },
      { k: 'Tanış', v: 'Yazılım, yapay zekâ, mühendislik, siber güvenlik ve tasarımdan insanlar aynı masada. Unvan ya da seviye şartı yok, merak yeter.' },
      { k: 'Paylaş', v: 'Teknik sorular, kariyer deneyimleri, iyi kaynaklar. Üç grupta: Almanya’ya ilk adım, duyurular, üniversite ve akademik destek.' },
      { k: 'Üret', v: 'Ortak projeler, eğitimler, bootcamp’ler, hackathon’lar ve CTF’ler. Bir fikri tek başına taşımak zorunda kalma diye.' },
      { k: 'Bugüne kadar', v: 'Ekim 2026’da Bremen’de ilk buluşma, profesyonellerle buluşma serisi, hackathon ve etik hackerlık için CTF seçmeleri.' },
    ],
    facts: [{ n: '250+', k: 'üye' }, { n: '3', k: 'WhatsApp grubu' }],
    asOf: 'Kasım 2026', href: 'https://turktechalmanya.de', cta: 'turktechalmanya.de',
    linkedin: 'Türk Tech Almanya LinkedIn sayfası',
    join: 'WhatsApp’tan katıl', qr: { hover: 'QR kod için üzerine gel', tap: 'QR’a dokun', scan: 'Okut, WhatsApp’tan katıl', label: 'Türk Tech Almanya WhatsApp topluluğuna katıl, QR kod' },
  },
  contact: { line1: 'Sağlam', line2: 'bir şey', accent: 'kuralım.', mail: 'Mail at', fallback: 'LinkedIn’den yaz', copyright: '© 2026 Can Kara', top: 'Başa dön' },
};
