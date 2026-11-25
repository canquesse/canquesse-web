/**
 * The stage: one strip of lacquer, rendered for real (three.js), living in a single fixed canvas.
 *
 *  - the CQ is the sculpture (sculpture.ts); the rest of the page is one strip, a window onto the
 *    long track (shapes.ts). If the model cannot load, the strip draws the CQ itself
 *  - a pose says which point of it is in focus, where that point sits on screen, how large and how
 *    turned. Poses come from keys through one smooth curve per field (score.ts)
 *  - the strip has drag: points far from the focus turn a little later, so it bends while it
 *    accelerates and settles when it stops. The bend is bounded (FLEX): travel, scale and spin are
 *    rigid and only turning flexes, so at any scroll speed the coils keep their distance
 *  - as glass it refracts the page's own headline ([data-refract] words are copied into a texture)
 *  - the wordmark stands inside the coil as a real object
 */
import * as THREE from 'three';
import { DS, getForm, N, TRACK, TRACK_WIDTH, trackS, type FormName } from './shapes';
import { Curve, smoother } from './score';
import { createWeave } from './weave';
import { loadBridge } from './bridge';
import { COAT, DAYLIGHT, loadBands, loadSculpture, type Sculpture } from './sculpture';

const DEFAULTS = {
  /** the point in focus, in the strip's own space (x is the landmark q on the track) */
  q: 0, fy: 0, fz: 0,
  /** where it sits: offset from the screen centre as a fraction of the visible width / height */
  px: 0, py: 0,
  /** log of the scale */
  ls: 0,
  rx: 0, ry: 0, rz: 0,
  /** rotation around the strip's own long axis */
  spin: 0,
  glass: 0, text: 0,
  /** how much of the strip is drawn */
  head: 1,
  show: 1,
  /** 1 = the strip is a flat field of page red */
  flat: 0,
  /** how far the wordmark is filled */
  fill: 0,
};
export type State = typeof DEFAULTS;
export type Pose = Partial<Omit<State, 'ls'>> & { s?: number };
export interface Run { form: FormName; keys: Array<{ y: number; pose: Pose }> }
const FIELDS = Object.keys(DEFAULTS) as Array<keyof State>;
const F = FIELDS.length;
const ix = Object.fromEntries(FIELDS.map((f, i) => [f, i])) as Record<keyof State, number>;

const HALF = 0.62, THICK = 0.085, VIEW = 10, FOV = 28;
const CAM_Z = VIEW / 2 / Math.tan((FOV * Math.PI) / 360);
/** most the far end may trail behind a turn, in radians */
const FLEX = { track: 0.07, cq: 0.15 };
const LAG_MAX = 0.2, LAG_PER_UNIT = 0.013, BINS = 12;

/* cross-section: [across, side, normal across, normal out] — a softly pillowed bar with a round rim */
const profile: Array<[number, number, number, number]> = (() => {
  const out: Array<[number, number, number, number]> = [];
  const top: typeof out = [];
  const cols = 11;
  for (let i = 0; i < cols; i++) { const x = -0.955 + (1.91 * i) / (cols - 1); top.push([x, 1, x * 0.2, 1]); }
  const rim = (dir: 1 | -1): typeof out => [60, 30, 0, -30, -60].map((d) => {
    const r = (d * Math.PI) / 180;
    return [dir * (0.955 + 0.045 * Math.cos(r)), dir * Math.sin(r) * dir, dir * Math.cos(r), Math.sin(r)];
  });
  out.push(...top, ...rim(1));
  for (let i = cols - 1; i >= 0; i--) { const x = top[i][0]; out.push([x, -1, x * 0.2, -1]); }
  out.push(...rim(-1).reverse());
  return out;
})();
const M = profile.length;

const NOISE = /* glsl */ `
  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
`;

function studio(renderer: THREE.WebGLRenderer) {
  const room = new THREE.Scene();
  room.background = new THREE.Color('#7a4a43');
  // feathered light: a hard-edged panel shows up as a hard line on the curved metal
  const fc = document.createElement('canvas'); fc.width = fc.height = 96;
  const fx = fc.getContext('2d')!, img = fx.createImageData(96, 96);
  for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) {
    const e = (v: number) => smoother(0, 0.34, Math.min(v, 95 - v) / 95);
    const a = 255 * e(x) * e(y), i = (y * 96 + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = a; img.data[i + 3] = 255;
  }
  fx.putImageData(img, 0, 0);
  const feather = new THREE.CanvasTexture(fc);
  const panel = (pos: V3, size: [number, number], color: string, k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size[0] * 1.3, size[1] * 1.3), new THREE.MeshBasicMaterial({ alphaMap: feather, transparent: true, depthWrite: false, color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(...pos); m.lookAt(0, 0, 0); room.add(m);
  };
  type V3 = [number, number, number];
  panel([-4, 5, 4], [7, 2.6], '#fff6ee', 6.2);   // key strip, upper left
  panel([5, 1.6, 4], [1.6, 7], '#ffe9dc', 5.2);  // tall strip, right
  panel([0, 7, -1], [12, 4], '#fff2e8', 1.7);    // sky
  panel([0, -6, 2], [12, 5], '#f08a72', .75);    // warm bounce from the floor
  panel([-6, -.6, 1], [1.2, 6], '#ffd9c8', 3.4); // left edge light
  panel([1.5, .8, 7], [5, 1.1], '#fff', .55);    // soft frontal bar
  panel([-1.5, -1.6, 6.5], [7, .9], '#2c020a', 1); // black flag, gives the lacquer its contrast
  panel([3.2, 3.4, 5.6], [.7, 5], '#2c020a', 1);
  panel([0, 0, -7], [14, 5], '#4a0c12', 1);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(room, 0.035, 0.1, 40);
  room.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
  pm.dispose();
  return rt.texture;
}

function stripTexture(text: string) {
  const c = document.createElement('canvas');
  const h = 160;
  const ctx = c.getContext('2d')!;
  const font = `500 ${Math.round(h * 0.6)}px "Geist Mono", monospace`;
  ctx.font = font;
  c.width = Math.min(8192, Math.ceil(ctx.measureText(text).width)); c.height = h;
  ctx.font = font; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, h * 0.53, c.width);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return { texture: t, aspect: c.width / h };
}

