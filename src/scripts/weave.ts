/**
 * The community scene: many separate strips, woven into one cloth.
 * The over/under pattern is the drawing. It is a kilim: stepped diamonds, made only by which
 * strip passes on top. It is made the way it is made on a loom: the warp is strung first, then one
 * weft after the other is shot through it, from alternating sides. Later it is pulled out again.
 */
import * as THREE from 'three';
import { clamp01, smoother } from './score';

const WARP = 19, WEFT = 19, PITCH = 0.5, WIDTH = 0.43, LIFT = 0.075, THICK = 0.028, SUB = 12, FRINGE = 0.55;

const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

/** does the warp strip i pass over the weft strip j? */
const over = (i: number, j: number) => {
  const c = (WARP - 1) / 2;
  const d = Math.abs(i - c) + Math.abs(j - c);
  return d % 6 < 3;
};

const profile: Array<[number, number, number, number]> = [
  [-1, 0, -1, 0], [-0.94, 0.8, -0.6, 0.8], [-0.8, 1, -0.15, 1], [0, 1.15, 0, 1], [0.8, 1, 0.15, 1], [0.94, 0.8, 0.6, 0.8],
  [1, 0, 1, 0], [0.94, -0.8, 0.6, -0.8], [0.8, -1, 0.1, -1], [-0.8, -1, -0.1, -1], [-0.94, -0.8, -0.6, -0.8],
];

function strip(index: number, isWarp: boolean) {
  const flip = index % 2 === 1; // neighbours enter from opposite edges
  const n = isWarp ? WEFT : WARP;
  const span = (n - 1) * PITCH;
  const total = span + FRINGE * 2;
  const seg = (n + 1) * SUB;
  const M = profile.length;
  const pos: number[] = [], nor: number[] = [], col: number[] = [], t: number[] = [], idx: number[] = [];
  const level = (k: number) => {
    const j = Math.min(n - 1, Math.max(0, k));
    const up = isWarp ? over(index, j) : !over(j, index);
    return up ? 1 : -1;
  };
  const height = (d: number) => {
    const g = (d - FRINGE) / PITCH;
    const k = Math.floor(g), f = g - k;
    const s = f * f * f * (f * (f * 6 - 15) + 10);
    return level(k) + (level(k + 1) - level(k)) * s;
  };
  const cross = ((isWarp ? WARP : WEFT) - 1) / 2;
  const at = (index - cross) * PITCH;
  for (let s = 0; s <= seg; s++) {
    const d = (s / seg) * total, e = 0.01;
    const z = height(d) * LIFT;
    const slope = ((height(d + e) - height(d - e)) * LIFT) / (2 * e);
    const l = Math.hypot(1, slope);
    const along = d - total / 2;
    const shade = 0.6 + 0.4 * (0.5 + 0.5 * height(d));
    for (const [x, y, nx, ny] of profile) {
      const a = at + (x * WIDTH) / 2, off = y * THICK;
      const zz = z + (off * 1) / l, al = along - (off * slope) / l;
      if (isWarp) { pos.push(a, al, zz); nor.push(nx, (-slope / l) * ny, ny / l); } else { pos.push(al, a, zz); nor.push((-slope / l) * ny, nx, ny / l); }
      col.push(shade, shade, shade); t.push(flip ? 1 - s / seg : s / seg);
    }
  }
  for (let s = 0; s < seg; s++) for (let j = 0; j < M; j++) {
    const a = s * M + j, b = s * M + ((j + 1) % M), c = a + M, d = b + M;
    if (isWarp) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
  g.setIndex(idx);
  return g;
}

export function createWeave() {
  const group = new THREE.Group();
  const bands: Array<{ order: number; span: number; u: { uFrom: { value: number }; uTo: { value: number } } }> = [];
  const weftColours = ['#7a0e16', '#7a0e16', '#f3654b', '#7a0e16', '#4d060d', '#7a0e16', '#f3654b', '#7a0e16', '#7a0e16', '#4d060d'];
  const clipVertex = (src: string) => src.replace('#include <common>', '#include <common>\nattribute float aT; varying float vT;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvT = aT;');
  const clipFragment = (src: string) => src.replace('#include <common>', '#include <common>\nvarying float vT; uniform float uFrom, uTo;').replace('void main() {', 'void main() {\nif (vT > uTo || vT < uFrom) discard;');
  const add = (index: number, isWarp: boolean) => {
    const n = isWarp ? WARP : WEFT;
    const c = (n - 1) / 2;
    const colour = isWarp ? (index % 6 === 0 ? '#e9b79b' : '#fff0e6') : weftColours[Math.abs(index - c) % weftColours.length];
    const u = { uFrom: { value: 0 }, uTo: { value: 0 } };
    const mat = new THREE.MeshPhysicalMaterial({ color: colour, vertexColors: true, metalness: isWarp ? 0.12 : 0.2, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 0.8, side: THREE.DoubleSide });
    mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, u); sh.vertexShader = clipVertex(sh.vertexShader); sh.fragmentShader = clipFragment(sh.fragmentShader); };
    mat.customProgramCacheKey = () => 'weave';
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, u); sh.vertexShader = clipVertex(sh.vertexShader); sh.fragmentShader = clipFragment(sh.fragmentShader); };
    depth.customProgramCacheKey = () => 'weave-depth';
    const mesh = new THREE.Mesh(strip(index, isWarp), mat);
    mesh.customDepthMaterial = depth;
    mesh.castShadow = true; mesh.frustumCulled = false;
    group.add(mesh);
    // the warp from the middle outwards, then the weft row by row
    bands.push(isWarp ? { order: (Math.abs(index - c) / c) * 0.16, span: 0.18, u } : { order: 0.27 + ((n - 1 - index) / (n - 1)) * 0.56, span: 0.17, u });
  };
  for (let i = 0; i < WARP; i++) add(i, true);
  for (let j = 0; j < WEFT; j++) add(j, false);

  return {
    group,
    /** 0 nothing, 1 woven, 2 pulled out again */
    set(p: number) {
      group.visible = p > 0.001 && p < 1.999;
      if (!group.visible) return;
      const inn = clamp01(p), out = clamp01(p - 1);
      for (const b of bands) {
        b.u.uTo.value = ease((inn - b.order) / b.span) * 1.001;
        b.u.uFrom.value = smoother(b.order * 0.8, b.order * 0.8 + 0.3, out) * 1.001;
      }
    },
    dispose() { group.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); m.customDepthMaterial?.dispose(); } }); },
  };
}
