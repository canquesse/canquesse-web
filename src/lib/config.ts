export const config = {
  owner: 'canquesse',
  name: 'canquesse',
  handle: '@canquesse',
  title: 'full-stack developer',
  subtitle: 'ai systems · builder',
  location: 'İstanbul, TR',

  // Bio — \n ile satır kır
  bio: 'Kod yazan, şeyler inşa eden,\narada düşüncelerini buraya döken biri.',

  // "Şu an ne üzerinde" — değiştir, boş bırakırsan gizlenir
  currently: 'bir şeyler inşa etmekle meşgul',

  // Yetenekler/etiketler
  skills: ['typescript', 'next.js', 'ui/ux', 'systems', 'coffee→code'],

  // Motto — her sayfa yüklemesinde rastgele seçilir
  mottos: [
    'make things, break things.',
    'less, but better.',
    'ship it, then fix it.',
    'the details are not the details.',
    'done is better than perfect.',
  ],

  // Dış linkler
  // Labels are pre-uppercased so locale-sensitive CSS casing (tr: i→İ) never
  // mangles technical names like GITHUB/LINKEDIN.
  links: [
    { label: 'GITHUB',   href: 'https://github.com/canquesse' },
    { label: 'LINKEDIN', href: 'https://linkedin.com/in/canquesse' },
    { label: 'E-POSTA',  href: 'mailto:canquesse@gmail.com' },
  ],
} as const;
