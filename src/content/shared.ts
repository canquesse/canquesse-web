/** what is the same in every language: links, stacks, drawings */
export const locales = ['en', 'tr', 'de'] as const;
export type Locale = (typeof locales)[number];

export const brand = 'canquesse';
/** the pinned word between work and stack; the ribbon winds around it */
export const wordmark = 'canquesse';
export const marquee = 'JAVA  •  PYTHON  •  SPRING BOOT  •  FASTAPI  •  RAG  •  AGENTS  •  MCP  •  PGVECTOR  •  REACT  •  TYPESCRIPT  •  DOCKER  •  ';

export const email: string | null = 'canquesse@gmail.com';
export const linkedin = 'https://www.linkedin.com/in/canquesse';
export const ttaLinkedin = 'https://www.linkedin.com/company/turktechalmanya';
export const github = 'https://github.com/canquesse';

export interface ProjectBase {
  stack: string[];
  href: string | null; // TODO: links of the other projects
  /** cover drawing until real screenshots exist */
  cover: 'gate' | 'room' | 'skip' | 'grid' | 'lab';
  image: string | null; // TODO: real screenshot, e.g. /work/lumivox.avif
}
export const projects: ProjectBase[] = [
  { stack: ['Python', 'FastAPI', 'Spring Boot', 'PostgreSQL', 'pgvector', 'React', 'TypeScript'], href: 'https://www.instagram.com/cautrumofficial/', cover: 'gate', image: null },
  { stack: ['YOLO', 'OneFormer', 'OpenCV', 'FastAPI', 'React', 'TypeScript', 'Canvas', 'WebSockets'], href: null, cover: 'room', image: null },
  { stack: ['Computer Vision', 'WebAssembly', 'Chrome Extension'], href: 'https://chromewebstore.google.com/detail/character-skipper-for-you/bmgkhekbhlgophgomohpglipnnnladkm', cover: 'skip', image: null },
  { stack: ['React Native', 'Expo', 'Supabase'], href: null, cover: 'grid', image: null },
  { stack: ['Linux', 'OpenAI-compatible API', 'Tailscale', 'SSH'], href: null, cover: 'lab', image: null },
];
