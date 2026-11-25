import type { Site } from './site';

export const en: Site = {
  title: 'Can Kara — Backend, AI applications and agent systems',
  description: 'Portfolio of Can Kara (canquesse), a backend developer in Bremen working with Java, Python, AI applications and controlled agent systems.',
  skip: 'Skip to content',
  chapters: [
    { id: 'top', label: 'Intro' }, { id: 'about', label: 'About' }, { id: 'work', label: 'Work' }, { id: 'stack', label: 'Stack' },
    { id: 'experience', label: 'Experience' }, { id: 'method', label: 'Method' }, { id: 'community', label: 'Community' }, { id: 'contact', label: 'Contact' },
  ],
  nav: {
    links: [{ label: 'Work', href: '#work' }, { label: 'About', href: '#about' }, { label: 'Experience', href: '#experience' }],
    contact: 'Contact', sections: 'Sections', main: 'Main', language: 'Language',
  },
  hero: {
    given: 'Can', surname: 'Kara',
    meta: ['Backend developer', 'AI applications, agent systems', 'Bremen, Germany'],
    // Edit freely: `line` is the big sentence seen through the glass.
    line: ['Calling a model', 'is the easy part.'],
    lead: 'Backend systems and AI applications in Java and Python.',
    cue: 'Scroll',
  },
  about: {
    label: 'About', title: 'Backend first.', titleAccent: 'AI in practice.',
    statement: 'I’m Can, a developer in Bremen. I build backends in Java and Python, connect AI services to real applications, and work on agent systems that stay under control.',
    facts: [
      { k: 'Based in', v: 'Bremen, Germany' },
      { k: 'Studying', v: 'B.Sc. Informatik, until spring 2027' },
      { k: 'Core', v: 'Java, Python, Spring Boot' },
    ],
  },
  work: {
    title: 'Selected', titleAccent: 'work.',
    note: 'Five projects, from a published browser extension to an agent runtime in pre-alpha.',
    gate: {
      propose: 'Propose an action', note: 'A sketch of the idea, not the product.', tap: 'Tap the gate', alt: 'The CAUTRUM mark as a granite gate. Requests travel towards its lit doorway.', logLabel: 'Decisions',
      words: { allow: 'allowed', ask: 'needs approval', deny: 'blocked', approved: 'approved, runs', expired: 'no answer, not run', approve: 'Approve' },
    },
    projects: [
      {
        name: ['CAUTRUM'], kind: 'Agent systems · Private pre-alpha', open: 'Instagram, @cautrumofficial',
        description: 'The model proposes an action, the application decides whether it runs. We are building a runtime for controlled tool use and for agent runs that can be inspected, tested and compared.',
        facts: [
          { k: 'My part', v: 'The agent runtime in Python: models, tools, multi-step flows' },
          { k: 'Team', v: 'Two people, one shared API contract' },
          { k: 'Status', v: 'In development, private pre-alpha' },
        ],
      },
      {
        name: ['LumiVox'], kind: 'University · Bachelor project', open: 'View project',
        description: 'A photo of a room becomes a level you can play. Computer vision finds the furniture, the geometry feeds the game, and your phone is the controller.',
        facts: [
          { k: 'My part', v: 'Team lead of seven, integration and review process' },
          { k: 'Pipeline', v: 'Photo, detection, segmentation, RoomMap, game' },
          { k: 'Result', v: 'Completed, graded 1.3' },
        ],
      },
      {
        name: ['Character', 'Skipper'], kind: 'Chrome extension · Published', open: 'Open in the Chrome Web Store',
        description: 'Character Skipper for YouTube recognises the people you pick and skips their scenes. The recognition runs inside the browser, so no frames go to a server of mine.',
        facts: [
          { k: 'My part', v: 'Everything, as a solo developer' },
          { k: 'Status', v: 'Published in the Chrome Web Store' },
        ],
      },
      {
        name: ['Dorm', 'Booking'], kind: 'Student housing · Mobile app', open: 'View project',
        description: 'Washing machines, kitchens and common rooms in the dorm I live in, booked in one app: an occupancy plan, notifications, and separate roles for residents and admins.',
        facts: [
          { k: 'Team', v: 'Two people' },
          { k: 'Status', v: 'Development finished, rollout being discussed with the management' },
        ],
      },
      {
        name: ['Home-Lab'], kind: 'Infrastructure · Local models', open: 'View project',
        description: 'Text generation and embeddings on our own two machines, behind OpenAI-compatible APIs. A lab for research and development that keeps the model call out of the application code.',
        facts: [
          { k: 'Models', v: 'Qwen3-8B for text, Qwen3-Embedding for vectors' },
          { k: 'Access', v: 'Private network, two developers' },
        ],
      },
    ],
  },
  stack: {
    title: 'The stack.',
    note: 'Strongest in backend and AI integration. Frontend and mobile come from projects.',
    groups: [
      { title: 'Backend', items: ['Java', 'Python', 'Spring Boot', 'FastAPI', 'REST', 'OpenAPI'] },
      { title: 'AI', items: ['LLM integration', 'RAG', 'Embeddings', 'Retrieval evaluation'] },
      { title: 'Agents', items: ['Multi-step runtimes', 'Tool registries', 'MCP'] },
      { title: 'Data', items: ['PostgreSQL', 'pgvector', 'MariaDB', 'Redis / KeyDB', 'Streams'] },
      { title: 'Vision', items: ['YOLO', 'OneFormer', 'OpenCV', 'WebAssembly'] },
      { title: 'Interfaces', items: ['TypeScript', 'React', 'React Native', 'Expo', 'WebSockets'] },
      { title: 'Security', items: ['Keycloak', 'OAuth2 / OIDC', 'Spring Security'] },
      { title: 'Delivery', items: ['Docker', 'GitLab CI', 'JUnit', 'Mockito', 'Linux'] },
    ],
  },
  experience: {
    label: 'Experience & education', title: 'Work', titleAccent: '& study.',
    items: [
      {
        period: '11/2025 — 11/2026', organization: 'dbh Logistics IT', role: 'Working Student, Full-Stack Development', place: 'Bremen, with a focus on backend',
        description: 'I worked on backend services and AI integrations in an enterprise team, from my own components to features, debugging and reviews in shared ones.',
        points: [
          { k: 'Documents and data', v: 'Built backend components that turn documents into structured data, including the tests for input that goes wrong.' },
          { k: 'Asynchronous processing', v: 'Moved long-running preparation out of the user’s request and into task-based flows.' },
          { k: 'AI in Python', v: 'Developed a Python service on my own that extracts information from images.' },
          { k: 'Retrieval evaluation', v: 'Built an evaluation setup for RAG with fixed questions, Recall@k, Precision, MRR and nDCG@k.' },
          { k: 'APIs and access', v: 'Designed REST endpoints and DTOs, documented them, and integrated access control.' },
          { k: 'Caching and logging', v: 'Added caching for repeated work, and logging that makes model calls traceable.' },
          { k: 'Controlled AI tools', v: 'Worked on integrations for agents that use external systems, and on assessing their technical risk.' },
        ],
      },
      {
        period: '10/2023 — spring 2027', organization: 'University of Bremen', role: 'B.Sc. Computer Science (Informatik)', place: 'Bremen',
        description: 'Artificial intelligence, software architecture, Java, functional programming and formal modelling.', points: [],
      },
    ],
  },
  method: {
    label: 'Method', title: 'How I', titleAccent: 'work.',
    items: [
      { k: 'Contract first', v: 'Expected behaviour, inputs, outputs and error cases are settled before the code. Service boundaries are part of the feature.' },
      { k: 'AI-assisted, checked by me', v: 'I use AI tools to design, build and cross-check. Then I go through the changes, the data flow and the test results myself.' },
      { k: 'Small, reviewable changes', v: 'Issues, branches and pull requests with a stated purpose and effect. Reviews go both ways.' },
      { k: 'Measured, not demoed', v: 'RAG and agent work is compared on fixed examples, and the failures are read one by one.' },
    ],
  },
  community: {
    title: 'Türk Tech', titleAccent: 'Almanya.',
    steps: [
      { k: 'Founded in Bremen', v: 'I founded Türk Tech Almanya: a network for Turkish-speaking students, engineers and IT people. It started in Bremen and is open to all of Germany.' },
      { k: 'Meet', v: 'One table for people from software, AI, engineering, security and design. No title or level is required, curiosity is enough.' },
      { k: 'Share', v: 'Technical questions, career stories and good sources, in three groups: first steps in Germany, announcements, university and academic support.' },
      { k: 'Build', v: 'Shared projects, workshops, bootcamps, hackathons and CTFs, for ideas nobody should have to carry alone.' },
      { k: 'So far', v: 'A first meetup in Bremen in October 2026, a talk series with professionals, and a CTF qualifier for hackathons and ethical hacking.' },
    ],
    facts: [{ n: '250+', k: 'members' }, { n: '3', k: 'WhatsApp groups' }],
    asOf: 'Nov 2026', href: 'https://turktechalmanya.de/en', cta: 'turktechalmanya.de',
    linkedin: 'Türk Tech Almanya on LinkedIn',
    join: 'Join on WhatsApp', qr: { hover: 'Hover for the QR code', tap: 'Tap for QR', scan: 'Scan to join on WhatsApp', label: 'Join Türk Tech Almanya on WhatsApp, QR code' },
  },
  contact: { line1: 'Let’s build', line2: 'something', accent: 'precise.', mail: 'Email me', fallback: 'Write me on LinkedIn', copyright: '© 2026 Can Kara', top: 'Back to top' },
};
