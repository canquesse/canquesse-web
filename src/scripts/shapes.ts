/**
 * The two things the strip can be:
 *
 *  - `cq`    the monogram, a closed composition of its own
 *  - `track` one long strip that exists as a whole: a swell, a loop, then a coil that tightens into
 *            a spool and narrows into a slim helix. Nothing on it ever changes shape. The camera
 *            travels along it, so every "transition" is real geometry passing by and no turn can
 *            ever pinch, pop or intersect itself.
 *
 * Both are baked to samples at equal arc length with the direction the strip is wide in (a).
 */
/** rows of the visible window and the distance between them: fine enough that no edge shows a corner */
export const N = 1793;
export const DS = 0.0625;

export interface Baked { p: Float32Array; a: Float32Array; w: Float32Array; count: number; ds: number }
export type FormName = 'cq' | 'track';

type V3 = [number, number, number];
interface Raw { p: V3; a: V3; w: number }

const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
/** integral of `smooth`: ramps a rotation rate in and out without a corner */
const smoothInt = (a: number, b: number, x: number) => {
  if (x <= a) return 0;
  const t = clamp01((x - a) / (b - a));
  return (b - a) * (t ** 6 - 3 * t ** 5 + 2.5 * t ** 4) + Math.max(0, x - b);
};
const norm = (v: V3): V3 => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** uniform cubic B-spline: curvature-continuous, so reflections never break along the strip */
function bspline(keys: number[][], u: number): number[] {
  const n = keys.length - 1;
  const x = u * n;
  const i = Math.min(n - 1, Math.floor(x));
  const t = x - i;
  const at = (k: number) => {
    if (k < 0) return keys[0].map((v, d) => 2 * v - keys[1][d]);
    if (k > n) return keys[n].map((v, d) => 2 * v - keys[n - 1][d]);
    return keys[k];
  };
  const b = [(1 - t) ** 3 / 6, (3 * t ** 3 - 6 * t ** 2 + 4) / 6, (-3 * t ** 3 + 3 * t ** 2 + 3 * t + 1) / 6, t ** 3 / 6];
  const k = [at(i - 1), at(i), at(i + 1), at(i + 2)];
  return keys[0].map((_, d) => b[0] * k[0][d] + b[1] * k[1][d] + b[2] * k[2][d] + b[3] * k[3][d]);
}

/** sample densely, then redistribute by arc length into `count` samples (or one every `ds`) */
function bake(fn: (u: number) => Raw, dense: number, opts: { count?: number; ds?: number }): Baked & { len: Float64Array } {
  const raw: Raw[] = [];
  const len = new Float64Array(dense + 1);
  for (let i = 0; i <= dense; i++) {
    raw.push(fn(i / dense));
    if (i) len[i] = len[i - 1] + Math.hypot(raw[i].p[0] - raw[i - 1].p[0], raw[i].p[1] - raw[i - 1].p[1], raw[i].p[2] - raw[i - 1].p[2]);
  }
  const total = len[dense];
  const count = opts.count ?? Math.floor(total / opts.ds!) + 1;
  const ds = opts.ds ?? total / (count - 1);
  const out = { p: new Float32Array(count * 3), a: new Float32Array(count * 3), w: new Float32Array(count), count, ds, len };
  let j = 0;
  for (let i = 0; i < count; i++) {
    const target = Math.min(total, i * ds);
    while (j < dense - 1 && len[j + 1] < target) j++;
    const t = (target - len[j]) / (len[j + 1] - len[j] || 1);
    const A = raw[j], B = raw[j + 1];
    for (let d = 0; d < 3; d++) {
      out.p[i * 3 + d] = A.p[d] + (B.p[d] - A.p[d]) * t;
      out.a[i * 3 + d] = A.a[d] + (B.a[d] - A.a[d]) * t;
    }
    out.w[i] = A.w + (B.w - A.w) * t;
  }
  return out;
}

/* ---------- the monogram ----------
 * One stroke: C, into the bowl of the Q, out through its tail.
 * x, y = pixels of the reference photo, z = depth, tilt in degrees (90 = the strip stands on
 * edge, above 90 its inside opens to the viewer, below 90 its outside), width */
const CQ: number[][] = [
  [838, 208, .30, 128, .9], [780, 120, .24, 128, .96], [650, 58, .08, 126, 1.02], [500, 40, -.10, 122, 1.06], [340, 84, -.20, 120, 1.12],
  [205, 196, -.18, 124, 1.2], [112, 350, -.02, 132, 1.3], [100, 520, .16, 136, 1.28], [176, 668, .28, 130, 1.14],
  [320, 742, .30, 116, 1], [480, 738, .18, 106, .98], [640, 774, -.12, 104, 1], [810, 856, -.46, 112, 1.06], [1000, 866, -.58, 124, 1.12],
  [1160, 764, -.46, 128, 1.1], [1226, 600, -.24, 114, 1.06], [1164, 440, -.06, 82, 1.04], [1010, 342, .04, 60, 1.06],
  [840, 330, .10, 60, 1.06], [676, 390, .20, 74, 1.06], [574, 508, .36, 104, 1.04], [580, 630, .62, 120, 1.04],
  [690, 692, .92, 112, 1.02], [826, 738, 1.08, 104, 1.06], [966, 812, 1.04, 98, 1.16], [1112, 892, .86, 100, 1.12], [1262, 946, .62, 104, .9],
  [1404, 962, .42, 106, .54], [1540, 924, .30, 108, .06],
];
/** the middle of the C's counter: the camera leaves the hero through this point */
export const C_HOLE: V3 = [-2.62, 0.72, 0];

