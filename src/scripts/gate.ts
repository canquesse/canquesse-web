/**
 * The CAUTRUM card: the granite C is the gate. Requests glide along one thread towards its doorway, the
 * light in the doorway is the decision. It opens for what may run, waits for a person, or goes out.
 *
 *  - own small renderer inside the card (the page's stage lies under the cards); it only runs while
 *    the card can be seen
 *  - the doorway is lit by one lamp, computed analytically: on its walls, as a soft shaft in front of
 *    it and as the patch of light that really fits through the opening onto the floor
 *  - the visitor can propose an action, approve one that waits, and turn the stone
 */
import * as THREE from 'three';
import { clamp01, smoother } from './score';

type Verdict = 'allow' | 'ask' | 'deny';
interface Request { name: string; verdict: Verdict; z: number; v: number; to: number; w: number; state: 'line' | 'scan' | 'wait' | 'pass' | 'back'; since: number; life: number; by: 'model' | 'you'; mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>; tag: HTMLElement; row: HTMLElement | null }

/** the doorway in model units: left, right, bottom, top, back, front */
const DOOR = { x0: 0.334, x1: 0.65, y0: -0.524, y1: -0.112, z0: -0.195, z1: 0.196 };
const LANE = { x: (DOOR.x0 + DOOR.x1) / 2, y: -0.345 };
const LAMP = new THREE.Vector3(DOOR.x0 + 0.075, DOOR.y1 - 0.085, 0.0);
const FLOOR = -0.95;
const FAR = 5.6, HALT = 0.74, GAP = 0.62, GONE = -4.6;

const LIGHT = /* glsl */ `
  uniform vec3 uLamp; uniform float uLight, uWarm, uTime;
  vec3 lampColour(){ return mix(vec3(1., .075, .045), vec3(1., .23, .12), uWarm); }
  float grain(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
`;
const DOORBOX = `vec4(${DOOR.x0.toFixed(3)}, ${DOOR.x1.toFixed(3)}, ${DOOR.y0.toFixed(3)}, ${DOOR.y1.toFixed(3)})`;

const reduce = () => document.documentElement.classList.contains('is-still');