export function createStage(canvas: HTMLCanvasElement, opts: { marquee: string; wordmark: string }) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.environment = studio(renderer);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 60);
  camera.position.z = CAM_Z;

  const sun = new THREE.DirectionalLight('#fff1e6', 1.5);
  sun.position.set(-4, 7, 13);
  sun.castShadow = true;
  sun.shadow.mapSize.set(768, 768);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 9, bottom: -9, near: 1, far: 34 });
  sun.shadow.radius = 16; sun.shadow.blurSamples = 25; sun.shadow.bias = -0.0006;
  scene.add(sun);

  const shadowMat = new THREE.ShadowMaterial({ color: '#5a0a10', opacity: 0.26, depthWrite: false });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), shadowMat);
  wall.position.z = -4.1; wall.receiveShadow = true; wall.renderOrder = -2;
  scene.add(wall);

  /* ---------- strip geometry ---------- */
  // The processor only places the rows (centre, width direction, width); the cross-section is built in
  // the vertex shader from that table, so the strip can be as fine as it needs to be.
  const geo = new THREE.BufferGeometry();
  const V = N * M + 2 * (M + 1);
  const pos = new Float32Array(V * 3), nor = new Float32Array(V * 3), q = new Float32Array(V * 2), uu = new Float32Array(V);
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const k = i * M + j, [x, y, cx, cy] = profile[j];
    // position: across, side, which end it caps (0 = none). normal: the cross-section's normal
    pos.set([x, y, 0], k * 3); nor.set([cx, cy, 0], k * 3); q.set([x, y], k * 2); uu[k] = i / (N - 1);
  }
  for (let c = 0; c < 2; c++) for (let j = 0; j <= M; j++) {
    const k = N * M + c * (M + 1) + j;
    pos.set([j === M ? 0 : profile[j][0], j === M ? 0 : profile[j][1], c ? 1 : -1], k * 3); q.set([1, 0], k * 2); uu[k] = c;
  }
  const idx: number[] = [];
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < M; j++) {
    const a = i * M + j, b = i * M + ((j + 1) % M), c = a + M, d = b + M;
    idx.push(a, c, b, b, c, d);
  }
  for (let c = 0; c < 2; c++) for (let j = 0; j < M; j++) {
    const o = N * M + c * (M + 1), k = (j + 1) % M;
    if (c === 0) idx.push(o + M, o + j, o + k); else idx.push(o + M, o + k, o + j);
  }
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('aQ', new THREE.BufferAttribute(q, 2)); geo.setAttribute('aU', new THREE.BufferAttribute(uu, 1));
  const rows = new Float32Array(N * 2 * 4);
  const rowTex = new THREE.DataTexture(rows, N, 2, THREE.RGBAFormat, THREE.FloatType);
  rowTex.needsUpdate = true;
  const rowU = { uRows: { value: rowTex }, uUnit: { value: 1 } };
  const STRIP = /* glsl */ `
    attribute float aU; uniform highp sampler2D uRows; uniform float uUnit;
    vec3 sPos, sNor, sAcr;
    void strip(){
      int i = int(aU * ${(N - 1).toFixed(1)} + .5);
      vec4 r = texelFetch(uRows, ivec2(i, 0), 0);
      vec3 t = normalize(texelFetch(uRows, ivec2(min(i + 1, ${N - 1}), 0), 0).xyz - texelFetch(uRows, ivec2(max(i - 1, 0), 0), 0).xyz);
      vec3 a = texelFetch(uRows, ivec2(i, 1), 0).xyz;
      sAcr = normalize(a - t * dot(a, t));
      vec3 n = cross(t, sAcr);
      float th = ${THICK} * uUnit * min(1., .25 + r.w / uUnit);
      // very slight pillow: the middle of each face stands a little proud of its rim
      float lift = abs(position.y) > .999 ? 1. + .22 * (1. - position.x * position.x) : 1.;
      sPos = r.xyz + sAcr * position.x * ${HALF} * r.w + n * position.y * th * lift;
      sNor = abs(position.z) > .5 ? t * position.z : normalize(sAcr * normal.x + n * normal.y);
    }`;

  /* ---------- material ---------- */
  const strip = stripTexture(opts.marquee);
  const uniforms = {
    uGlass: { value: 0 }, uTint: { value: 0 }, uText: { value: 0 }, uTextShift: { value: 0 }, uTextDensity: { value: 1 / (strip.aspect * HALF * 1.16 * TRACK_WIDTH) }, uS0: { value: 0 }, uLen: { value: 30 }, uFlat: { value: 0 }, uFlatColor: { value: new THREE.Color('#C9231F') },
    uBg: { value: new THREE.Color('#faf0eb') }, uRes: { value: new THREE.Vector2(1, 1) },
    uPage: { value: null as THREE.Texture | null }, uBack: { value: null as THREE.Texture | null }, uStrip: { value: strip.texture },
    uRed: { value: new THREE.Color('#c4161a') }, uDeep: { value: new THREE.Color('#7d0710') },
    uGold: { value: new THREE.Color('#d9a58c') }, uPale: { value: new THREE.Color('#f7dcca') },
    uAspect: { value: 1.6 },
    uBands: { value: 0 }, uRedT: { value: null as THREE.Texture | null }, uGoldT: { value: null as THREE.Texture | null }, uRedN: { value: null as THREE.Texture | null }, uGoldN: { value: null as THREE.Texture | null },
  };
  const mat = new THREE.MeshPhysicalMaterial({ color: '#fff', metalness: 0.3, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms, rowU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec2 aQ; ${STRIP}
        varying vec3 vAcr; varying vec2 vQ; varying float vU;`)
      .replace('#include <beginnormal_vertex>', 'strip(); vec3 objectNormal = sNor;')
      .replace('#include <begin_vertex>', `vec3 transformed = sPos;
        vAcr = normalize(normalMatrix * sAcr); vQ = aQ; vU = aU;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vAcr; varying vec2 vQ; varying float vU;
        uniform float uGlass, uTint, uText, uTextShift, uTextDensity, uS0, uLen, uFlat, uAspect; uniform vec3 uFlatColor;
        uniform vec3 uBg, uRed, uDeep, uGold, uPale; uniform vec2 uRes;
        uniform sampler2D uPage, uBack, uStrip;
        ${NOISE}
        uniform float uBands; uniform sampler2D uRedT, uGoldT, uRedN, uGoldN;
        float gRim, gFront, gBrush, gMix;
        ${DAYLIGHT}
        // the model's surface in strip coordinates; two offset reads, woven by slow noise, hide the repeat
        const vec2 RED_S = vec2(8.27, 1.11), GOLD_S = vec2(5.34, .70);
        vec2 bandUv(vec2 size, float s, float which){
          return which < .5 ? vec2(s / size.x, vQ.x * ${(HALF * TRACK_WIDTH).toFixed(4)} / size.y + .5) : vec2(s / size.x * .83 + .41, .5 - vQ.x * ${(HALF * TRACK_WIDTH).toFixed(4)} / size.y);
        }
        vec4 band(sampler2D t, vec2 size, float s){ 
          // the thin rim is polished: the same metal, without the grain
          float lod = gRim * 4.5;
          return mix(texture2D(t, bandUv(size, s, 0.), lod), texture2D(t, bandUv(size, s, 1.), lod), gMix); }
        vec3 pageAt(vec2 uv){ vec4 t = texture2D(uPage, uv); return mix(uBg, t.rgb / max(t.a, .001), t.a); }
        vec3 filmic(vec3 x){ return clamp((x*(2.35*x+.04))/(x*(2.25*x+.55)+.12), 0., 1.); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        gRim = smoothstep(.938, .95, abs(vQ.x));
        gFront = smoothstep(-.3, .3, vQ.y);
        float vS = uS0 + vU * uLen;
        float bw = fwidth(vQ.x) * 90.;
        gBrush = mix(vn(vec2(vS * 5.3, vQ.x * 90.)) * .6 + vn(vec2(vS * 1.7, vQ.x * 210.)) * .4, .5, clamp(bw - .4, 0., 1.));
        float mottle = vn(vec2(vS * .72, vQ.x * 2.2));
        vec3 lac = mix(uDeep, uRed, .62 + .38 * mottle) * (.94 + .12 * gBrush);
        vec3 gold = uGold * (.82 + .36 * gBrush);
        vec3 pale = uPale * (.9 + .18 * gBrush);
        gMix = smoothstep(.42, .58, vn(vec2(vS * .31, 3.7)));
        if (uBands > .001) {
          // the shade of the scan, at the same daylight as the sculpture
          lac = mix(lac, daylight(band(uRedT, RED_S, vS).rgb, 0.), uBands);
          gold = mix(gold, daylight(band(uGoldT, GOLD_S, vS).rgb, 1.), uBands);
        }
        vec3 face = mix(lac, pale, uTint);
        vec3 back = mix(gold, mix(gold, lac, .75), uTint);
        vec3 ink = mix(vec3(1., .86, .78), uDeep, uTint);
        if (uText > .001) {
          vec2 tuv = vec2(vS * uTextDensity + uTextShift, vQ.x * .86 + .5);
          float ta = texture2D(uStrip, tuv).a * step(0., tuv.y) * step(tuv.y, 1.);
          face = mix(face, ink, ta * uText);
        }
        diffuseColor.rgb = mix(mix(back, face, gFront), gold * mix(1.12, 1.22, uBands), gRim);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.), uGlass * .9);`)
      .replace('#include <roughnessmap_fragment>', `
        float metalMask = max(gRim, (1. - gFront) * (1. - uTint * .7));
        float roughnessFactor = mix(.34 + .22 * gBrush, .22 + .34 * gBrush, metalMask);
        roughnessFactor = mix(roughnessFactor, mix(.31, .24, gRim), uBands);
        roughnessFactor = mix(roughnessFactor, .06, uGlass);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (uBands > .001 && abs(vQ.y) > .5) {
          vec2 rn = band(uRedN, RED_S, uS0 + vU * uLen).xy * 2. - 1., gn = band(uGoldN, GOLD_S, uS0 + vU * uLen).xy * 2. - 1.;
          vec2 bn = mix(gn, rn, gFront) * .8 * uBands * (1. - uGlass);
          vec3 A = normalize(vAcr - normal * dot(vAcr, normal));
          normal = normalize(normal + cross(A, normal) * bn.x + A * bn.y);
        }`)
      .replace('#include <metalnessmap_fragment>', `
        float metalnessFactor = mix(.42, .95, max(metalMask, uTint * .55));
        metalnessFactor = mix(metalnessFactor, mix(.46, .82, metalMask), uBands);
        metalnessFactor = mix(metalnessFactor, 0., uGlass);`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
        // bare brushed metal has no lacquer coat
        material.clearcoat *= 1. - metalMask * .88 * (1. - uGlass) * (1. - uBands);`)
      .replace('#include <opaque_fragment>', `
        outgoingLight = filmic(outgoingLight * 1.02);
        outgoingLight = mix(outgoingLight, max(outgoingLight, gold * .46), gRim * (1. - uGlass));
        if (uGlass > .001) {
          vec2 suv = gl_FragCoord.xy / uRes;
          vec3 nv = normalize(normal + vAcr * (pow(abs(vQ.x), 2.6) * sign(vQ.x)) * 1.05);
          vec2 off = -nv.xy * vec2(1. / uAspect, 1.) * .034;
          vec3 bent = vec3(pageAt(suv + off * .9).r, pageAt(suv + off).g, pageAt(suv + off * 1.12).b);
          vec4 inner = texture2D(uBack, suv + off * .55);
          bent *= mix(vec3(1.), inner.rgb, inner.a);
          float fres = pow(1. - clamp(abs(dot(normalize(vViewPosition), nv)), 0., 1.), 2.4);
          vec3 body = mix(vec3(1., .945, .93), vec3(.74, .07, .09), clamp(fres * 1.05 + gRim * .5 + pow(abs(vQ.x), 6.) * .25, 0., .9));
          vec3 spec = filmic((totalSpecular * 1.1 + clearcoatSpecularDirect + clearcoatSpecularIndirect * 1.4) * .62);
          vec3 irid = .5 + .5 * cos(6.283 * (fres * 1.3 + (uS0 + vU * uLen) * .085 + vec3(0., .33, .67)));
          vec3 glass = bent * body + spec + irid * fres * .16;
          outgoingLight = mix(outgoingLight, glass, uGlass);
        }
        outgoingLight = mix(outgoingLight, uFlatColor, uFlat);
        #include <opaque_fragment>`);
  };
  const mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material> = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.frustumCulled = false;
  const meshDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  meshDepth.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, rowU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\n${STRIP}`).replace('#include <begin_vertex>', 'strip(); vec3 transformed = sPos;');
  };
  meshDepth.customProgramCacheKey = () => 'strip-depth';
  mesh.customDepthMaterial = meshDepth;
  scene.add(mesh);
  let sculpture: Sculpture | null = null;
  const weave = createWeave();
  weave.group.visible = false;
  scene.add(weave.group);
  let bridge: Awaited<ReturnType<typeof loadBridge>> | null = null;

  // what is seen *through* the glass: the far side of the strip, as a light red tint
  const backMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthFunc: THREE.GreaterEqualDepth, uniforms: rowU,
    vertexShader: `attribute vec2 aQ; ${STRIP} varying vec2 vQ; varying vec3 vN; varying vec3 vV;
      void main(){ strip(); vQ = aQ; vec4 mv = modelViewMatrix * vec4(sPos, 1.); vV = -mv.xyz; vN = normalMatrix * sNor; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec2 vQ; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.6); float rim = smoothstep(.9, .95, abs(vQ.x));
        gl_FragColor = vec4(mix(vec3(1., .955, .945), vec3(.70, .08, .10), clamp(f * .75 + rim * .7, 0., 1.)), 1.); }`,
  });
  const backRT = new THREE.WebGLRenderTarget(4, 4, { samples: 4 });
  uniforms.uBack.value = backRT.texture;
  const backScene = new THREE.Scene();

  /* ---------- page copy for refraction ---------- */
  const pageCanvas = document.createElement('canvas');
  const pctx = pageCanvas.getContext('2d')!;
  const pageTex = new THREE.CanvasTexture(pageCanvas);
  pageTex.colorSpace = THREE.SRGBColorSpace; pageTex.generateMipmaps = false; pageTex.minFilter = THREE.LinearFilter; pageTex.premultiplyAlpha = true;
  uniforms.uPage.value = pageTex;
  let pageScale = 1;
  let refract: HTMLElement[] = [];
  let pageDirty = true;
  function paintPage() {
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
    pctx.setTransform(pageScale, 0, 0, pageScale, 0, 0);
    for (const el of refract) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || !r.width) continue;
      const cs = getComputedStyle(el);
      const k = el.offsetHeight ? r.height / el.offsetHeight : 1;
      let o = 1;
      for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) { const s = n === el ? cs : getComputedStyle(n); o *= parseFloat(s.opacity); if (s.visibility === 'hidden') o = 0; }
      if (o < 0.01) continue;
      pctx.save();
      const clip = el.closest('.mask');
      if (clip) { const c = clip.getBoundingClientRect(); pctx.beginPath(); pctx.rect(c.left, c.top, c.width, c.height); pctx.clip(); }
      pctx.globalAlpha = o;
      pctx.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px ${cs.fontFamily}`;
      (pctx as any).letterSpacing = cs.letterSpacing === 'normal' ? '0px' : `${parseFloat(cs.letterSpacing) * k}px`;
      pctx.fillStyle = cs.color;
      const m = pctx.measureText('x');
      const lh = parseFloat(cs.lineHeight) * k || r.height;
      const base = r.top + (r.height - lh) / 2 + lh / 2 + (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
      pctx.fillText(el.textContent ?? '', r.left, base);
      pctx.restore();
    }
    pageTex.needsUpdate = true;
  }

  /* ---------- the wordmark inside the coil ---------- */
  let word: THREE.Mesh | null = null;
  const wordU = { uFill: { value: 0 }, uMap: { value: null as THREE.Texture | null }, uA: { value: new THREE.Color('#fff3ec') } };
  let wordAspect = 4;
  function buildWord() {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d')!;
    const size = Math.min(900, renderer.capabilities.maxTextureSize / 5.5);
    const font = `italic 400 ${size}px "Instrument Serif", serif`;
    ctx.font = font; (ctx as any).letterSpacing = `${-0.035 * size}px`;
    const w = ctx.measureText(opts.wordmark).width;
    c.width = Math.ceil(w + size * 0.16); c.height = Math.ceil(size * 1.16);
    ctx.font = font; (ctx as any).letterSpacing = `${-0.035 * size}px`;
    ctx.textBaseline = 'alphabetic';
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#f00'; ctx.fillText(opts.wordmark, size * 0.06, size * 0.8);
    ctx.strokeStyle = '#0f0'; ctx.lineWidth = size * 0.008; ctx.strokeText(opts.wordmark, size * 0.06, size * 0.8);
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8;
    wordU.uMap.value = tex; wordAspect = c.width / c.height;
    if (word) return;
    const m = new THREE.ShadowMaterial({ transparent: true });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, wordU);
      sh.vertexShader = sh.vertexShader.replace('void main() {', 'varying vec2 vUvW;\nvoid main() { vUvW = uv;');
      sh.fragmentShader = sh.fragmentShader
        .replace('void main() {', 'varying vec2 vUvW; uniform sampler2D uMap; uniform float uFill; uniform vec3 uA;\nvoid main() {')
        .replace(/gl_FragColor = vec4\([^;]+;/, `
          vec4 t = texture2D(uMap, vUvW);
          float f = smoothstep(uFill + .001, uFill - .06, vUvW.x);
          float al = max(t.g, t.r * f);
          if (al < .06) discard;
          gl_FragColor = vec4(mix(uA, vec3(.42, .02, .03), .5 * (1. - getShadowMask())), al);`);
    };
    word = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
    // VSM renders receivers into the shadow map too: without this the invisible plane shades the page
    const none = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    none.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() {\nif (gl_FragCoord.x > -1.) discard;'); };
    none.customProgramCacheKey = () => 'none';
    word.customDepthMaterial = none;
    word.receiveShadow = true; word.renderOrder = -1; word.visible = false;
    word.matrixAutoUpdate = false; word.frustumCulled = false;
    scene.add(word);
  }

  /** compile and upload everything while the curtain is down, so nothing stutters when it first appears */
  function prewarm() {
    if (word) word.visible = true;
    weave.set(1);
    if (sculpture) sculpture.mesh.visible = true;
    const rt = new THREE.WebGLRenderTarget(16, 16);
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    mesh.material = backMat; renderer.render(scene, camera); mesh.material = mat;
    if (sculpture) { sculpture.mesh.material = sculpture.back; renderer.render(scene, camera); sculpture.mesh.material = sculpture.mat; }
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    rt.dispose();
    if (sculpture) sculpture.mesh.visible = false;
    if (word) word.visible = false;
    weave.set(0);
    renderer.clear();
  }

  /* ---------- poses ---------- */
  type Baked = { form: FormName; y0: number; curves: Curve[] };
  let runs: Baked[] = [];
  let weaveCurve: Curve | null = null, layCurve: Curve | null = null, bridgeCurve: Curve | null = null;

  function setRuns(list: Run[]) {
    runs = list.map((run) => {
      let carry = { ...DEFAULTS };
      const xs: number[] = [], cols: number[][] = FIELDS.map(() => []);
      for (const k of run.keys) {
        const { s, ...rest } = k.pose;
        carry = { ...carry, ...rest, ...(s !== undefined ? { ls: Math.log(s) } : {}) };
        xs.push(xs.length ? Math.max(k.y, xs[xs.length - 1] + 1) : k.y);
        FIELDS.forEach((f, i) => cols[i].push(carry[f]));
      }
      return { form: run.form, y0: xs[0], curves: cols.map((c) => new Curve(xs, c)) };
    });
    runs[0].y0 = -Infinity;
    runIndex = -1;
  }
  let runIndex = -1;
  const history: Array<{ t: number; v: Float64Array }> = [];
  const now = new Float64Array(F);
  const binV = Array.from({ length: BINS }, () => new Float64Array(F));
  const binM = Array.from({ length: BINS }, () => new Float64Array(12));

  /** pose → 3x4 matrix: Rx · Ry(sway) · Rz · Ry · Rspin, about the focus, scaled, placed on screen */
  function poseMatrix(v: Float64Array, out: Float64Array, visW: number, sx: number, sy: number) {
    const s = Math.exp(v[ix.ls]) * intro.scale;
    const c = Math.cos, n = Math.sin;
    const mul = (A: number[], B: number[]) => { const r = new Array(9).fill(0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) r[i * 3 + j] += A[i * 3 + k] * B[k * 3 + j]; return r; };
    const RX = (a: number) => [1, 0, 0, 0, c(a), -n(a), 0, n(a), c(a)];
    const RY = (a: number) => [c(a), 0, n(a), 0, 1, 0, -n(a), 0, c(a)];
    const RZ = (a: number) => [c(a), -n(a), 0, n(a), c(a), 0, 0, 0, 1];
    const outer = mul(mul(RX(v[ix.rx] + intro.tilt + sy), RY(sx)), mul(RZ(v[ix.rz]), RY(v[ix.ry] + intro.spin)));
    const R = mul(outer, RX(v[ix.spin]));
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) out[i * 4 + j] = R[i * 3 + j] * s;
      out[i * 4 + 3] = -(outer[i * 3] * v[ix.q] + outer[i * 3 + 1] * v[ix.fy] + outer[i * 3 + 2] * v[ix.fz]) * s + (i === 0 ? v[ix.px] * visW : i === 1 ? v[ix.py] * VIEW : 0);
    }
  }

  /* ---------- per-frame strip ---------- */
  const intro = { head: 1, spin: 0, scale: 1, tint: 0, tilt: 0, follow: 0 };

  function shape(form: FormName, time: number, live: number, vel: number) {
    const f = getForm(form);
    const head = form === 'cq' ? now[ix.head] * intro.head : 1;
    const scale = Math.exp(now[ix.ls]);
    let first = 0;
    if (form === 'track') {
      // vertices stay nailed to the material; only which stretch of it is loaded changes
      first = Math.round(trackS(now[ix.q]) / DS) - (N >> 1);
      first = Math.min(f.count - N, Math.max(0, first));
      uniforms.uS0.value = first * DS; uniforms.uLen.value = (N - 1) * DS;
    } else { uniforms.uS0.value = 0; uniforms.uLen.value = f.ds * (N - 1); }
    const fx = now[ix.q], fy = now[ix.fy], fz = now[ix.fz];
    for (let i = 0; i < N; i++) {
      let x: number, y: number, z: number, ax: number, ay: number, az: number, w: number, u: number;
      if (form === 'track') {
        const j = (first + i) * 3;
        x = f.p[j]; y = f.p[j + 1]; z = f.p[j + 2]; ax = f.a[j]; ay = f.a[j + 1]; az = f.a[j + 2]; w = f.w[first + i];
        u = (first + i) * DS * 0.028;
      } else {
        u = (i / (N - 1)) * head;
        const g = u * (N - 1), i0 = Math.min(N - 2, Math.floor(g)), k = g - i0, j0 = i0 * 3, j1 = j0 + 3;
        x = f.p[j0] + (f.p[j1] - f.p[j0]) * k; y = f.p[j0 + 1] + (f.p[j1 + 1] - f.p[j0 + 1]) * k; z = f.p[j0 + 2] + (f.p[j1 + 2] - f.p[j0 + 2]) * k;
        ax = f.a[j0] + (f.a[j1] - f.a[j0]) * k; ay = f.a[j0 + 1] + (f.a[j1 + 1] - f.a[j0 + 1]) * k; az = f.a[j0 + 2] + (f.a[j1 + 2] - f.a[j0 + 2]) * k;
        w = f.w[i0] + (f.w[i0 + 1] - f.w[i0]) * k;
        if (head < 0.9999) {
          // a drawn tip that fades into the real end instead of switching to it
          const tip = Math.min(1, (head - u) / Math.min(0.16, head * 0.6 + 0.001));
          const taper = Math.sqrt(Math.max(0, tip)) * 0.98 + 0.02;
          w *= (taper + (1 - taper) * smoother(0.86, 1, head)) * (0.04 + 0.96 * smoother(0, 0.16, head));
        }
      }
      // it breathes, and fast movement sends a swell through it
      const r = live * (0.03 * Math.sin(u * 13 - time * 0.9) + vel * 0.09 * Math.sin(u * 8 - time * 2.1));
      y += r; z += r * 0.8;
      // drag: how late this point hears about the pose
      const d = Math.hypot(x - fx, (y - fy) * 0.6, (z - fz) * 0.6) * Math.min(1.6, scale);
      const b = live ? Math.min(BINS - 1.001, (Math.min(LAG_MAX, d * LAG_PER_UNIT) / LAG_MAX) * (BINS - 1)) : 0;
      const b0 = Math.floor(b), bk = b - b0, m0 = binM[b0], m1 = binM[b0 + 1];
      for (let e = 0; e < 3; e++) {
        const r0 = e * 4;
        const p0 = m0[r0] * x + m0[r0 + 1] * y + m0[r0 + 2] * z + m0[r0 + 3], p1 = m1[r0] * x + m1[r0 + 1] * y + m1[r0 + 2] * z + m1[r0 + 3];
        const a0 = m0[r0] * ax + m0[r0 + 1] * ay + m0[r0 + 2] * az, a1 = m1[r0] * ax + m1[r0 + 1] * ay + m1[r0 + 2] * az;
        rows[i * 4 + e] = p0 + (p1 - p0) * bk; rows[(N + i) * 4 + e] = a0 + (a1 - a0) * bk;
      }
      rows[i * 4 + 3] = w * scale * intro.scale;
    }
    rowU.uUnit.value = scale * intro.scale;
    rowTex.needsUpdate = true;
  }

  /* ---------- layout ---------- */
  let vw = 1, vh = 1;
  function resize() {
    vw = innerWidth; vh = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, vw <= 900 ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr); renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh; camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(uniforms.uRes.value);
    uniforms.uAspect.value = vw / vh;
    backRT.setSize(Math.round(uniforms.uRes.value.x / 2), Math.round(uniforms.uRes.value.y / 2));
    pageScale = Math.min(dpr, 1.5);
    pageCanvas.width = Math.round(vw * pageScale); pageCanvas.height = Math.round(vh * pageScale);
    pageTex.dispose(); pageDirty = true;
    const visW = VIEW * camera.aspect;
    const small = vw <= 900;
    // where the cloth hangs, where it lies once it is finished, and where the logo stands on it
    const tight = small && vh < 780;
    hang = { x: small ? visW * 0.06 : visW * 0.325, y: small ? (tight ? 0.5 : 0.12) : -0.6, z: -0.4, turn: small ? 0.5 : 0.42 };
    lie = { x: small ? visW * 0.02 : visW * 0.27, y: small ? (tight ? -0.45 : -0.9) : -2.55, z: -0.4, turn: small ? 0.2 : 0.16 };
    weave.group.scale.setScalar(small ? Math.min(0.4, visW / 14) * (tight ? 0.84 : 1) : Math.min(0.98, visW / 16.4));
    logoScale = small ? Math.min(1.95, visW * 0.4) * (tight ? 0.84 : 1) : Math.min(3.75, visW * 0.235);
    // how far back on the cloth it stands: the feet on the weave, the rest against the page
    logoBack = weave.group.scale.x * 2.9;
    wordWidth = Math.min(15, (visW * 0.92) / (small ? 0.52 : 1));
  }
  let wordWidth = 15;
  let hang = { x: 0, y: 0, z: 0, turn: 0 }, lie = hang, logoScale = 3, logoBack = 2.6;

  // pointer: a small spring, so the sculpture leans instead of following
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0 };
  const glide = (k: 'x' | 'y', dt: number) => {
    const s = k === 'x' ? 'sx' : 'sy', v = k === 'x' ? 'vx' : 'vy', w = 3.6;
    const d = pointer[s] - pointer[k], c = pointer[v] + w * d, e = Math.exp(-w * dt);
    pointer[s] = pointer[k] + (d + c * dt) * e; pointer[v] = (pointer[v] - w * c * dt) * e;
  };
  let velS = 0;
  let bend = 0;

  function frame(y: number, velocity: number, time: number, dt: number, live: boolean) {
    if (!runs.length) return;
    let r = 0;
    while (r < runs.length - 1 && y >= runs[r + 1].y0) r++;
    const run = runs[r];
    for (let i = 0; i < F; i++) now[i] = run.curves[i].at(y);
    if (r !== runIndex || !live) { runIndex = r; history.length = 0; }
    history.push({ t: time, v: now.slice() });
    while (history.length > 2 && history[1].t < time - LAG_MAX - 0.05) history.shift();

    glide('x', dt); glide('y', dt);
    velS += (Math.max(-1, Math.min(1, velocity / 2600)) - velS) * (1 - Math.exp(-4 * dt));
    const visW = VIEW * camera.aspect;
    const idle = live ? Math.sin(time * 0.35) * 0.03 : 0;
    const calm = run.form === 'track' ? 0.4 : 1;
    for (let b = 0; b < BINS; b++) {
      const t = time - (b / (BINS - 1)) * LAG_MAX;
      let j = history.length - 1;
      while (j > 0 && history[j].t > t) j--;
      const h0 = history[j], h1 = history[Math.min(history.length - 1, j + 1)];
      const k = h1.t > h0.t ? Math.min(1, Math.max(0, (t - h0.t) / (h1.t - h0.t))) : 0;
      binV[b].set(now);
      const lim = FLEX[run.form];
      for (const i of [ix.rx, ix.ry, ix.rz]) binV[b][i] = now[i] + lim * Math.tanh((h0.v[i] + (h1.v[i] - h0.v[i]) * k - now[i]) / lim);
      poseMatrix(binV[b], binM[b], visW, (pointer.sx * 0.24 + idle) * calm, pointer.sy * 0.13 * calm);
    }

    const drawn = now[ix.head] * intro.head;
    const on = now[ix.show] > 0.5 && (run.form === 'track' || drawn > 0.002);
    const solid = run.form === 'cq' ? sculpture : null;
    mesh.visible = on && !solid;
    if (sculpture) sculpture.mesh.visible = on && !!solid;
    if (on && solid) {
      const u = solid.uniforms, sc = Math.min(1.6, Math.exp(now[ix.ls]));
      if (intro.follow > 0.0005) {
        // the opening shot stays with the pen and pulls back as the form completes
        const m = binM[0], p = solid.pen(drawn);
        const at = [0, 4].map((e) => m[e] * p[0] + m[e + 1] * p[1] + m[e + 2] * p[2] + m[e + 3]);
        for (const b of [binM[0], binM[BINS - 1]]) { b[3] -= at[0] * intro.follow; b[7] -= at[1] * intro.follow; }
      }
      solid.pose(binM[0], binM[BINS - 1], [now[ix.q], now[ix.fy], now[ix.fz]], live ? (LAG_PER_UNIT * sc) / LAG_MAX : 0);
      u.uHead.value = drawn; u.uHot.value = 1 - smoother(0.9, 1, drawn); u.uTime.value = live ? time : 0; u.uLive.value = live ? 1 : 0; u.uVel.value = velS;
      solid.mat.normalScale.setScalar(0.8 * (1 - now[ix.glass]));
    }
    if (mesh.visible) shape(run.form, live ? time : 0, live ? 1 : 0, velS);

    if (import.meta.env.DEV && on) {
      // how far the flexed strip is from its rigid pose, in strip units (tests read this)
      bend = 0;
      const c = binM[0], l = binM[BINS - 1], sc = Math.exp(now[ix.ls]);
      for (const d of [4, 8]) bend = Math.max(bend, Math.hypot(...[0, 1, 2].map((e) => (l[e * 4] - c[e * 4]) * d / sc)) * Math.min(1, (d * LAG_PER_UNIT) / LAG_MAX));
    }
    uniforms.uGlass.value = now[ix.glass];
    uniforms.uTint.value = intro.tint;
    uniforms.uText.value = now[ix.text];
    uniforms.uTextShift.value = -time * 0.02;
    uniforms.uFlat.value = now[ix.flat];
    // the closer the camera, the softer the light on the page (and the coil never reaches through the wall)
    shadowMat.opacity = ((0.18 - 0.09 * now[ix.glass]) * (1 - now[ix.flat])) / (1 + 1.6 * Math.max(0, Math.exp(now[ix.ls]) - 1.35) ** 2);

    if (word) {
      word.visible = run.form === 'track' && Math.abs(now[ix.q] - TRACK.word) < 34;
      if (word.visible) {
        const w = wordWidth, h = wordWidth / wordAspect, X = TRACK.word;
        // the word does not spin with the coil: undo the spin by rebuilding from the unspun axes
        const v = binV[0], spun = v[ix.spin];
        v[ix.spin] = 0; const tmp = new Float64Array(12); poseMatrix(v, tmp, visW, (pointer.sx * 0.24 + idle) * calm, pointer.sy * 0.13 * calm); v[ix.spin] = spun;
        word.matrix.set(
          tmp[0] * w, tmp[1] * h, tmp[2], tmp[0] * X + tmp[3],
          tmp[4] * w, tmp[5] * h, tmp[6], tmp[4] * X + tmp[7],
          tmp[8] * w, tmp[9] * h, tmp[10], tmp[8] * X + tmp[11],
          0, 0, 0, 1);
        word.matrixWorldNeedsUpdate = true;
        wordU.uFill.value = now[ix.fill];
      }
    }
    if (weaveCurve) {
      const w = weaveCurve.at(y);
      weave.set(w);
      // the loom turns a little while it works; the finished cloth is laid down and the logo settles on it
      const lay = layCurve ? layCurve.at(y) : 0, mix = (a: number, b: number) => a + (b - a) * lay;
      const tilt = mix(-0.52 + 0.1 * (1 - w), -1.16);
      weave.group.rotation.set(tilt, mix(0.2, 0), mix(hang.turn, lie.turn) + 0.08 * (1 - Math.min(1, w)));
      weave.group.position.set(mix(hang.x, lie.x), mix(hang.y, lie.y), hang.z);
      if (bridge && bridgeCurve) {
        const b = bridgeCurve.at(y);
        bridge.group.position.set(lie.x - logoBack * 0.1, lie.y + logoBack * Math.cos(1.16), lie.z - logoBack * Math.sin(1.16));
        bridge.group.rotation.x = Math.PI / 2 - 1.16;
        bridge.group.scale.setScalar(logoScale);
        bridge.group.position.y += 0.13 * weave.group.scale.x; // on top of the threads
        bridge.set(b, live ? time : 0, -0.62 + 0.42 * smoother(0, 1, Math.min(1, b)) + 0.3 * Math.max(0, b - 1), pointer.sx * 0.5 + idle);
      }
    }

    if (on && now[ix.glass] > 0.002) {
      const body = solid ? solid.mesh : mesh, front = solid ? solid.mat : mat;
      paintPage();
      scene.remove(body); backScene.add(body);
      body.material = solid ? solid.back : backMat;
      renderer.setRenderTarget(backRT);
      const gl = renderer.getContext();
      gl.clearDepth(0);
      renderer.setClearColor(0x000000, 0); renderer.clear();
      renderer.autoClear = false; renderer.render(backScene, camera); renderer.autoClear = true;
      gl.clearDepth(1);
      renderer.setRenderTarget(null);
      body.material = front;
      backScene.remove(body); scene.add(body);
    } else if (pageDirty) { paintPage(); pageDirty = false; }
    renderer.render(scene, camera);
  }

  const onPointer = (e: PointerEvent) => { if (e.pointerType === 'mouse') { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; } };
  addEventListener('pointermove', onPointer, { passive: true });
  resize();

  return {
    async loadModel(progress: (p: number) => void) {
      let a = 0, b = 0;
      const tell = () => progress(a * 0.8 + b * 0.05);
      const bands = loadBands(renderer, () => { b++; tell(); }).then((t) => {
        uniforms.uRedT.value = t.red; uniforms.uGoldT.value = t.gold; uniforms.uRedN.value = t.redN; uniforms.uGoldN.value = t.goldN;
        uniforms.uBands.value = 1; Object.assign(mat, COAT);
      });
      const model = loadSculpture(renderer, uniforms, vw <= 900 || renderer.capabilities.maxTextureSize < 4096, (p) => { a = p; tell(); }).then((m) => { sculpture = m; scene.add(m.mesh); });
      const done = await Promise.allSettled([bands, model]);
      for (const d of done) if (d.status === 'rejected') throw d.reason;
    },
    hasModel: () => !!sculpture,
    intro, frame, resize, buildWord, prewarm, setRuns,
    setWeave(c: Curve, lay: Curve, logo: Curve) { weaveCurve = c; layCurve = lay; bridgeCurve = logo; },
    /** the community logo: comes in after the opening, the page does not wait for it */
    async loadBridge() {
      const b = await loadBridge(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/models/tta.glb`);
      scene.add(b.group);
      b.group.visible = true; await renderer.compileAsync(scene, camera); b.group.visible = false;
      bridge = b;
    },
    setRefract(els: HTMLElement[]) { refract = els; },
    setBg(css: string) { uniforms.uBg.value.setStyle(css); },
    /** the smoothed pointer, -0.5..0.5 */
    lean: () => [pointer.sx, pointer.sy] as const,
    /** for tests */
    stretch: () => bend,
    pose: () => Object.fromEntries(FIELDS.map((f, i) => [f, now[i]])) as State,
    destroy() { removeEventListener('pointermove', onPointer); weave.dispose(); bridge?.dispose(); sculpture?.dispose(); renderer.dispose(); geo.dispose(); mat.dispose(); meshDepth.dispose(); rowTex.dispose(); backRT.dispose(); pageTex.dispose(); },
  };
}
