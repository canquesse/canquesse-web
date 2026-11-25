/**
 * Motion maths shared by the whole page.
 *
 *  Playhead — the one clock. A critically damped spring follows the scroll position, so velocity is
 *             continuous: nothing on the page can start or stop with a jerk, and nothing overshoots.
 *  Curve    — monotone cubic through any number of keys (Fritsch–Carlson). Passing through a key
 *             never changes direction abruptly, holding between two equal keys is perfectly still.
 */

export class Playhead {
  x = -1; v = 0;
  constructor(private omega: number) {}
  jump(x: number) { this.x = x; this.v = 0; }
  step(target: number, dt: number) {
    if (this.x < 0) { this.jump(target); return; }
    // exact solution of x'' = w²(target − x) − 2w x', so it is stable at any frame rate
    const w = this.omega, d = this.x - target, k = this.v + w * d, e = Math.exp(-w * dt);
    this.x = target + (d + k * dt) * e;
    this.v = (this.v - w * k * dt) * e;
    if (Math.abs(this.x - target) < 0.01 && Math.abs(this.v) < 0.05) this.jump(target);
  }
}

/** where the playhead is heading: takes out most of its lag at speed, never overshoots a stop */
export const ahead = (p: Playhead, omega: number) => p.x + (p.v * 0.72) / omega;

export class Curve {
  private m: number[];
  constructor(private x: number[], private y: number[]) {
    const n = x.length;
    const d: number[] = [];
    for (let i = 0; i < n - 1; i++) d.push((y[i + 1] - y[i]) / Math.max(1e-6, x[i + 1] - x[i]));
    this.m = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) continue;
      const h0 = x[i] - x[i - 1], h1 = x[i + 1] - x[i];
      const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
      this.m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
    // the ends stay at zero slope: every run eases in and out
  }
  at(x: number): number {
    const X = this.x, Y = this.y, n = X.length;
    if (n === 1 || x <= X[0]) return Y[0];
    if (x >= X[n - 1]) return Y[n - 1];
    let i = 0;
    while (x > X[i + 1]) i++;
    const h = X[i + 1] - X[i], t = (x - X[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h * this.m[i] + (3 * t2 - 2 * t3) * Y[i + 1] + (t3 - t2) * h * this.m[i + 1];
  }
}

/** smooth maximum of d and 0: how far something still is from its resting place, without a corner */
export const soften = (d: number, width: number) => (d + Math.sqrt(d * d + width * width)) / 2 - Math.max(d, 0);

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoother = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