export async function createGate(card: HTMLElement) {
  const canvas = card.querySelector<HTMLCanvasElement>('[data-gate-canvas]')!;
  const focus = card.querySelector<HTMLElement>('[data-gate-focus]')!;
  const tags = card.querySelector<HTMLElement>('[data-gate-tags]')!;
  const log = card.querySelector<HTMLElement>('[data-gate-log]')!;
  const words = JSON.parse(card.querySelector('[data-gate-words]')!.textContent!) as Record<'allow' | 'ask' | 'deny' | 'approved' | 'expired' | 'approve', string>;
  const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/models/`;

  const [{ GLTFLoader }, { MeshoptDecoder }, { RoundedBoxGeometry }] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js'), import('three/addons/geometries/RoundedBoxGeometry.js'),
  ]);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(`${base}cautrum.glb`);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(13, 1, 1, 60);

  /* ---------- light: the logo's own. Tops and ends catch it, the face of the C stays in the dark ---------- */
  const key = new THREE.DirectionalLight('#fff4ec', 3.9);
  key.position.set(6, 6.8, -0.6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0008; key.shadow.normalBias = 0.012; key.shadow.radius = 5; key.shadow.intensity = 0.6;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 18 });
  const face = new THREE.DirectionalLight('#fff0ea', 0.5); face.position.set(-3, 2.5, 6);
  scene.add(key, face, new THREE.HemisphereLight('#f3ece8', '#4a1a1e', 0.62));

  /** model space → view space, for the stone's normals */
  const facing = { value: new THREE.Matrix4() };
  const lit = { uLamp: { value: LAMP }, uLight: { value: 0 }, uWarm: { value: 0 }, uTime: { value: 0 } };

  /* ---------- the stone ---------- */
  const stone = new THREE.Group();
  scene.add(stone);
  let body!: THREE.Mesh;
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) body = o as THREE.Mesh; });
  // the logo's own stone: one dark, dry tone, rough to the touch, without a pattern. Made here in three
  // dimensions, so it has no seams; the facets are exactly flat
  const granite = new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.92, metalness: 0 });
  granite.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, lit, { uBody: { value: body.matrixWorld.clone() } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOp; uniform mat4 uBody;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOp = (uBody * vec4(position, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vOp; uniform mat4 uFacing;\n${LIGHT}
        float h31(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
        float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
          return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
        float rough(vec3 p){ return n3(p * 62.) * .6 + n3(p * 128. + 7.) * .4; }
        vec3 facet(vec3 n){
          vec3 best = vec3(0., 0., 1.); float m = -2.;
          vec3 k[4]; k[0] = vec3(1., 0., 0.); k[1] = vec3(0., 1., 0.); k[2] = vec3(0., 0., 1.); k[3] = vec3(.5736, -.8192, 0.);
          for (int i = 0; i < 4; i++) { float q = dot(n, k[i]); if (abs(q) > m) { m = abs(q); best = k[i] * sign(q); } }
          return best; }`)
      .replace('#include <map_fragment>', `
        // a clean opening: the scan's own edge is ragged
        if (vOp.x > ${DOOR.x0.toFixed(3)} && vOp.x < ${DOOR.x1.toFixed(3)} && vOp.y > ${DOOR.y0.toFixed(3)} && vOp.y < ${DOOR.y1.toFixed(3)}) discard;
        vec3 flat3 = facet(normalize(cross(dFdx(vOp), dFdy(vOp))));
        float grit = rough(vOp), soft = n3(vOp * 5.) * .6 + n3(vOp * 13. + 3.) * .4;
        diffuseColor.rgb = vec3(.0800, .0752, .0738) * (.74 + .34 * grit + .18 * soft);`)
      .replace('#include <normal_fragment_begin>', `
        vec3 g3 = vec3(rough(vOp + vec3(.0035, 0., 0.)), rough(vOp + vec3(0., .0035, 0.)), rough(vOp + vec3(0., 0., .0035))) - grit;
        g3 -= flat3 * dot(g3, flat3);
        vec3 normal = normalize(mat3(uFacing) * normalize(flat3 - g3 * .62));
        vec3 nonPerturbedNormal = normal;`)
      // what comes out of the doorway grazes its frame
      .replace('#include <emissivemap_fragment>', `
        float off = length(vec2(max(max(${DOOR.x0.toFixed(3)} - vOp.x, vOp.x - ${DOOR.x1.toFixed(3)}), 0.), max(max(${DOOR.y0.toFixed(3)} - vOp.y, vOp.y - ${DOOR.y1.toFixed(3)}), 0.)));
        totalEmissiveRadiance += lampColour() * uLight * .06 * exp(-off * 13.) * smoothstep(.5, .9, flat3.z) * (.5 + grit);`);
    sh.uniforms.uFacing = facing;
  };
  const c = new THREE.Mesh(body.geometry, granite);
  c.matrixAutoUpdate = false; c.matrix.copy(body.matrixWorld);
  c.castShadow = c.receiveShadow = true;
  stone.add(c);

  /* ---------- the doorway ---------- */
  const w = DOOR.x1 - DOOR.x0, h = DOOR.y1 - DOOR.y0, d = DOOR.z1 - DOOR.z0;
  const passage = new THREE.Mesh(new THREE.BoxGeometry(w + 0.002, h + 0.002, d - 0.003), new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: lit,
    vertexShader: 'varying vec3 vP, vN; void main(){ vP = position; vN = -normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec3 vP, vN; ${LIGHT}
      void main(){
        // both ends are open; a veil of darkness closes the far one
        vec3 P = vP + vec3(${((DOOR.x0 + DOOR.x1) / 2).toFixed(4)}, ${((DOOR.y0 + DOOR.y1) / 2).toFixed(4)}, 0.);
        if (vN.z < -.5) discard;
        vec3 L = uLamp - P; float q = dot(L, L);
        float n = max(dot(normalize(vN), normalize(L)), 0.);
        vec3 g3 = floor(P * 210.);
        float stone = .7 + .42 * grain(g3.xy + g3.z * 7.3);
        // one lamp high in the left corner: bright there, almost nothing at the bottom and on the right
        float irr = n * .02 / (q + .0026) * smoothstep(-.2, .16, vP.y);
        vec3 col = vec3(.0035, .0028, .0026) * stone + lampColour() * irr * stone * uLight;
        if (vN.z > .5) col = vec3(.0012, .0008, .0008) + lampColour() * uLight * .012 * exp(-length(P.xy - uLamp.xy) * 7.);
        col = 1. - exp(-col * 1.5);
        gl_FragColor = vec4(pow(col, vec3(1. / 2.2)), 1.);
      }`,
  }));
  passage.position.set((DOOR.x0 + DOOR.x1) / 2, (DOOR.y0 + DOOR.y1) / 2, 0);
  stone.add(passage);

  // additive without touching the alpha, so it lights the card behind the canvas too
  const glow = (m: THREE.ShaderMaterial) => Object.assign(m, { transparent: true, depthWrite: false, toneMapped: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor });
  // the shaft: slices through the cone of light that leaves the opening
  const SLICES = 16, REACH = 1.25;
  const shaftGeo = new THREE.InstancedBufferGeometry();
  shaftGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], 3)); shaftGeo.setIndex([0, 1, 2, 0, 2, 3]);
  shaftGeo.instanceCount = SLICES;
  shaftGeo.setAttribute('aK', new THREE.InstancedBufferAttribute(new Float32Array(Array.from({ length: SLICES }, (_, i) => (i + 0.5) / SLICES)), 1));
  const shaft = new THREE.Mesh(shaftGeo, glow(new THREE.ShaderMaterial({
    uniforms: lit, side: THREE.DoubleSide,
    vertexShader: `attribute float aK; varying vec2 vUv; varying float vK; uniform vec3 uLamp;
      void main(){ vUv = position.xy; vK = aK; float z = ${DOOR.z1.toFixed(3)} + aK * ${REACH.toFixed(2)};
        vec4 D = ${DOORBOX}; vec2 p = vec2(mix(D.x, D.y, position.x), mix(D.z, D.w, position.y));
        float k = (z - uLamp.z) / (${DOOR.z1.toFixed(3)} - uLamp.z);
        p = mix(p, uLamp.xy + (p - uLamp.xy) * k, .62);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, z, 1.); }`,
    fragmentShader: `varying vec2 vUv; varying float vK; ${LIGHT}
      void main(){ vec2 e = smoothstep(0., .38, vUv) * smoothstep(0., .38, 1. - vUv);
        float a = e.x * e.y * pow(1. - vK, 2.2) * smoothstep(0., .3, vK) * (.82 + .18 * sin(uTime * .7 + vK * 9. + vUv.x * 3.));
        gl_FragColor = vec4(lampColour() * a * uLight * .05, 0.); }`,
  })));
  shaft.frustumCulled = false; shaft.renderOrder = 4;
  stone.add(shaft);

  /* ---------- the floor: a shadow, and the patch of light that fits through the opening ---------- */
  const shade = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ color: '#000', opacity: 0.5 }));
  shade.rotation.x = -Math.PI / 2; shade.position.y = FLOOR; shade.receiveShadow = true;
  scene.add(shade);
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), glow(new THREE.ShaderMaterial({
    uniforms: { ...lit, uTurn: { value: new THREE.Matrix4() } },
    vertexShader: 'varying vec3 vP; uniform mat4 uTurn; void main(){ vec4 p = modelMatrix * vec4(position, 1.); vP = (uTurn * p).xyz; gl_Position = projectionMatrix * viewMatrix * p; }',
    fragmentShader: `varying vec3 vP; ${LIGHT}
      void main(){
        if (vP.z < ${(DOOR.z1 + 0.01).toFixed(3)}) discard;
        vec4 D = ${DOORBOX};
        float t = (${DOOR.z1.toFixed(3)} - uLamp.z) / (vP.z - uLamp.z);
        vec2 X = mix(uLamp.xy, vP.xy, t), s = vec2(.03 + .05 * (1. - t));
        vec2 m = smoothstep(D.xz - s, D.xz + s, X) * (1. - smoothstep(D.yw - s, D.yw + s, X));
        vec3 L = uLamp - vP; float q = dot(L, L);
        float irr = m.x * m.y * (.42 / q) * max(L.y / sqrt(q), 0.) * exp(-max(0., vP.z - .4) * .55);
        float haze = .05 * exp(-length(vP.xz - vec2(${LANE.x.toFixed(3)}, .55)) * 1.7);
        gl_FragColor = vec4(lampColour() * uLight * (irr * (.9 + .16 * grain(floor(vP.xz * 90.))) + haze), 0.);
      }`,
  })));
  patch.rotation.x = -Math.PI / 2; patch.position.y = FLOOR + 0.004; patch.renderOrder = 1;
  scene.add(patch);

  /* ---------- the thread ---------- */
  const thread = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, FAR - GONE), glow(new THREE.ShaderMaterial({
    uniforms: lit, vertexShader: `varying float vZ; void main(){ vZ = position.z + ${((FAR + GONE) / 2).toFixed(3)}; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying float vZ; ${LIGHT}
      void main(){ float a = smoothstep(${FAR.toFixed(1)}, ${(FAR - 2.4).toFixed(1)}, vZ) * smoothstep(${GONE.toFixed(1)}, ${(GONE + 2.2).toFixed(1)}, vZ);
        gl_FragColor = vec4((vec3(.30, .17, .14) + lampColour() * uLight * 1.3 * exp(-abs(vZ - .4) * 1.9)) * a, 0.); }`,
  })));
  thread.position.set(LANE.x, LANE.y - 0.03, (FAR + GONE) / 2);
  stone.add(thread); // the line belongs to the gate: whoever turns the stone turns all of it

  /* ---------- requests ---------- */
  const bar = new RoundedBoxGeometry(0.165, 0.026, 0.3, 4, 0.012);
  const list: Request[] = [];
  const KINDS: Record<string, Verdict> = { read_docs: 'allow', search_index: 'allow', send_email: 'ask', delete_table: 'deny' };
  const ORDER = ['read_docs', 'search_index', 'send_email', 'read_docs', 'delete_table', 'search_index'];
  let turn = 0, nextAuto = 1.2, quietUntil = 0, now = 0;
  let light = 0, warm = 0, flash = 0;

  const note = (r: Request, text: string, cls: string) => {
    if (!r.row) {
      r.row = document.createElement('li');
      log.prepend(r.row);
      while (log.children.length > 4) log.lastElementChild!.remove();
    }
    r.row.className = `is-${cls}`;
    r.row.replaceChildren();
    const add = (tag: string, t: string, k = '') => { const e = document.createElement(tag); e.textContent = t; if (k) e.className = k; r.row!.append(e); return e; };
    add('time', new Date().toLocaleTimeString('de-DE'));
    add('b', r.name);
    add('span', text);
    if (cls === 'ask') {
      const b = add('button', words.approve, 'gate-approve') as HTMLButtonElement;
      b.type = 'button';
      b.addEventListener('click', (e) => { e.stopPropagation(); approve(r); });
    }
  };
  const approve = (r: Request) => { if (r.state !== 'wait') return; r.state = 'pass'; r.since = now; flash = 1; note(r, words.approved, 'allow'); };

  function propose(name: string, by: Request['by']) {
    if (list.filter((r) => r.state === 'line' || r.state === 'scan' || r.state === 'wait').length > 3) return;
    const mat = new THREE.MeshPhysicalMaterial({ color: '#f3d6c7', roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, emissive: '#ff5a3c', emissiveIntensity: 0, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(bar, mat);
    mesh.position.set(LANE.x, LANE.y, FAR); mesh.castShadow = true;
    const tag = document.createElement('span'); tag.textContent = name; tags.append(tag);
    stone.add(mesh);
    // somebody is watching: start closer, so a click is answered at once
    list.push({ name, verdict: KINDS[name], z: by === 'you' ? FAR - 1.9 : FAR, v: 0, to: HALT, w: by === 'you' ? 2.5 : 1.75, state: 'line', since: now, life: 0, by, mesh, tag, row: null });
  }
  const drop = (r: Request) => { stone.remove(r.mesh); r.mesh.material.dispose(); r.tag.remove(); list.splice(list.indexOf(r), 1); };

  const onChip = (e: Event) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-gate-chip]');
    if (!b) return;
    e.preventDefault();
    quietUntil = now + 16;
    propose(b.dataset.gateChip!, 'you');
    if (reduce()) { for (let i = 0; i < 260; i++) step(1 / 30); render(); }
  };
  card.addEventListener('click', onChip);

  /* ---------- turning the stone ---------- */
  const pose = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, drag: 0, dragT: 0, vd: 0, enter: 1 };
  const spring = (k: 'x' | 'y' | 'drag', v: 'vx' | 'vy' | 'vd', target: number, omega: number, dt: number) => {
    const o = pose[k] - target, q = pose[v] + omega * o, e = Math.exp(-omega * dt);
    pose[k] = target + (o + q * dt) * e; pose[v] = (pose[v] - omega * q * dt) * e;
  };
  let grab: { x: number; moved: number } | null = null;
  const onMove = (e: PointerEvent) => {
    const r = card.getBoundingClientRect();
    if (e.pointerType === 'mouse') { pose.tx = (e.clientX - r.left) / r.width - 0.5; pose.ty = (e.clientY - r.top) / r.height - 0.5; }
    if (grab) { const dx = e.clientX - grab.x; grab.moved = Math.max(grab.moved, Math.abs(dx)); pose.dragT = Math.max(-0.7, Math.min(0.7, dx / 300)); }
  };
  const onDown = (e: PointerEvent) => { if (e.button) return; grab = { x: e.clientX, moved: 0 }; focus.classList.add('is-held'); };
  const onUp = () => {
    if (!grab) return;
    // a tap on the gate: approve what waits, otherwise the next proposal
    if (grab.moved < 6) { const w = list.find((r) => r.state === 'wait'); if (w) approve(w); else { quietUntil = now + 16; propose(ORDER[turn++ % ORDER.length], 'you'); } }
    grab = null; pose.dragT = 0; focus.classList.remove('is-held');
  };
  const onOut = () => { pose.tx = pose.ty = 0; };
  card.addEventListener('pointermove', onMove); card.addEventListener('pointerleave', onOut);
  focus.addEventListener('pointerdown', onDown); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  /* ---------- layout ---------- */
  let W = 1, H = 1, cx = 0, cy = 0, span = 400, small = false;
  function resize() {
    W = card.offsetWidth; H = card.offsetHeight; small = innerWidth <= 900;
    // the card is scaled while it arrives: measure in its own pixels
    let x = 0, y = 0;
    for (let n: HTMLElement | null = focus; n && n !== card; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }
    cx = x + focus.offsetWidth / 2; cy = y + focus.offsetHeight / 2; span = focus.offsetHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
    renderer.setSize(W, H, false);
    const UNITS = 2.5; // what must fit into the focus box, top to bottom
    const view = (UNITS * H) / span;
    camera.aspect = W / H;
    const dist = view / 2 / Math.tan((camera.fov * Math.PI) / 360);
    const az = 0.83, el = 0.47;
    camera.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    camera.near = Math.max(1, dist - 14); camera.far = dist + 14;
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(card); ro.observe(focus);
  resize();

  /* ---------- time ---------- */
  function step(dt: number) {
    now += dt;
    const queue = list.filter((r) => r.state !== 'pass' && r.state !== 'back').sort((a, b) => a.z - b.z);
    if (now > nextAuto && now > quietUntil && queue.length < 2 && pose.enter > 0.98) { propose(ORDER[turn++ % ORDER.length], 'model'); nextAuto = now + 4.6; }
    let want = 0.62 + 0.07 * Math.sin(now * 0.9), wantWarm = 0;
    queue.forEach((r, i) => {
      r.to = HALT + i * GAP;
      const there = Math.abs(r.z - HALT) < 0.035;
      if (i === 0 && r.state === 'line' && there) { r.state = 'scan'; r.since = now; }
      if (r.state === 'line' && i === 0) want += 0.28 * smoother(2.2, HALT, r.z);
      if (r.state === 'scan') {
        want = 1.05;
        if (now - r.since > 0.75) {
          r.since = now;
          if (r.verdict === 'allow') { r.state = 'pass'; flash = 1; note(r, words.allow, 'allow'); }
          else if (r.verdict === 'deny') { r.state = 'back'; note(r, words.deny, 'deny'); }
          else { r.state = 'wait'; note(r, words.ask, 'ask'); }
        }
      }
      if (r.state === 'wait') {
        want = 0.62 + 0.34 * Math.sin((now - r.since) * 2.1);
        if (now - r.since > (r.by === 'you' ? 11 : 6.5)) { r.state = 'back'; r.since = now; note(r, words.expired, 'deny'); }
      }
    });
    for (const r of [...list]) {
      r.life += dt;
      if (r.state === 'pass') { r.to = GONE; r.w = 1.15; want = Math.max(want, r.z > -0.4 ? 1.75 : want); if (r.z > -0.5) wantWarm = 1; }
      if (r.state === 'back') { r.to = HALT + 1.5; r.w = 1.5; if (now - r.since < 1.5) { want = 0.03; wantWarm = 0; } }
      const o = r.z - r.to, q = r.v + r.w * o, e = Math.exp(-r.w * dt);
      r.z = r.to + (o + q * dt) * e; r.v = (r.v - r.w * q * dt) * e;
      const m = r.mesh.material;
      const seen = smoother(0, 0.8, r.life) * (r.state === 'back' ? 1 - smoother(0.5, 1.7, now - r.since) : 1) * smoother(GONE + 0.15, GONE + 1.7, r.z);
      m.opacity = seen;
      r.mesh.position.set(LANE.x, LANE.y + 0.006 * Math.sin(r.life * 1.7), r.z);
      r.mesh.rotation.z = 0.03 * Math.sin(r.life * 1.3);
      const near = Math.exp(-Math.abs(r.z - 0.1) * 2.3);
      m.emissiveIntensity = r.state === 'back' ? 0 : light * near * 0.75 + (r.state === 'pass' ? 0.3 : 0.02);
      m.color.lerp(r.state === 'back' ? DARK : PALE, 1 - Math.exp(-4 * dt));
      if ((r.state === 'back' && now - r.since > 1.75) || r.z < GONE + 0.12) drop(r);
    }
    flash = Math.max(0, flash - dt / 0.9);
    want = (want + 0.5 * flash * flash) * smoother(0.72, 1, pose.enter);
    light += (want - light) * (1 - Math.exp(-(want < light ? 5.5 : 3.6) * dt));
    warm += (wantWarm - warm) * (1 - Math.exp(-3.2 * dt));
    lit.uLight.value = light; lit.uWarm.value = warm; lit.uTime.value = now;
    spring('x', 'vx', pose.tx, 3.4, dt); spring('y', 'vy', pose.ty, 3.4, dt); spring('drag', 'vd', pose.dragT, grab ? 9 : 4.2, dt);
    stone.rotation.y = pose.x * 0.3 + pose.drag - 1.15 * (1 - smoother(0, 1, pose.enter)) + 0.02 * Math.sin(now * 0.5);
    stone.rotation.x = pose.y * 0.07;
    stone.position.y = -0.12 * (1 - smoother(0, 1, pose.enter)) + 0.0;
    // the floor light turns with the doorway
    stone.updateMatrixWorld();
    (patch.material as THREE.ShaderMaterial).uniforms.uTurn.value.copy(stone.matrixWorld).invert();
  }
  const PALE = new THREE.Color('#f3d6c7'), DARK = new THREE.Color('#3a1418');
  const p = new THREE.Vector3();
  function render() {
    facing.value.multiplyMatrices(camera.matrixWorldInverse, stone.matrixWorld);
    renderer.render(scene, camera);
    for (const r of list) {
      p.set(LANE.x, LANE.y + 0.2, r.z).applyMatrix4(stone.matrixWorld).project(camera);
      const x = (p.x * 0.5 + 0.5) * W, y = (-p.y * 0.5 + 0.5) * H;
      r.tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      r.tag.style.opacity = String(r.mesh.material.opacity * smoother(-0.1, 0.45, r.z) * smoother(FAR, FAR - 1.4, r.z) * smoother(10, 74, x));
      r.tag.className = `is-${r.state}`;
    }
  }
  await renderer.compileAsync(scene, camera);
  if (reduce()) { pose.enter = 1; for (let i = 0; i < 90; i++) step(1 / 30); for (const r of [...list]) drop(r); log.replaceChildren(); quietUntil = 1e9; render(); }

  return {
    /** 0 the card is below the screen, 1 it has arrived */
    enter(v: number) { pose.enter = clamp01(v); },
    frame(dt: number) { step(dt); render(); },
    dispose() {
      card.removeEventListener('click', onChip); card.removeEventListener('pointermove', onMove); card.removeEventListener('pointerleave', onOut);
      focus.removeEventListener('pointerdown', onDown); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp);
      ro.disconnect(); for (const r of [...list]) drop(r);
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
      bar.dispose(); renderer.dispose();
    },
  };
}
