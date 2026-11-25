/**
 * All copy of the site: one file per language, same shape (Site). Links and stacks: shared.ts.
 * Source: Can_Kara_Teknik_Profil_Websitesi.md, Türk Tech Almanya: turktechalmanya.de
 * Fields set to null are simply not rendered, so nothing like "[TODO]" ever shows up on the page.
 *
 * Ground rules from the profile: dbh is described by personal contribution only (no internal names,
 * topology, customers or measurements), CAUTRUM is always "private pre-alpha", and no numbers
 * appear without a source and a date.
 */
import { en } from './en';
import { tr } from './tr';
import { de } from './de';
import type { Locale } from './shared';

export interface Pair { k: string; v: string }
export interface ProjectCopy {
  /** one entry per line of the big title */
  name: string[];
  /** short line shown at the top of the card */
  kind: string;
  description: string;
  facts: Pair[];
  /** text of the link, used when shared.ts has an href */
  open: string;
}
export interface GateCopy { propose: string; note: string; tap: string; alt: string; logLabel: string; words: { allow: string; ask: string; deny: string; approved: string; expired: string; approve: string } }
export interface Station { period: string; organization: string; role: string; place: string; description: string | null; points: Pair[] }
export interface Site {
  title: string; description: string; skip: string;
  chapters: Array<{ id: string; label: string }>;
  nav: { links: Array<{ label: string; href: string }>; contact: string; sections: string; main: string; language: string };
  hero: { given: string; surname: string; meta: string[]; line: string[]; lead: string; cue: string };
  about: { label: string; title: string; titleAccent: string; statement: string; facts: Pair[] };
  work: { title: string; titleAccent: string; note: string; gate: GateCopy; projects: ProjectCopy[] };
  stack: { title: string; note: string; groups: Array<{ title: string; items: string[] }> };
  experience: { label: string; title: string; titleAccent: string; items: Station[] };
  method: { label: string; title: string; titleAccent: string; items: Pair[] };
  community: { title: string; titleAccent: string; steps: Pair[]; facts: Array<{ n: string; k: string }>; asOf: string; href: string; cta: string; join: string; linkedin: string; qr: { hover: string; tap: string; scan: string; label: string } };
  contact: { line1: string; line2: string; accent: string; mail: string; fallback: string; copyright: string; top: string };
}
export const sites: Record<Locale, Site> = { en, tr, de };
