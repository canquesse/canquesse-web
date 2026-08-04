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
  // `link` says where the row points; `privateRepo` marks work whose source is
  // closed, so the UI can say so instead of linking visitors into a 404.
  // Every entry carries both fields so the shape stays uniform for consumers.
  projects: [
    {
      id: 'character-skipper',
      name: 'Character Skipper',
      year: '2026',
      tags: ['on-device ai', 'chrome', 'javascript'],
      href: 'https://github.com/canquesse/character-skipper',
      link: 'github' as const,
      privateRepo: false,
      status: 'canlı' as const,
    },
    {
      id: 'medradar',
      name: 'MedRadar',
      year: '2026',
      tags: ['medtech', 'data', 'javascript'],
      href: 'https://github.com/canquesse/MedRadar',
      link: 'github' as const,
      privateRepo: false,
      status: 'canlı' as const,
    },
    {
      id: 'cautrum',
      name: 'CAUTRUM',
      year: '2026',
      tags: ['ai agents', 'observability', 'eval'],
      href: 'https://instagram.com/cautrumoffical',
      link: 'instagram' as const,
      privateRepo: true,
      status: 'wip' as const,
    },
    {
      id: 'stockanalyzer',
      name: 'StockAnalyzerApp',
      year: '2025',
      tags: ['java', 'javafx'],
      href: 'https://github.com/canquesse/StockAnalyzerApp',
      link: 'github' as const,
      privateRepo: false,
      status: 'wip' as const,
    },
    {
      id: 'machinelearning',
      name: 'machine_learning',
      year: '2025',
      tags: ['python', 'ml', 'jupyter'],
      href: 'https://github.com/canquesse/machine_learning',
      link: 'github' as const,
      privateRepo: false,
      status: 'arşiv' as const,
    },
  ],
} as const;
