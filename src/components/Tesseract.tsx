'use client';
import { useEffect, useRef } from 'react';

/**
 * A large 4D tesseract that spans the hero as an ambient backdrop, with the CQ
 * monogram crisp at its core. Real 4D vertex math → perspective project 4D→3D→2D.
 * Edges are depth-sorted and split front/back around the logo billboard, so the
 * cube genuinely weaves in front of and behind the mark. A radial transparency
 * dissolves the structure outward from the core, so the wireframe can sweep
 * across the headline without ever hurting legibility. Pointer tilts it; it
 * drifts on its own. Canvas (DPR-crisp), theme-aware, paused offscreen,
 * motion-safe, and pointer-transparent so it never blocks the copy or links.
 */

// 16 vertices of the hypercube: bit0=x, bit1=y, bit2=z, bit3=w (± per bit)
const V: number[][] = [];
for (let k = 0; k < 16; k++) {
  V.push([0, 1, 2, 3].map((b) => ((k >> b) & 1) ? 1 : -1));
}
// 32 edges: vertices differing in exactly one coordinate
const E: { a: number; b: number; axis: number }[] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    const x = i ^ j;
    if (x && (x & (x - 1)) === 0) E.push({ a: i, b: j, axis: Math.log2(x) }); // axis 3 = 4D connectors
  }
}

function rot(v: number[], i: number, j: number, ang: number) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const vi = v[i], vj = v[j];
  v[i] = vi * c - vj * s;
  v[j] = vi * s + vj * c;
}

