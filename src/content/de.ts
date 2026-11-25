import type { Site } from './site';

export const de: Site = {
  title: 'Can Kara — Backend, KI-Anwendungen und Agentensysteme',
  description: 'Portfolio von Can Kara (canquesse): Backend-Entwicklung in Bremen mit Java und Python, KI-Anwendungen und kontrollierte Agentensysteme.',
  skip: 'Zum Inhalt springen',
  chapters: [
    { id: 'top', label: 'Intro' }, { id: 'about', label: 'Über mich' }, { id: 'work', label: 'Projekte' }, { id: 'stack', label: 'Stack' },
    { id: 'experience', label: 'Erfahrung' }, { id: 'method', label: 'Methode' }, { id: 'community', label: 'Community' }, { id: 'contact', label: 'Kontakt' },
  ],
  nav: {
    links: [{ label: 'Projekte', href: '#work' }, { label: 'Über mich', href: '#about' }, { label: 'Erfahrung', href: '#experience' }],
    contact: 'Kontakt', sections: 'Abschnitte', main: 'Hauptmenü', language: 'Sprache',
  },
  hero: {
    given: 'Can', surname: 'Kara',
    meta: ['Backend-Entwicklung', 'KI-Anwendungen, Agentensysteme', 'Bremen, Deutschland'],
    line: ['Ein Modell aufrufen', 'ist der leichte Teil.'],
    lead: 'Backend-Systeme und KI-Anwendungen in Java und Python.',
    cue: 'Scrollen',
  },
  about: {
    label: 'Über mich', title: 'Backend zuerst.', titleAccent: 'KI in der Praxis.',
    statement: 'Ich bin Can und entwickle in Bremen. Ich baue Backends in Java und Python, binde KI-Dienste in echte Anwendungen ein und arbeite an Agentensystemen, die kontrollierbar bleiben.',
    facts: [
      { k: 'Standort', v: 'Bremen, Deutschland' },
      { k: 'Studium', v: 'B.Sc. Informatik, bis Frühjahr 2027' },
      { k: 'Kern', v: 'Java, Python, Spring Boot' },
    ],
  },
  work: {
    title: 'Meine', titleAccent: 'Projekte.',
    note: 'Fünf Projekte, von der veröffentlichten Browser-Erweiterung bis zur Agent-Runtime in Pre-Alpha.',
    gate: {
      propose: 'Aktion vorschlagen', note: 'Eine Skizze der Idee, nicht das Produkt.', tap: 'Tor antippen', alt: 'Das CAUTRUM-Zeichen als Tor aus Granit. Anfragen bewegen sich auf die beleuchtete Tür zu.', logLabel: 'Entscheidungen',
      words: { allow: 'erlaubt', ask: 'braucht Freigabe', deny: 'blockiert', approved: 'freigegeben, läuft', expired: 'keine Antwort, nicht ausgeführt', approve: 'Freigeben' },
    },
    projects: [
      {
        name: ['CAUTRUM'], kind: 'Agentensysteme · Private Pre-Alpha', open: 'Instagram, @cautrumofficial',
        description: 'Das Modell schlägt eine Aktion vor, die Anwendung entscheidet, ob sie ausgeführt wird. Wir bauen eine Runtime für kontrollierte Tool-Nutzung und für Agentenläufe, die sich prüfen, testen und vergleichen lassen.',
        facts: [
          { k: 'Mein Teil', v: 'Die Agent-Runtime in Python: Modelle, Tools, mehrstufige Abläufe' },
          { k: 'Team', v: 'Zwei Personen, ein gemeinsamer API-Vertrag' },
          { k: 'Status', v: 'In Entwicklung, Private Pre-Alpha' },
        ],
      },
      {
        name: ['LumiVox'], kind: 'Universität · Bachelorprojekt', open: 'Zum Projekt',
        description: 'Aus dem Foto eines Zimmers wird ein spielbares Level. Computer Vision erkennt die Möbel, die Geometrie speist das Spiel, und das Handy ist der Controller.',
        facts: [
          { k: 'Mein Teil', v: 'Leitung eines siebenköpfigen Teams, Integration und Reviews' },
          { k: 'Ablauf', v: 'Foto, Erkennung, Segmentierung, RoomMap, Spiel' },
          { k: 'Ergebnis', v: 'Abgeschlossen, Note 1,3' },
        ],
      },
      {
        name: ['Character', 'Skipper'], kind: 'Chrome-Erweiterung · Veröffentlicht', open: 'Im Chrome Web Store öffnen',
        description: 'Character Skipper for YouTube erkennt ausgewählte Personen und überspringt ihre Szenen. Die Erkennung läuft im Browser, kein Bild geht an einen Server von mir.',
        facts: [
          { k: 'Mein Teil', v: 'Alles, allein entwickelt' },
          { k: 'Status', v: 'Im Chrome Web Store veröffentlicht' },
        ],
      },
      {
        name: ['Wohnheim', 'Booking'], kind: 'Wohnheim · Mobile App', open: 'Zum Projekt',
        description: 'Waschmaschinen, Küchen und Gemeinschaftsräume meines Wohnheims in einer App: Belegungsplan, Benachrichtigungen und getrennte Rollen für Bewohner und Verwaltung.',
        facts: [
          { k: 'Team', v: 'Zwei Personen' },
          { k: 'Status', v: 'Entwicklung fertig, Einführung wird mit der Verwaltung besprochen' },
        ],
      },
      {
        name: ['Home-Lab'], kind: 'Infrastruktur · Lokale Modelle', open: 'Zum Projekt',
        description: 'Textgenerierung und Embeddings auf zwei eigenen Rechnern, hinter OpenAI-kompatiblen APIs. Ein Labor für Forschung und Entwicklung, das den Modellaufruf vom Anwendungscode trennt.',
        facts: [
          { k: 'Modelle', v: 'Qwen3-8B für Text, Qwen3-Embedding für Vektoren' },
          { k: 'Zugriff', v: 'Privates Netz, zwei Entwickler' },
        ],
      },
    ],
  },
  stack: {
    title: 'Der Stack.',
    note: 'Am stärksten in Backend und KI-Integration. Frontend und Mobile kommen aus Projekten.',
    groups: [
      { title: 'Backend', items: ['Java', 'Python', 'Spring Boot', 'FastAPI', 'REST', 'OpenAPI'] },
      { title: 'KI', items: ['LLM-Integration', 'RAG', 'Embeddings', 'Retrieval-Evaluation'] },
      { title: 'Agenten', items: ['Mehrstufige Runtimes', 'Tool-Registries', 'MCP'] },
      { title: 'Daten', items: ['PostgreSQL', 'pgvector', 'MariaDB', 'Redis / KeyDB', 'Streams'] },
      { title: 'Vision', items: ['YOLO', 'OneFormer', 'OpenCV', 'WebAssembly'] },
      { title: 'Interfaces', items: ['TypeScript', 'React', 'React Native', 'Expo', 'WebSockets'] },
      { title: 'Sicherheit', items: ['Keycloak', 'OAuth2 / OIDC', 'Spring Security'] },
      { title: 'Delivery', items: ['Docker', 'GitLab CI', 'JUnit', 'Mockito', 'Linux'] },
    ],
  },
  experience: {
    label: 'Erfahrung und Studium', title: 'Beruf', titleAccent: '& Studium.',
    items: [
      {
        period: '11/2025 — 11/2026', organization: 'dbh Logistics IT', role: 'Werkstudent, Full-Stack-Entwicklung', place: 'Bremen, Schwerpunkt Backend',
        description: 'Ich habe in einem Unternehmensteam an Backend-Diensten und KI-Integrationen gearbeitet: an eigenen Komponenten ebenso wie an Features, Fehleranalysen und Reviews in gemeinsamen.',
        points: [
          { k: 'Dokumente und Daten', v: 'Backend-Komponenten entwickelt, die Dokumente in strukturierte Daten überführen, samt Tests für fehlerhafte Eingaben.' },
          { k: 'Asynchrone Verarbeitung', v: 'Langlaufende Aufbereitung aus der Nutzeranfrage gelöst und in aufgabenbasierte Abläufe verlegt.' },
          { k: 'KI in Python', v: 'Einen Python-Dienst zur Informationsextraktion aus Bildern eigenständig entwickelt.' },
          { k: 'Retrieval-Evaluation', v: 'Eine Evaluierung für RAG aufgebaut: feste Fragen, Recall@k, Precision, MRR und nDCG@k.' },
          { k: 'APIs und Zugriff', v: 'REST-Endpunkte und DTOs entworfen, dokumentiert und Zugriffskontrolle integriert.' },
          { k: 'Caching und Logging', v: 'Caching für wiederkehrende Arbeit ergänzt und Logging, das Modellaufrufe nachvollziehbar macht.' },
          { k: 'Kontrollierte KI-Tools', v: 'An Integrationen für Agenten mit externen Systemen und an deren technischer Risikobewertung gearbeitet.' },
        ],
      },
      {
        period: '10/2023 — Frühjahr 2027', organization: 'Universität Bremen', role: 'Informatik, B.Sc.', place: 'Bremen',
        description: 'Künstliche Intelligenz, Softwarearchitektur, Java, funktionale Programmierung und formale Modellierung.', points: [],
      },
    ],
  },
  method: {
    label: 'Methode', title: 'So', titleAccent: 'arbeite ich.',
    items: [
      { k: 'Erst der Vertrag', v: 'Erwartetes Verhalten, Ein- und Ausgaben und Fehlerfälle stehen vor dem Code fest. Dienstgrenzen gehören zum Feature.' },
      { k: 'Mit KI, von mir geprüft', v: 'Ich entwerfe, baue und prüfe mit KI-Werkzeugen. Danach gehe ich Änderungen, Datenfluss und Testergebnisse selbst durch.' },
      { k: 'Kleine, prüfbare Änderungen', v: 'Issues, Branches und Pull Requests mit klarem Zweck und klarer Wirkung. Reviews in beide Richtungen.' },
      { k: 'Gemessen statt vorgeführt', v: 'RAG- und Agentenarbeit wird an festen Beispielen verglichen, die Fehler werden einzeln gelesen.' },
    ],
  },
  community: {
    title: 'Türk Tech', titleAccent: 'Almanya.',
    steps: [
      { k: 'Gegründet in Bremen', v: 'Ich habe Türk Tech Almanya gegründet: ein Netzwerk für türkischsprachige Studierende, Ingenieure und IT-Leute. In Bremen entstanden, offen für ganz Deutschland.' },
      { k: 'Kennenlernen', v: 'Ein Tisch für Menschen aus Software, KI, Ingenieurwesen, Security und Design. Titel oder Niveau sind egal, Neugier genügt.' },
      { k: 'Teilen', v: 'Technische Fragen, Karrierewege und gute Quellen, in drei Gruppen: erste Schritte in Deutschland, Ankündigungen, Uni und akademische Hilfe.' },
      { k: 'Bauen', v: 'Gemeinsame Projekte, Workshops, Bootcamps, Hackathons und CTFs, damit niemand eine Idee allein tragen muss.' },
      { k: 'Bisher', v: 'Ein erstes Treffen in Bremen im Oktober 2026, eine Gesprächsreihe mit Profis und eine CTF-Auswahl für Hackathons und Ethical Hacking.' },
    ],
    facts: [{ n: '250+', k: 'Mitglieder' }, { n: '3', k: 'WhatsApp-Gruppen' }],
    asOf: 'Nov. 2026', href: 'https://turktechalmanya.de/de', cta: 'turktechalmanya.de',
    linkedin: 'Türk Tech Almanya auf LinkedIn',
    join: 'WhatsApp beitreten', qr: { hover: 'Für den QR-Code hierhin zeigen', tap: 'QR antippen', scan: 'Scannen und per WhatsApp beitreten', label: 'Türk Tech Almanya auf WhatsApp beitreten, QR-Code' },
  },
  contact: { line1: 'Bauen wir', line2: 'etwas', accent: 'Präzises.', mail: 'E-Mail schreiben', fallback: 'Auf LinkedIn schreiben', copyright: '© 2026 Can Kara', top: 'Nach oben' },
};
