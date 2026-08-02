export const portfolio = {
  about: {
    availability: true,
  },
  // Non-translated structure for experience (text lives in translations.ts).
  // One entry per translations.experience[] entry, in the same order.
  experience: [
    { tags: ['backend', 'full-stack'], stack: ['java', 'spring'] },
    { tags: ['freelance', 'web'],      stack: ['next.js', 'react', 'typescript'] },
  ],
  // Pulled from github.com/canquesse — summarized into entries.
  projects: [
    {
      id: 'character-skipper',
      name: 'Character Skipper',
      year: '2026',
      tags: ['on-device ai', 'chrome', 'javascript'],
      href: 'https://github.com/canquesse/character-skipper',
      status: 'canlı' as const,
    },
    {
      id: 'medradar',
      name: 'MedRadar',
      year: '2026',
      tags: ['medtech', 'data', 'javascript'],
      href: 'https://github.com/canquesse/MedRadar',
      status: 'canlı' as const,
    },
    {
      id: 'agentlens',
      name: 'AgentLens',
      year: '2026',
      tags: ['ai agents', 'observability', 'eval'],
      href: 'https://github.com/canquesse/agentlens',
      status: 'wip' as const,
    },
    {
      id: 'stockanalyzer',
      name: 'StockAnalyzerApp',
      year: '2025',
      tags: ['java', 'javafx'],
      href: 'https://github.com/canquesse/StockAnalyzerApp',
      status: 'wip' as const,
    },
    {
      id: 'machinelearning',
      name: 'machine_learning',
      year: '2025',
      tags: ['python', 'ml', 'jupyter'],
      href: 'https://github.com/canquesse/machine_learning',
      status: 'arşiv' as const,
    },
  ],
} as const;