export default function Tesseract() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !canvasRef.current) return;
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0;
    let colors = { red: '#DC2626', ink: '#F7ECEA' };
    function readColors() {
      const s = getComputedStyle(document.documentElement);
      colors = {
        red: (s.getPropertyValue('--red').trim() || '#DC2626'),
        ink: (s.getPropertyValue('--ink').trim() || '#F7ECEA'),
      };
    }
    readColors();
    const themeObs = new MutationObserver(readColors);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function resize() {
      const r = wrap.getBoundingClientRect();
      W = r.width; H = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const logo = new Image();
    let logoReady = false;
    logo.onload = () => { logoReady = true; };
    logo.src = '/brand/canquesse-mark-ready.webp';

    // pointer parallax (read off window so the backdrop stays pointer-transparent)
    let pTargetX = 0, pTargetY = 0, pX = 0, pY = 0;
    let aXW = 0.6, aZW = 0.2, aYZ = 0.3;
    function onMove(e: PointerEvent) {
      const r = wrap.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return; // zero-size rect → Infinity/NaN guard
      pTargetX = Math.max(-1.6, Math.min(1.6, ((e.clientX - r.left) / r.width - 0.5) * 2));
      pTargetY = Math.max(-1.6, Math.min(1.6, ((e.clientY - r.top) / r.height - 0.5) * 2));
    }
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

    type P = { x: number; y: number; z: number };
    function project(): P[] {
      const Dw = 3.3, Dz = 4.7;
      const out: P[] = [];
      for (let k = 0; k < 16; k++) {
        const v = V[k].slice();
        rot(v, 0, 3, aXW);            // XW — the 4D turn
        rot(v, 2, 3, aZW);            // ZW
        rot(v, 1, 2, aYZ);            // YZ
        rot(v, 0, 1, pX * 0.55);      // XY — pointer parallax
        rot(v, 1, 3, pY * 0.45);      // YW — pointer depth
        const kw = Dw / (Dw - v[3]);
        const x3 = v[0] * kw, y3 = v[1] * kw, z3 = v[2] * kw;
        const kz = Dz / (Dz - z3);
        out.push({ x: x3 * kz, y: y3 * kz, z: z3 });
      }
      return out;
    }

    let raf = 0, last = performance.now(), visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(wrap);

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min((now - last) / 16.67, 3); last = now;

      if (!reduce) {
        // pointer proximity feeds a gentle turbo into the 4D spin
        const boost = 1 + Math.min(1, Math.hypot(pTargetX, pTargetY)) * 0.75;
        aXW += 0.0040 * dt * boost; aZW += 0.0025 * dt * boost; aYZ += 0.0014 * dt * boost;
        pX += (pTargetX - pX) * 0.05 * dt;
        pY += (pTargetY - pY) * 0.05 * dt;
      }

      ctx.clearRect(0, 0, W, H);
      const m = Math.min(W, H);
      const cx = W * 0.5, cy = H * 0.5;
      // scale is relative to a larger canvas so the cube keeps the same on-screen
      // size while gaining generous padding — its edges never reach the canvas rim.
      const scale = m * 0.167;
      const t = now * 0.001;
      const pts = project();
      // a slow rocking of the whole projection keeps the structure weightless
      const wob = reduce ? 0 : Math.sin(t * 0.35) * 0.045;
      const cw = Math.cos(wob), sw = Math.sin(wob);
      const sp = pts.map((p) => {
        const x = p.x * scale, y = p.y * scale;
        return { sx: cx + x * cw - y * sw, sy: cy + x * sw + y * cw, z: p.z };
      });

      // radial transparency: crisp at the core, dissolving to near-zero outward,
      // so edges may cross the headline yet never reduce legibility
      const clearR = m * 0.126, fadeR = m * 0.406;
      const fade = (sx: number, sy: number) => {
        const d = Math.hypot(sx - cx, sy - cy);
        const u = Math.max(0, Math.min(1, (d - clearR) / (fadeR - clearR)));
        return 1 - (u * u * (3 - 2 * u)) * 0.95;   // 1 at core → ~0.05 at the rim
      };

      // soft, gently breathing core glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.0);
      glow.addColorStop(0, hexA(colors.red, reduce ? 0.12 : 0.09 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.8))));
      glow.addColorStop(1, hexA(colors.red, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const edges = E.map((e) => {
        const A = sp[e.a], B = sp[e.b];
        return { A, B, z: (A.z + B.z) / 2, axis: e.axis };
      }).sort((p, q) => p.z - q.z);

      const drawEdge = (ed: typeof edges[number]) => {
        const depth = Math.max(0, Math.min(1, (ed.z + 2) / 4));
        const f = fade((ed.A.sx + ed.B.sx) / 2, (ed.A.sy + ed.B.sy) / 2);
        ctx.globalAlpha = (0.16 + depth * 0.84) * f;
        ctx.lineWidth = 0.7 + depth * 1.7;
        ctx.strokeStyle = ed.axis === 3 ? colors.red : colors.ink;
        if (ed.axis === 3) {
          // the 4D connectors carry marching current
          ctx.setLineDash([5, 9]);
          ctx.lineDashOffset = reduce ? 0 : -((now * 0.022) % 14);
        } else {
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.moveTo(ed.A.sx, ed.A.sy);
        ctx.lineTo(ed.B.sx, ed.B.sy);
        ctx.stroke();
      };
      const drawNode = (p: typeof sp[number], idx: number) => {
        const depth = Math.max(0, Math.min(1, (p.z + 2) / 4));
        const f = fade(p.sx, p.sy);
        // occasional star-flare per vertex
        const flare = reduce ? 0 : Math.pow(Math.max(0, Math.sin(t * 0.8 + idx * 2.39)), 14);
        ctx.globalAlpha = Math.min(1, (0.35 + depth * 0.65) * f + flare * 0.5 * f);
        ctx.fillStyle = colors.red;
        ctx.shadowColor = colors.red;
        ctx.shadowBlur = 8 * depth * f + flare * 16;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 1.5 + depth * 2.4 + flare * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      };

      ctx.lineJoin = 'round'; ctx.lineCap = 'round';

      edges.filter((e) => e.z < 0).forEach(drawEdge);
      sp.forEach((p, i) => { if (p.z < 0) drawNode(p, i); });

      // logo core — kept perfectly crisp and undistorted; the cube revolves around it
      ctx.globalAlpha = 1;
      if (logoReady) {
        // Draw the supplied square canvas without stretching it. Its transparent
        // padding keeps the pre-masked artwork at the intended visual ratio.
        const logoBox = m * 0.247;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 26; ctx.shadowOffsetY = 12;
        ctx.drawImage(logo, cx - logoBox / 2, cy - logoBox / 2, logoBox, logoBox);
        ctx.restore();
      }

      edges.filter((e) => e.z >= 0).forEach(drawEdge);
      sp.forEach((p, i) => { if (p.z >= 0) drawNode(p, i); });

      // signal packets racing along the wireframe — data moving through the lattice
      if (!reduce) {
        ctx.setLineDash([]);
        const PER = 3.6;
        for (let k = 0; k < 3; k++) {
          const ph = t / PER + k / 3;
          const seg = Math.floor(ph);
          const raw = ph - seg;
          const s = raw * raw * (3 - 2 * raw);
          const ei = (((seg * 13 + k * 7) % E.length) + E.length) % E.length;
          const A = sp[E[ei].a], B = sp[E[ei].b];
          const px2 = A.sx + (B.sx - A.sx) * s, py2 = A.sy + (B.sy - A.sy) * s;
          if (!Number.isFinite(px2 + py2)) continue;
          const f = fade(px2, py2);
          if (!(f > 0.06)) continue; // NaN-safe
          const s0 = Math.max(0, s - 0.14);
          const qx = A.sx + (B.sx - A.sx) * s0, qy = A.sy + (B.sy - A.sy) * s0;
          const tail = ctx.createLinearGradient(qx, qy, px2, py2);
          tail.addColorStop(0, hexA(colors.red, 0));
          tail.addColorStop(1, hexA(colors.red, 0.75 * f));
          ctx.globalAlpha = 1;
          ctx.strokeStyle = tail;
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px2, py2); ctx.stroke();
          ctx.fillStyle = colors.red;
          ctx.shadowColor = colors.red;
          ctx.shadowBlur = 14 * f;
          ctx.globalAlpha = 0.95 * f;
          ctx.beginPath(); ctx.arc(px2, py2, 2.3, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      if (reduce) cancelAnimationFrame(raf);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); themeObs.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className="tess" aria-hidden="true">
      <canvas ref={canvasRef} className="tess-canvas" />
    </div>
  );
}

// "#RRGGBB" or rgb()/rgba() → rgba string with given alpha
function hexA(c: string, a: number): string {
  c = c.trim();
  if (c.startsWith('#')) {
    const n = c.slice(1);
    const f = n.length === 3 ? n.split('').map((x) => x + x).join('') : n;
    const r = parseInt(f.slice(0, 2), 16), g = parseInt(f.slice(2, 4), 16), b = parseInt(f.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  if (c.startsWith('rgb')) return c.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
    const parts = inner.split(',').slice(0, 3).map((x: string) => x.trim());
    return `rgba(${parts.join(',')},${a})`;
  });
  return `rgba(254,72,83,${a})`;
}
