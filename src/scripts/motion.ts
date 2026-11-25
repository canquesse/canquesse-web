import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { createStage, type Pose, type Run } from './stage';
import { SCULPT_HOLE } from './sculpture';
import { C_HOLE, TRACK, trackAngle, trackRadius } from './shapes';
import { ahead, clamp01, Curve, Playhead, smoother, soften } from './score';

/** the parts of the copy the scripts need, written into the page (Page.astro) */
const site = JSON.parse(document.querySelector('[data-site]')!.textContent!) as { chapters: Array<{ id: string; label: string }>; marquee: string; wordmark: string };

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
// starts from rest and comes to rest: no kick at the beginning, no edge at the end
CustomEase.create('settle', '0.3,0,0,1');
const EASE = 'settle';

const TAU = Math.PI * 2;
const UP = -Math.PI / 2;
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789#%&*+/<>=';

/** decode a mono label into `text` */
function scramble(el: HTMLElement & { __scr?: number }, text = el.dataset.text ?? el.textContent ?? '', duration = 0.7) {
  el.dataset.text = text;
  const chars = Array.from(text);
  const start = performance.now();
  const id = (el.__scr = (el.__scr ?? 0) + 1);
  const frame = (now: number) => {
    if (el.__scr !== id) return;
    const p = Math.min(1, (now - start) / (duration * 1000));
    const settled = Math.floor(p * chars.length * 1.15);
    el.textContent = chars.map((c, i) => (c === ' ' || i < settled ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
    if (p < 1) requestAnimationFrame(frame); else el.textContent = text;
  };
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------
 * The score.
 * A cue is [section, where, pose]. `where` ≥ 0 is a fraction of that section's own scroll distance,
 * `where` < 0 means that many screens before the section reaches the top.
 * A pose only lists what changes; everything else carries over from the cue before it.
 * ------------------------------------------------------------------ */
type Cue = [string, number, Pose];
type Score = Array<{ form: Run['form']; cues: Cue[] }>;

/** turn, become glass, and drift into the approach: one gesture, sampled finely */
let hole: [number, number, number] = C_HOLE;
const heroRun = (s0: number, py: number, zoom: number): Cue[] => Array.from({ length: 41 }, (_, i) => {
  const u = i / 40;
  const go = smoother(0.4, 0.94, u);
  return ['[data-hero]', u, {
    ry: -0.18 + (TAU + 0.18) * smoother(0.0, 0.92, u),
    rx: 0.04 + 0.05 * smoother(0, 0.3, u) - 0.09 * smoother(0.4, 0.9, u),
    s: s0 * Math.exp(0.1 * smoother(0, 0.55, u) + Math.log(zoom) * Math.pow(clamp01((u - 0.3) / 0.7), 3.4)),
    q: hole[0] * go, fy: hole[1] * go, fz: hole[2] * go, py: py * (1 - go),
    glass: smoother(0.02, 0.24, u),
  }] as Cue;
});

// the helix face the camera runs into before the page turns red
const FACE = 206;
const faceSpin = (near: number) => { const k = trackAngle(FACE); return k + Math.round((near - k) / TAU) * TAU; };

const desktop = (aspect: number): Score => {
  const s = Math.min(1.2, Math.max(0.6, aspect / 1.42));
  const spin = faceSpin(21.5);
  return [
    { form: 'cq', cues: heroRun(s * 1.02, 0.015, 11.5) },
    { form: 'track', cues: [
      ['[data-hero]', 0.968, { q: TRACK.swell - 4, px: 0.78, py: 0.2, s: 1.3, rz: -1.02 }],
      ['[data-about]', 0, { q: TRACK.swell - 0.5, px: 0.375, py: 0.01, s: 1.07, rz: -1.18 }],
      // the camera only travels on along the standing strip and the loop comes by; it never swings
      ['[data-about]', 1, { q: TRACK.swell + 2.6, px: 0.375, py: 0.04, s: 1.06, rz: -1.28 }],
      ['[data-work]', -0.5, { q: 8, px: 0.33, rz: -1.24, spin: 0.28, s: 0.98 }],
      ['[data-work]', -0.04, { q: 16.6, px: 0.15, py: 0.07, s: 0.86, rz: -1.14, spin: 0.56 }],
      ['[data-project="0"]', -0.34, { q: 18.6, px: 0.12, py: 0.13, rz: -1.1 }],
      ['[data-project="0"]', 0, { q: 21, px: 0.1 }],
      ['[data-project="1"]', 0, { q: 29, px: 0.08, py: 0.06, ry: 0.04, rz: -0.96, s: 0.96 }],
      ['[data-project="2"]', 0, { q: 38.5, fy: 0.4, px: 0.04, py: 0.04, rx: 0.04, rz: -0.62, s: 1, spin: 0.8 }],
      ['[data-project="3"]', 0, { q: 49, fy: 0, px: 0, py: 0, rx: 0.08, rz: -0.26, ry: 0 }],
      ['[data-project="4"]', 0, { q: 60, rx: 0.1, rz: 0 }],
      ['[data-wordmark]', -0.5, { q: 71 }],
      ['[data-wordmark]', 0.0, { q: 80.5, fill: 0, spin: 1.4 }],
      ['[data-wordmark]', 0.3, { q: 85.2, rx: 0.08, fill: 0.5, spin: 3 }],
      ['[data-wordmark]', 0.56, { q: 86.8, rx: 0.06, rz: 0, fill: 1.07, spin: 4.4 }],
      ['[data-wordmark]', 0.74, { q: 94, rx: 0.06, rz: -0.06 }],
      ['[data-wordmark]', 0.88, { q: 104, rx: 0.07, rz: -0.3, px: 0.03 }],
      ['[data-stack]', -0.5, { q: 122, rx: 0.1, rz: -1.15, px: 0.18 }],
      ['[data-stack]', 0, { q: 135, px: 0.25, rx: 0.12, rz: UP + 0.1, s: 0.98, spin: 6.2, text: 1 }],
      ['[data-stack]', 0.5, { q: 137, rx: 0.14, rz: UP + 0.08, spin: 9.4 }],
      ['[data-stack]', 1, { q: 139, rx: 0.15, rz: UP + 0.06, spin: 13, text: 1 }],
      ['[data-experience]', -0.5, { q: 158, px: 0.32, s: 0.86, spin: 14.8, text: 0.5 }],
      ['[data-experience]', 0, { q: 180, px: 0.385, rx: 0.1, rz: UP + 0.03, s: 0.78, spin: 16.4, text: 0 }],
      ['[data-community]', -1.02, { q: 199, px: 0.385, rx: 0.06, rz: UP, s: 0.8, spin: spin - 1.4 }],
      ['[data-community]', -0.7, { q: 204.4, px: 0.25, fz: trackRadius(FACE) * 0.6, rx: 0.03, s: 1.8, spin: spin - 0.3, flat: 0 }],
      ['[data-community]', -0.34, { q: FACE, px: 0, fz: trackRadius(FACE), rx: 0, s: 14, spin, flat: 1 }],
    ] },
    { form: 'cq', cues: [
      ['[data-community]', -0.26, { show: 0, head: 0, s: s * 0.9, px: 0.05, py: 0.05, rx: 0.06, ry: -0.5 }],
      ['[data-footer]', -0.48, { show: 0 }],
      ['[data-footer]', -0.46, { show: 1, head: 0, ry: -0.72, rx: 0.14 }],
      ['[data-footer]', 0.25, { head: 1, ry: -0.28, rx: 0.06, px: 0.11, py: 0.07, s: s * 0.84 }],
      ['[data-footer]', 1, { ry: -0.12, px: 0.25, py: 0.165, s: s * 0.61, rx: 0.04 }],
    ] },
  ];
};

const mobile = (grow: number): Score => {
  const spin = faceSpin(21.5);
  const g = (s: number) => s * grow;
  return [
    { form: 'cq', cues: heroRun(g(0.48), 0.05, 13) },
    { form: 'track', cues: [
      ['[data-hero]', 0.968, { q: TRACK.swell - 8, px: 0.1, py: -0.72, s: g(0.5), rz: -0.3 }],
      ['[data-about]', 0, { q: TRACK.swell, px: 0.02, py: -0.215, s: g(0.42), rz: -0.12 }],
      ['[data-about]', 1, { q: TRACK.swell + 3, py: -0.205, s: g(0.44), rz: 0.0 }],
      // it leaves upwards together with the page, so the heading never runs through it
      ['[data-work]', -0.62, { q: 4, py: 0.19, rz: 0.03 }],
      ['[data-work]', -0.1, { q: 9, py: 0.78, px: 0.06 }],
      ['[data-project="0"]', -0.3, { q: 12, py: 0.8, fy: 1 }],
      ['[data-project="0"]', 0, { q: 15, px: 0.1, py: -0.1, fy: 2 }],
      ['[data-project="1"]', 0, { q: 26, fy: 1.6, ry: 0.06, s: g(0.44) }],
      ['[data-project="2"]', 0, { q: 38, fy: 0.9, px: 0.05, py: -0.05, rx: 0.05, ry: 0.03, s: g(0.46) }],
      ['[data-project="3"]', 0, { q: 49, fy: 0, px: 0, py: 0, rx: 0.1, rz: 0.05, ry: 0, s: g(0.5) }],
      ['[data-project="4"]', 0, { q: 61 }],
      ['[data-wordmark]', -0.5, { q: 74 }],
      ['[data-wordmark]', 0.0, { q: 82.5, fill: 0, s: g(0.52) }],
      ['[data-wordmark]', 0.3, { q: 85.4, fill: 0.5, spin: 1.6 }],
      ['[data-wordmark]', 0.6, { q: 86.8, fill: 1.07, rz: 0, spin: 3.4 }],
      ['[data-wordmark]', 0.85, { q: 95, rz: -0.03 }],
      ['[data-stack]', -0.4, { q: 120, s: g(0.44), py: 0.05, rz: -0.08 }],
      ['[data-stack]', 0, { q: 134, py: 0.07, rx: 0.14, rz: -0.1, s: g(0.4), spin: 5.5 }],
      ['[data-stack]', 1, { q: 140, rz: -0.05, rx: 0.17, spin: 13 }],
      ['[data-experience]', -0.62, { q: 160, px: 0.3, py: 0.16, rz: -0.95, s: g(0.5), spin: 15 }],
      ['[data-experience]', -0.22, { q: 182, px: 0.46, py: 0, rx: 0.08, rz: UP, s: g(0.46), spin: 16.4 }],
      ['[data-community]', -1.02, { q: 200, px: 0.46, rz: UP, spin: spin - 1.4 }],
      ['[data-community]', -0.7, { q: 204.4, px: 0.3, fz: trackRadius(FACE) * 0.6, rx: 0.03, s: 1.3, spin: spin - 0.3, flat: 0 }],
      ['[data-community]', -0.34, { q: FACE, px: 0, fz: trackRadius(FACE), rx: 0, s: 14, spin, flat: 1 }],
    ] },
    { form: 'cq', cues: [
      ['[data-community]', -0.26, { show: 0, head: 0, s: g(0.44), py: 0.1, rx: 0.06, ry: -0.5 }],
      ['[data-footer]', -0.48, { show: 0 }],
      ['[data-footer]', -0.46, { show: 1, head: 0, ry: -0.7, rx: 0.14 }],
      ['[data-footer]', 0.25, { head: 1, ry: -0.25, rx: 0.06, py: 0.15, s: g(0.42) }],
      ['[data-footer]', 1, { ry: -0.12, px: 0.01, py: 0.265, s: g(0.4) }],
    ] },
  ];
};

/** the page colour is part of the same score, so light, shadow and strip always change together */
const colours: Array<[string, number, string]> = [
  ['[data-hero]', 0, '#FBF2ED'], ['[data-hero]', 0.97, '#FBF2ED'], ['[data-about]', -0.02, '#F9DACD'],
  ['[data-about]', 1, '#F9DACD'], ['[data-work]', -0.15, '#FBF2ED'],
  ['[data-wordmark]', -0.95, '#FBF2ED'], ['[data-wordmark]', -0.2, '#F3654B'],
  ['[data-wordmark]', 0.8, '#F3654B'], ['[data-stack]', -0.15, '#EFC6AF'],
  ['[data-stack]', 1, '#EFC6AF'], ['[data-experience]', -0.15, '#FBF2ED'],
  // changes while the strip covers the whole screen
  ['[data-community]', -0.42, '#FBF2ED'], ['[data-community]', -0.36, '#C9231F'],
  ['[data-footer]', -0.9, '#C9231F'], ['[data-footer]', -0.3, '#F9DACD'],
];
const toLinear = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = (c: number) => Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055) * 100) / 100;

export async function initMotion(): Promise<() => void> {
  const root = document.documentElement;
  const still = root.classList.contains('is-still');
  const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
  const qa = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));
  const disposers: Array<() => void> = [];
  const isMobile = () => innerWidth <= 900;

  history.scrollRestoration = 'manual';
  if (!location.hash) scrollTo(0, 0);

  clearTimeout((window as unknown as { __cqFallback: number }).__cqFallback);
  const bar = q('[data-curtain-bar]');
  if (!still) {
    gsap.fromTo('[data-curtain-word]', { yPercent: 160, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: EASE, delay: 0.1 });
    gsap.set(bar, { scaleX: 0 });
  }

  // the 3D text (marquee, wordmark) is painted from the real fonts
  await Promise.race([
    Promise.all([document.fonts.load('italic 400 40px "Instrument Serif"', 'aığş'), document.fonts.load('400 40px "Instrument Serif"', 'aığş'), document.fonts.load('500 20px "Geist Mono"')]),
    new Promise((r) => setTimeout(r, 1800)),
  ]);
  let stage: ReturnType<typeof createStage> | null = null;
  try {
    stage = createStage(q<HTMLCanvasElement>('[data-stage]'), { marquee: site.marquee, wordmark: site.wordmark });
    stage.buildWord();
    stage.setRefract(qa('[data-refract]'));
    // the sculpture: wait for it behind the curtain, but never for long
    await Promise.race([
      stage.loadModel((p) => { if (!still) gsap.to(bar, { scaleX: p, duration: 0.5, ease: 'sine.out', overwrite: true }); }).catch((err) => console.warn('model unavailable, the strip draws the CQ', err)),
      new Promise((r) => setTimeout(r, 12000)),
    ]);
    if (stage.hasModel()) hole = SCULPT_HOLE;
    stage.prewarm();
    root.classList.add('has-stage');
    disposers.push(() => stage?.destroy());
  } catch (err) {
    console.warn('3D stage unavailable, showing the page without it', err);
  }

  /* ---------- where things are ---------- */
  const tops = new Map<string, { top: number; height: number }>();
  const measure = (sel: string) => {
    let m = tops.get(sel);
    if (!m) {
      const el = q(sel);
      // cards are sticky and transformed: use their place in the flow
      if (el.matches('[data-project]')) {
        const host = q('[data-projects]');
        const gap = parseFloat(getComputedStyle(host).rowGap) || 0;
        m = { top: host.getBoundingClientRect().top + scrollY + Number(el.dataset.project) * (el.offsetHeight + gap), height: el.offsetHeight };
      } else m = { top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight };
      tops.set(sel, m);
    }
    return m;
  };
  const at = (sel: string, f: number) => {
    const { top, height } = measure(sel);
    const room = f < 0 ? innerHeight : height > innerHeight * 1.02 ? height - innerHeight : innerHeight;
    return top + room * f;
  };

  let bg: Curve[] = [];
  /** scroll-linked timelines: all of them read the same playhead */
  const tracks: Array<{ tl: gsap.core.Animation; from: () => number; to: () => number; a: number; b: number }> = [];
  const link = (tl: gsap.core.Animation, from: () => number, to: () => number) => { tl.pause(); tracks.push({ tl, from, to, a: 0, b: 1 }); };
  const pins: Array<{ el: HTMLElement; sec: string; card: boolean; a: number; b: number; set: (v: number) => void }> = [];

  let heroTl: gsap.core.Timeline | null = null;
  const layout = () => {
    tops.clear();
    // the hero is composed in pixels: measure it again for this window
    if (heroTl) { const p = heroTl.progress(); heroTl.progress(0).invalidate().progress(p); }
    const max = root.scrollHeight - innerHeight;
    if (stage) {
      stage.resize();
      const aspect = innerWidth / innerHeight;
      const score = isMobile() ? mobile(Math.min(1.4, Math.max(1, aspect / 0.5))) : desktop(aspect);
      stage.setRuns(score.map((run) => ({ form: run.form, keys: run.cues.map(([sel, f, pose]) => ({ y: Math.min(max, at(sel, f)), pose })) })));
const com = (screens: number) => at('[data-community]', 0) + innerHeight * screens, end = (f: number) => at('[data-footer]', f);
      stage.setWeave(
        new Curve([at('[data-community]', -0.3), com(3.6), end(-1.9), end(-0.3)], [0, 1, 1, 2]),
        new Curve([com(3.2), com(4.7)], [0, 1]),
        new Curve([com(3.75), com(5.5), end(-2.05), end(-0.95)], [0, 1, 1, 2]),
      );
    }
    const ys = colours.map(([sel, f]) => at(sel, f));
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + 1);
    const channel = (hex: string, c: number) => toLinear(parseInt(hex.slice(1 + c * 2, 3 + c * 2), 16));
    bg = [0, 1, 2].map((c) => new Curve(ys, colours.map(([, , hex]) => channel(hex, c))));
    for (const t of tracks) { t.a = t.from(); t.b = Math.max(t.a + 1, t.to()); }
    for (const p of pins) {
      const m = measure(p.sec);
      p.a = p.card ? m.top - (parseFloat(getComputedStyle(p.el).top) || 0) : m.top;
      p.b = m.top + m.height - innerHeight;
    }
    redEdge = [at('[data-community]', -0.4), at('[data-footer]', -0.6)];
  };
  let redEdge = [Infinity, Infinity];

  const bgNow: number[] = [];
  const applyBg = (y: number, k = 1) => {
    if (!bg.length) return;
    bg.forEach((c, i) => {
      const v = c.at(y); bgNow[i] = bgNow[i] === undefined || k >= 1 ? v : bgNow[i] + (v - bgNow[i]) * k;
    });
    const css = `rgb(${bgNow.map(toSrgb).join(', ')})`;
    document.body.style.backgroundColor = css;
    stage?.setBg(css);
    document.body.classList.toggle('on-red', y > redEdge[0] && y < redEdge[1]);
  };

  /* ---------- chapters ---------- */
  const label = document.querySelector<HTMLElement>('[data-chapter-label]');
  const dots = new Map(qa('[data-rail-dot]').map((d) => [d.dataset.railDot!, d] as const));
  const sections = qa('[data-chapter]');
  let current = '';
  const setChapter = (id: string) => {
    if (id === current) return;
    current = id;
    dots.forEach((d, key) => d.setAttribute('aria-current', String(key === id)));
    const text = site.chapters.find((c) => c.id === id)?.label ?? '';
    if (label) { if (still) label.textContent = text; else scramble(label, text, 0.5); }
  };
  setChapter('top');
  const onSections = () => {
    let hit: HTMLElement | undefined;
    for (const el of sections) if (el.getBoundingClientRect().top <= innerHeight * 0.55) hit = el;
    if (hit) setChapter(hit.dataset.chapter!);
  };

  /* ---------- languages: the same place on the other page ---------- */
  const lang = q('[data-lang]'), langBtn = q<HTMLButtonElement>('[data-lang-toggle]');
  const openLang = (open: boolean) => { lang.classList.toggle('is-open', open); langBtn.setAttribute('aria-expanded', String(open)); };
  const onLang = (e: MouseEvent) => {
    const t = e.target as Element;
    if (t.closest('[data-lang-toggle]')) { openLang(!lang.classList.contains('is-open')); return; }
    const a = t.closest<HTMLAnchorElement>('[data-lang-link]');
    if (!a) { openLang(false); return; }
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (a.getAttribute('aria-current')) { openLang(false); return; }
    const el = sections.find((s) => s.dataset.chapter === current) ?? sections[0];
    const r = el.getBoundingClientRect();
    try { sessionStorage.setItem('cq:at', JSON.stringify({ id: current, f: -r.top / r.height, bg: getComputedStyle(document.body).backgroundColor })); } catch { /* it opens at the top */ }
    gsap.to('main, footer, .stage, .nav, .rail', { opacity: 0, duration: still ? 0 : 0.35, ease: 'sine.inOut', onComplete: () => location.assign(a.href) });
  };
  const onLangKey = (e: KeyboardEvent) => { if (e.key === 'Escape') openLang(false); };
  document.addEventListener('click', onLang); document.addEventListener('keydown', onLangKey);
  disposers.push(() => { document.removeEventListener('click', onLang); document.removeEventListener('keydown', onLangKey); });
  let back: { id: string; f: number } | null = null;
  try { back = JSON.parse(sessionStorage.getItem('cq:at') ?? 'null'); sessionStorage.removeItem('cq:at'); } catch { /* none */ }
  const comeBack = () => {
    if (!back) return;
    const el = sections.find((s) => s.dataset.chapter === back!.id);
    if (el) scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight * back.f));
    gsap.fromTo('main, footer, .stage, .nav, .rail', { opacity: 0 }, { opacity: 1, duration: still ? 0 : 0.6, delay: still ? 0 : 0.15, ease: 'sine.inOut', clearProps: 'opacity', onStart: () => root.classList.remove('is-return') });
    root.style.removeProperty('--bg');
  };

  const clock = q<HTMLTimeElement>('[data-clock]');
  const tellTime = () => { clock.textContent = new Date().toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }); };
  tellTime();
  const clockId = setInterval(tellTime, 10000);
  disposers.push(() => clearInterval(clockId));

  /* ---------- reduced motion: the finished page, nothing travels ---------- */
  if (still) {
    qa('[data-bg]').forEach((el) => { el.style.backgroundColor = el.dataset.bg!; });
    const canvas = q<HTMLElement>('[data-stage]'), mark = q('[data-wordmark]');
    let poses: [number, number, number] = [0, 0, 0];
    const draw = () => {
      onSections();
      if (!stage) return;
      const m = mark.getBoundingClientRect(), end = root.scrollHeight - innerHeight - scrollY;
      const show = [1 - scrollY / (innerHeight * 0.18), 1 - Math.abs(m.top) / (innerHeight * 0.4), 1 - end / (innerHeight * 0.25)];
      const best = show.indexOf(Math.max(...show));
      canvas.style.opacity = String(clamp01(show[best] * 1.6));
      stage.frame(poses[best], 0, 1, 0.016, false);
    };
    const relayout = () => { layout(); poses = [0, at('[data-wordmark]', 0.56), root.scrollHeight]; draw(); };
    addEventListener('scroll', draw, { passive: true }); addEventListener('resize', relayout);
    relayout(); document.fonts.ready.then(relayout);
    comeBack();
    q('[data-thread] path').setAttribute('d', 'M0 20H4000');
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); import('./gate').then((m) => m.createGate(q('[data-project="0"] [data-project-card]'))).then((g) => disposers.push(() => g.dispose())).catch(() => {}); } }, { rootMargin: '60%' });
    io.observe(q('[data-project="0"]'));
    disposers.push(() => io.disconnect());
    disposers.push(() => { removeEventListener('scroll', draw); removeEventListener('resize', relayout); });
    return () => disposers.forEach((d) => d());
  }

  /* ---------- one clock ---------- */
  // Every scene needs its moment: a hard flick may ask for more, but the page never travels faster
  // than SPEED screens per second, and surplus wheel momentum is dropped instead of queued up.
  const SPEED = 3.3, LERP = 0.11;
  const lenis = new Lenis({
    lerp: LERP, wheelMultiplier: 0.95, syncTouch: false,
    virtualScroll: (data: { deltaY: number; event: Event }) => {
      if (data.event.type !== 'wheel') return true;
      const lead = (innerHeight * SPEED) / (LERP * 60);
      const at0 = lenis.animatedScroll, want = lenis.targetScroll + data.deltaY;
      const d = Math.min(at0 + lead, Math.max(at0 - lead, want)) - lenis.targetScroll;
      // never exactly zero: Lenis would hand a zero delta back to the browser's own scrolling
      data.deltaY = d * data.deltaY > 0 ? d : Math.sign(data.deltaY) * 0.001;
      return true;
    },
  });
  lenis.on('scroll', () => ScrollTrigger.update());
  const OMEGA = 12;
  const head = new Playhead(OMEGA);
  let last = 0;
  let playing = 0; // what the page shows
  // a jump (End key, scrollbar, long link) is not played through: the stage dips out and back in
  const canvasEl = q<HTMLElement>('[data-stage]');
  let veil = 0, veilShown = 0, veiling = false, bgRest = 1;

  const nameEl = document.querySelector<HTMLElement>('[data-hero-title]');
  const raf = (t: number) => {
    lenis.raf(t * 1000);
    const dt = Math.min(0.05, Math.max(0.001, t - last)); last = t;
    const y = scrollY;
    if (head.x >= 0 && Math.abs(y - head.x) > innerHeight * 1.7) veiling = true;
    if (veiling) {
      veil = Math.min(1, veil + dt / 0.18);
      if (veil === 1) { head.jump(y); veiling = false; bgRest = 0; }
    } else {
      veil = Math.max(0, veil - dt / 0.4);
      head.step(y, dt);
    }
    const op = String(1 - smoother(0, 1, veil));
    if (veil !== veilShown) { canvasEl.style.opacity = op; veilShown = veil; }
    playing = Math.max(0, ahead(head, OMEGA));
    bgRest = Math.min(1, bgRest + dt / 0.6);
    applyBg(playing, bgRest < 1 ? 1 - Math.exp(-8 * dt) : 1);
    for (const k of tracks) {
      const p = clamp01((playing - k.a) / (k.b - k.a));
      if (k.tl.progress() !== p) k.tl.progress(p);
    }
    // pinned panels glide into and out of their pin instead of hitting it
    for (const p of pins) {
      const d = p.a - y, w = innerHeight * (p.card ? 0.1 : 0.16);
      if (Math.abs(d) > innerHeight * 1.6 && (p.card || Math.abs(p.b - y) > innerHeight * 1.6)) continue;
      p.set(soften(d, w) - (p.card ? 0 : soften(y - p.b, w)));
    }
    if (stage && nameEl && y < innerHeight * 1.6) { const [lx, ly] = stage.lean(); nameEl.style.transform = `translate3d(${(-lx * 26).toFixed(2)}px, ${(-ly * 18).toFixed(2)}px, 0)`; }
    onSections();
    updateGroups();
    moveQr(t, dt);
    runGate(playing, dt);
    moveThread(dt);
    if (!document.hidden) stage?.frame(playing, head.v, t, dt, true);
  };
  const groups = qa('[data-stack-group]');
  let groupRange = [0, 1], groupOn = -1, stepRange = [0, 1];
  const steps = qa('[data-step]');
  let stepOn = -2;
  const updateGroups = () => {
    const p = (playing - stepRange[0]) / (stepRange[1] - stepRange[0]);
    const st = p < 0 ? -1 : Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (st !== stepOn) { stepOn = st; steps.forEach((el, i) => { el.classList.toggle('is-active', i === st); el.classList.toggle('is-past', i < st); }); }
    const on = Math.min(groups.length - 1, Math.floor(clamp01((playing - groupRange[0]) / (groupRange[1] - groupRange[0])) * groups.length));
    if (on !== groupOn) { groupOn = on; groups.forEach((g, i) => g.classList.toggle('is-active', i === on)); }
  };

  const ctx = gsap.context(() => {
    /* ---------- intro: the strip draws the monogram on red, then the curtain lifts ---------- */
    const unit = () => parseFloat(getComputedStyle(q('[data-hero-word]')).fontSize) / (isMobile() ? 4.8 : 2.62);
    /** where a word of the name stands when both form one line (stacked on phones): x, y, scale */
    const meet = (i: 0 | 1): [number, number, number] => {
      const w = names.map((n) => n.offsetWidth), W = innerWidth, gap = 0.2;
      const left = names.map((n) => parseFloat(getComputedStyle(n).left)), top = names.map((n) => parseFloat(getComputedStyle(n).top));
      const size = parseFloat(getComputedStyle(names[0]).fontSize);
      if (isMobile()) { const k = Math.min(1.25, (W * 0.94) / Math.max(...w)); return [W / 2 - left[i], innerHeight * (i ? 0.575 : 0.375) - top[i], k]; }
      const k = Math.min((W * 0.92) / (w[0] + w[1] + size * gap), (innerHeight * 0.62) / size);
      const total = (w[0] + w[1] + size * gap) * k, x0 = (W - total) / 2;
      const cx = i ? x0 + total - (w[1] * k) / 2 : x0 + (w[0] * k) / 2;
      return [cx - left[i], innerHeight * 0.49 - top[i], k];
    };
    const introBits = qa('[data-intro]');
    const names = qa('[data-hero-word]');
    gsap.set(names, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    const letters = names.map((n) => Array.from(n.children) as HTMLElement[]);
    const path = q<SVGPathElement>('[data-curtain-path]');
    gsap.set(['[data-hero-title]', '[data-hero-line]', '.nav', '.rail', introBits], { visibility: 'visible' });
    gsap.set('.hero-line-row', { y: () => innerHeight * 1.0 });
    const intro = gsap.timeline({ delay: 0.1 });
    if (stage) {
      const st = stage.intro;
      Object.assign(st, { head: 0, spin: -0.62, scale: 2.1, tint: 1, tilt: 0.16, follow: stage.hasModel() ? 0.86 : 0 });
      // one gesture: the pen runs, the camera stays with it and pulls back as the form completes
      intro.to(st, { head: 1, duration: 2.75, ease: 'sine.inOut' }, 0)
        .to(st, { spin: 0, tilt: 0, duration: 3.6, ease: 'sine.inOut' }, 0)
        .to(st, { scale: 1, duration: 3.1, ease: 'sine.inOut' }, 0.1)
        .to(st, { follow: 0, duration: 2.7, ease: 'sine.inOut' }, 0.3)
        .to(st, { tint: 0, duration: 1.7, ease: 'sine.inOut' }, 2.0);
    }
    const lift = { e: 100, b: 0 };
    intro.to(bar, { opacity: 0, duration: 0.4, ease: 'sine.inOut' }, 0)
      .to('[data-curtain-word]', { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, 1.8)
      .to(lift, { e: -2, duration: 1.4, ease: 'power3.inOut', onUpdate: () => path.setAttribute('d', `M0 -2 H100 V${lift.e} Q50 ${lift.e - lift.b} 0 ${lift.e} Z`) }, 2.1)
      .to(lift, { b: 46, duration: 0.7, ease: 'sine.inOut' }, 2.1)
      .to(lift, { b: 0, duration: 0.7, ease: 'sine.inOut' }, 2.8)
      .set('[data-curtain]', { display: 'none' }, 3.55)
      // the letters come out from behind the sculpture, each from where its word will later return to
      .from(letters[0], { x: () => -unit() * 2.9, y: () => unit() * 2.7, duration: 2, stagger: { each: 0.09, from: 'end' }, ease: EASE, clearProps: 'transform' }, 2.45)
      .from(letters[1], { x: () => unit() * 3.1, y: () => -unit() * 2.6, duration: 2, stagger: 0.09, ease: EASE, clearProps: 'transform' }, 2.55)
      .from(letters.flat(), { opacity: 0, duration: 0.5, stagger: 0.03, ease: 'sine.inOut' }, 2.5)
      .from('.nav > *', { y: -90, duration: 1.4, stagger: 0.08, ease: EASE, clearProps: 'transform' }, 2.85)
      .from(introBits, { y: 26, opacity: 0, duration: 1.3, stagger: 0.08, ease: EASE }, 2.95)
      .from('.rail', { opacity: 0, duration: 0.9, ease: 'sine.inOut' }, 3.25);
    if (back || scrollY > innerHeight * 0.5) intro.progress(1);

    const sine = { ease: 'sine.inOut' };

    /* ---------- hero ---------- */
    const hero = gsap.timeline({ defaults: { ease: 'none' } });
    hero.fromTo('[data-hero-foot]', { opacity: 1, y: 0 }, { opacity: 0, y: 40, duration: 0.07, immediateRender: false, ...sine }, 0.01)
      // the two words cross behind the glass, meet as one line in the middle, and leave to both sides
      .to(names[0], { x: () => meet(0)[0], duration: 0.15, ...sine }, 0.03)
      .to(names[1], { x: () => meet(1)[0], duration: 0.15, ...sine }, 0.03)
      .to(names[0], { y: () => meet(0)[1], scale: () => meet(0)[2], duration: 0.135, ...sine }, 0.1)
      .to(names[1], { y: () => meet(1)[1], scale: () => meet(1)[2], duration: 0.135, ...sine }, 0.1)
      .to(names[0], { x: () => meet(0)[0] - innerWidth * (isMobile() ? 1.05 : 0.66), duration: 0.18, ease: 'power2.in' }, 0.245)
      .to(names[1], { x: () => meet(1)[0] + innerWidth * (isMobile() ? 1.05 : 0.66), duration: 0.18, ease: 'power2.in' }, 0.245)
      // the sentence comes up from below the screen and rests in the middle
      .fromTo('.hero-line-row', { y: () => innerHeight }, { y: 0, duration: 0.25, stagger: 0.025, ease: 'power3.out', immediateRender: false }, 0.33)
      // the sentence accelerates upwards, past the top edge, as the camera moves in
      .to('.hero-line-row', { y: () => -innerHeight * 1.06, duration: 0.32, stagger: 0.025, ease: 'power3.in' }, 0.625)
      .set({}, {}, 1);
    heroTl = hero;
    link(hero, () => at('[data-hero]', 0), () => at('[data-hero]', 1));

    /* ---------- about ---------- */
    const words = SplitText.create(q('[data-ignite]'), { type: 'words', wordsClass: 'ignite-word' });
    link(gsap.fromTo(words.words, { opacity: 0.16 }, { opacity: 1, stagger: 0.12, duration: 0.7, ...sine }), () => at('[data-about]', -0.35), () => at('[data-about]', 0.82));
    link(gsap.fromTo('.about-inner', { opacity: 1 }, { opacity: 0, ...sine }), () => at('[data-work]', -0.98), () => at('[data-work]', -0.6));

    /* ---------- work: cards arrive, settle, and sink back under the next one ---------- */
    const projects = qa('[data-project]');
    projects.forEach((p, i) => {
      const sel = `[data-project="${i}"]`;
      const card = p.querySelector<HTMLElement>('[data-project-card]')!;
      const inTl = gsap.timeline();
      inTl.fromTo(card, { scale: 0.84, transformOrigin: '50% 0%' }, { scale: 1, duration: 1, ease: 'sine.inOut' }, 0)
        .fromTo(p.querySelector('.project-title'), { yPercent: 46 }, { yPercent: 0, duration: 1, ease: 'sine.out' }, 0);
      link(inTl, () => at(sel, -1), () => at(sel, -0.02));
      if (projects[i + 1]) {
        const next = `[data-project="${i + 1}"]`;
        link(gsap.fromTo(p, { scale: 1, rotate: 0, transformOrigin: '50% 0%' }, { scale: 0.9, rotate: i % 2 ? 1.2 : -1.2, ease: 'sine.inOut' }), () => at(next, -1), () => at(next, 0.04));
      }
      link(gsap.fromTo(p.querySelector('[data-cover-inner]'), { yPercent: -5 }, { yPercent: 4, ease: 'none' }), () => at(sel, -1), () => at(sel, 1));
    });

    /* ---------- texts leave before the strip or the colour reaches them ---------- */
    link(gsap.fromTo('.stack-inner', { opacity: 1 }, { opacity: 0, ...sine }), () => at('[data-experience]', -0.92), () => at('[data-experience]', -0.55));
    link(gsap.fromTo('.method', { opacity: 1 }, { opacity: 0, ...sine }), () => at('[data-community]', -1), () => at('[data-community]', -0.7));
    link(gsap.fromTo('.community-inner', { opacity: 1 }, { opacity: 0, ...sine }), () => at('[data-footer]', -0.98), () => at('[data-footer]', -0.62));

    /* ---------- community: the two halves of the name drift ---------- */
    gsap.matchMedia().add('(min-width: 901px)', () => {
      const drift = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut', duration: 1 } });
      drift.fromTo('.community-title > span', { x: '0vw' }, { x: '3vw' }, 0).fromTo('.community-title > em', { x: '5vw' }, { x: '1vw' }, 0);
      link(drift, () => at('[data-community]', -1), () => at('[data-footer]', 0));
      return () => { const i = tracks.findIndex((t) => t.tl === drift); if (i >= 0) tracks.splice(i, 1); };
    });

    /* ---------- reveals: the faster the reader, the quicker the text ---------- */
    const hurry = (self: ScrollTrigger) => { self.animation?.timeScale(Math.min(3, 1 + Math.abs(head.v) / (innerHeight * 0.9))); };
    qa('[data-rise]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'rise-line', autoSplit: true,
        onSplit(self) {
          self.masks.forEach((m) => m.classList.add('rise-mask'));
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(self.lines, { yPercent: 165, duration: 1.5, stagger: 0.11, ease: EASE, scrollTrigger: { trigger: el, start: el.dataset.start ?? 'top 88%', once: true, onEnter: hurry } });
        },
      });
    });
    gsap.from(['.community-foot', '.qr'], { opacity: 0, y: 40, duration: 1.3, ease: EASE, scrollTrigger: { trigger: '[data-community]', start: 'top 12%', once: true, onEnter: hurry } });
    qa('[data-rise-block]').forEach((el) => {
      gsap.set(el, { visibility: 'visible' });
      gsap.from(Array.from(el.children).flatMap((c) => (c.matches('.points') ? Array.from(c.children) : [c])), { y: 60, opacity: 0, duration: 1.4, stagger: 0.09, ease: EASE, scrollTrigger: { trigger: el, start: 'top 84%', once: true, onEnter: hurry } });
    });
    qa('[data-scramble]').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.delayedCall(el.closest('.hero') ? 2.95 : 0, () => scramble(el, undefined, 0.8)) }));
  });
  disposers.push(() => ctx.revert());

  /* ---------- in-page links: near ones glide, far ones dip out and back in ---------- */
  const main = [q('main'), q('[data-footer]')];
  // where a link lands: the moment the scene is complete, not its first pixel
  const LAND: Record<string, number> = { '#about': 0.85, '#stack': 0.15, '#community': 0.8 };
  const onLink = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.classList.contains('skip') || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const target = document.querySelector<HTMLElement>(a.hash);
    if (!target) return;
    e.preventDefault();
    history.pushState(null, '', a.hash);
    const y = a.hash === '#contact' ? root.scrollHeight - innerHeight : Math.min(root.scrollHeight - innerHeight, at(a.hash, LAND[a.hash] ?? 0));
    const screens = Math.abs(y - scrollY) / innerHeight;
    if (screens <= 4) { lenis.scrollTo(y, { duration: Math.max(1.3, screens / 1.6), easing: (t: number) => smoother(0, 1, t) }); return; }
    veiling = true;
    gsap.to(main, { opacity: 0, duration: 0.3, ease: 'sine.inOut', onComplete: () => {
      lenis.scrollTo(y, { immediate: true, force: true });
      head.jump(y); veil = 1; veiling = false; bgRest = 0;
      gsap.to(main, { opacity: 1, duration: 0.6, delay: 0.1, ease: 'sine.inOut', clearProps: 'opacity' });
    } });
  };
  document.addEventListener('click', onLink);
  disposers.push(() => document.removeEventListener('click', onLink));

  /* ---------- the QR card: lies in the corner, rises and flattens for whoever reaches for it ---------- */
  stage?.loadBridge().catch((err) => console.warn('community logo unavailable', err));
  const qrBox = q('[data-qr]'), qrCard = q<HTMLAnchorElement>('[data-qr-card]');
  const qr = { head: new Playhead(6.2), on: false, near: 0, held: false };
  const mouse = { x: -1e4, y: -1e4 };
  const onMove = (e: PointerEvent) => { if (e.pointerType === 'mouse') { mouse.x = e.clientX; mouse.y = e.clientY; } };
  const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse') qr.on = true; };
  const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse') qr.on = false; };
  const onFocus = () => { if (qrCard.matches(':focus-visible')) qr.held = true; };
  const onBlur = () => { qr.held = false; };
  // touch: the first tap brings it up, the second follows the link, a tap elsewhere puts it back
  const onTap = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    if (!qrBox.contains(e.target as Node)) { qr.held = false; return; }
    if (!qr.held) { qr.held = true; qrCard.addEventListener('click', (c) => c.preventDefault(), { once: true, capture: true }); }
  };
  qrBox.addEventListener('pointerenter', onEnter); qrBox.addEventListener('pointerleave', onLeave);
  qrCard.addEventListener('focus', onFocus); qrCard.addEventListener('blur', onBlur);
  addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('pointerdown', onTap);
  disposers.push(() => { removeEventListener('pointermove', onMove); document.removeEventListener('pointerdown', onTap); });
  let qrShown = -1;
  const moveQr = (t: number, dt: number) => {
    const r = qrBox.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) { qr.on = qr.held = false; return; }
    const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
    // it notices a hand coming closer, and lifts its edge now and then while nobody is there
    const near = 0.22 * (1 - smoother(r.width * 0.5, r.width * 2.6, d));
    const beat = (t % 5.2) / 1.5, peek = beat < 1 ? 0.13 * Math.sin(Math.PI * beat) ** 2 : 0;
    qr.head.step(100 * (qr.on || qr.held ? 1 : Math.max(near, peek)), dt);
    const v = Math.min(1, Math.max(0, qr.head.x / 100));
    qrBox.style.setProperty('--float', ((1 - v) * 4 * Math.sin(t * 1.5)).toFixed(2));
    if (Math.abs(v - qrShown) > 0.0005) { qrShown = v; qrBox.style.setProperty('--q', v.toFixed(4)); }
  };

  /* ---------- CAUTRUM: the gate inside the first card. Loaded when the reader gets near, runs while it shows ---------- */
  const gateCard = q('[data-project="0"] [data-project-card]'), nextCard = document.querySelector<HTMLElement>('[data-project="1"]');
  let gate: Awaited<ReturnType<typeof import('./gate').createGate>> | null = null, gateAsked = false;
  disposers.push(() => gate?.dispose());
  const runGate = (y: number, dt: number) => {
    const top = at('[data-project="0"]', 0);
    if (y < top - innerHeight * 2.4 || y > top + innerHeight * 2.6) return;
    if (!gateAsked) { gateAsked = true; import('./gate').then((m) => m.createGate(gateCard)).then((g) => { gate = g; gateCard.classList.add('is-live'); }).catch((err) => console.warn('gate unavailable', err)); }
    if (!gate) return;
    const r = gateCard.getBoundingClientRect();
    const covered = nextCard && nextCard.getBoundingClientRect().top < r.top + 4;
    if (r.bottom < 0 || r.top > innerHeight || covered) return;
    gate.enter((playing - (top - innerHeight * 0.95)) / (innerHeight * 0.9));
    gate.frame(dt);
  };

  /* ---------- footer: the thread, the time in Bremen, the small drawings ---------- */
  const bar2 = q('[data-footer-bar]'), thread = q<SVGPathElement>('[data-thread] path');
  const pull = { x: new Playhead(9), a: new Playhead(7), tx: -1, ta: 0, drawn: '' };
  const onBar = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = bar2.getBoundingClientRect();
    if (pull.tx < 0 || pull.ta === 0) pull.x.jump(e.clientX - r.left + 1);
    pull.tx = e.clientX - r.left; pull.ta = 1;
  };
  const onBarOut = () => { pull.ta = 0; };
  bar2.addEventListener('pointermove', onBar); bar2.addEventListener('pointerleave', onBarOut);
  const moveThread = (dt: number) => {
    if (bar2.getBoundingClientRect().top > innerHeight) return;
    const w = bar2.offsetWidth;
    if (pull.tx >= 0) pull.x.step(pull.tx + 1, dt);
    pull.a.step(pull.ta * 100, dt);
    const a = (pull.a.x / 100) * 17, c = pull.x.x - 1, s = Math.min(150, w * 0.2);
    let dPath = 'M0 20';
    const n = Math.ceil(w / 7);
    for (let i = 1; i <= n; i++) { const x = (w * i) / n, k = (x - c) / s; dPath += `L${x.toFixed(1)} ${(20 + a * Math.exp(-k * k) * smoother(-20, 130, x) * smoother(-20, 130, w - x)).toFixed(2)}`; }
    if (dPath !== pull.drawn) { pull.drawn = dPath; thread.setAttribute('d', dPath); }
  };
  ScrollTrigger.create({ trigger: bar2, start: 'top 96%', once: true, onEnter: () => { bar2.classList.add('is-in'); gsap.delayedCall(2.2, () => bar2.classList.add('is-done')); } });

  /* ---------- soft pins ---------- */
  for (const [sec, sel] of [['[data-about]', '.about-inner'], ['[data-stack]', '.stack-inner'], ['[data-community]', '.community-inner']]) {
    const el = q(sel);
    pins.push({ el, sec, card: false, a: 0, b: 0, set: gsap.quickSetter(el, 'y', 'px') as (v: number) => void });
  }
  qa('[data-project]').forEach((el) => pins.push({ el, sec: `[data-project="${el.dataset.project}"]`, card: true, a: 0, b: 0, set: gsap.quickSetter(el, 'y', 'px') as (v: number) => void }));

  const relayout = () => {
    layout();
    groupRange = [at('[data-stack]', -0.2), at('[data-stack]', 1)];
    stepRange = [at('[data-community]', -0.12), at('[data-community]', 0.86)];
  };
  ScrollTrigger.addEventListener('refresh', relayout);
  disposers.push(() => ScrollTrigger.removeEventListener('refresh', relayout));
  relayout();
  comeBack();
  if (back) { lenis.scrollTo(scrollY, { immediate: true, force: true }); ScrollTrigger.update(); }
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  disposers.push(() => { gsap.ticker.remove(raf); lenis.destroy(); });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  if (import.meta.env.DEV) (window as any).__cq = { stage, head };

  return () => disposers.reverse().forEach((d) => d());
}