const cq: Baked = (() => {
  const S = 1 / 150;
  const pos = (u: number): V3 => { const k = bspline(CQ, u); return [(k[0] - 800) * S, (510 - k[1]) * S, k[2] * 1.35]; };
  return bake((u) => {
    const k = bspline(CQ, u);
    const e = 0.0015;
    const p0 = pos(Math.max(0, u - e)), p1 = pos(Math.min(1, u + e));
    const tx = p1[0] - p0[0], ty = p1[1] - p0[1], l = Math.hypot(tx, ty) || 1;
    const th = (k[3] * Math.PI) / 180;
    return { p: pos(u), a: [(ty / l) * Math.cos(th), (-tx / l) * Math.cos(th), -Math.sin(th)], w: Math.max(0.04, k[4]) };
  }, 3000, { count: N });
})();

/* ---------- the track ----------
 * q runs along the x axis. Landmarks the cues refer to: */
export const TRACK = { swell: -4, loop: 18.2, word: 86, spool: 138, helix: 186, end: 250 };
const Q0 = -62, Q1 = TRACK.end;
export const TRACK_WIDTH = 1.28;
const R_WORD = 3.35, R_SPOOL = 3.0, R_HELIX = 1.5;
const K0 = 0.73;

export const trackRadius = (q: number) => R_WORD + (R_SPOOL - R_WORD) * smooth(108, 124, q) + (R_HELIX - R_SPOOL) * smooth(150, 174, q);
/** winding angle: the rate is ramped, so the coil starts and tightens without a corner */
export const trackAngle = (q: number) => K0 + TAU * (smoothInt(50, 66, q) / 5.7 + smoothInt(106, 124, q) * (1 / 3.45 - 1 / 5.7) + smoothInt(152, 174, q) * (1 / 3.05 - 1 / 3.45));

const track = (() => {
  const at = (u: number): Raw => {
    const q = Q0 + (Q1 - Q0) * u;
    // swell
    const x = q + 4;
    const g = 1 - smooth(0, 11, q);
    let px = q, py = g * (Math.sin(x * 0.36 + 0.4) * 1.9 - x * 0.06), pz = g * Math.cos(x * 0.36 + 1.1) * 1.6;
    // loop
    // (a full round turn: its tightest radius is twice the half width of the strip)
    const k = smooth(7.2, 29.2, q) * TAU;
    px += Math.sin(k) * 4.5; py += (1 - Math.cos(k)) * 2.75; pz += 4.2 * (k / TAU - 0.5) * smooth(-2, 10, q) * (1 - smooth(27, 44, q));
    // onto the cylinder: parallel to its axis first, then winding
    const c = smooth(32, 52, q);
    const kq = trackAngle(q), r = trackRadius(q);
    const radial: V3 = [0, Math.sin(kq), Math.cos(kq)];
    py += (radial[1] * r - py) * c; pz += (radial[2] * r - pz) * c;
    const flat = lerp3([0.16, 0.74, -0.66 - 0.2 * Math.sin(x * 0.36)], [0.22, 0.4, -0.9], smooth(-2, 12, q));
    const e = 0.02;
    const a1 = trackAngle(q + e), r1 = trackRadius(q + e), a0 = trackAngle(q - e), r0 = trackRadius(q - e);
    const t = norm([2 * e, Math.sin(a1) * r1 - Math.sin(a0) * r0, Math.cos(a1) * r1 - Math.cos(a0) * r0]);
    const wound: V3 = [radial[1] * t[2] - radial[2] * t[1], radial[2] * t[0], -radial[1] * t[0]];
    return { p: [px, py, pz], a: norm(lerp3(norm(flat), norm(wound), smooth(34, 50, q))), w: TRACK_WIDTH };
  };
  const b = bake(at, 40000, { ds: DS });
  // a light gaussian pass makes the whole run curvature-continuous
  const blur = (buf: Float32Array, rad: number) => {
    const src = buf.slice(), ker: number[] = [];
    let sum = 0;
    for (let i = -rad; i <= rad; i++) { const v = Math.exp(-(i * i) / (rad * rad * 0.32)); ker.push(v); sum += v; }
    for (let i = rad; i < b.count - rad; i++) for (let d = 0; d < 3; d++) {
      let v = 0;
      for (let k = -rad; k <= rad; k++) v += src[(i + k) * 3 + d] * ker[k + rad];
      buf[i * 3 + d] = v / sum;
    }
  };
  blur(b.p, Math.round(1 / DS)); blur(b.a, Math.round(1.6 / DS));
  return b;
})();

/** arc length on the track at landmark q */
export function trackS(q: number): number {
  const u = clamp01((q - Q0) / (Q1 - Q0)) * (track.len.length - 1);
  const i = Math.min(track.len.length - 2, Math.floor(u));
  return track.len[i] + (track.len[i + 1] - track.len[i]) * (u - i);
}
export const getForm = (name: FormName): Baked => (name === 'cq' ? cq : track);
