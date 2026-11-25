/**
 * The Türk Tech Almanya logo (two people on a bridge) as an object: the Meshy model in its five parts.
 * The bridge settles on the finished kilim, the two people come to it from both sides, and once they
 * are together they keep talking: a small nod, taking turns.
 */
import * as THREE from 'three';
import { clamp01, smoother } from './score';

const PARTS = ['bridge', 'bodyL', 'bodyR', 'headL', 'headR'] as const;
type Part = (typeof PARTS)[number];
/** when each part travels, and from where (model units, radians): x, y, z, turn around z */
const COME: Record<Part, { a: number; b: number; from: [number, number, number, number] }> = {
  bridge: { a: 0, b: 0.5, from: [0, 2.6, 0, 0] },
  bodyL: { a: 0.28, b: 0.76, from: [-0.9, 2.2, 0.3, 0.9] },
  bodyR: { a: 0.36, b: 0.84, from: [0.9, 2.2, 0.3, -0.9] },
  headL: { a: 0.5, b: 0.93, from: [-0.5, 2.0, 0.2, 1.6] },
  headR: { a: 0.57, b: 1, from: [0.5, 2.0, 0.2, -1.6] },
};
/** the model's feet */
const BASE = -0.472;

function contactShadow() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d')!;
  // soft ellipses from gradients (Safari has no canvas blur)
  const soft = (cx: number, cy: number, rx: number, ry: number, k: number) => {
    x.save(); x.translate(cx, cy); x.scale(rx, ry);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
    for (let i = 0; i <= 8; i++) { const r = i / 8; g.addColorStop(r, `rgba(30,0,4,${(k * (1 - smoother(0, 1, r))).toFixed(3)})`); }
    x.fillStyle = g; x.fillRect(-1, -1, 2, 2); x.restore();
  };
  // the three feet, and the span between them, lighter
  soft(256, 128, 250, 84, 0.5);
  for (const [cx, w] of [[58, 56], [256, 78], [454, 56]]) soft(cx, 128, w, 52, 0.95);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export async function loadBridge(url: string) {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js')]);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  const mat = new THREE.MeshPhysicalMaterial({ color: '#fff', roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.18, metalness: 0.05, envMapIntensity: 1.1 });
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOn;').replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvOn = objectNormal;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vOn;')
      // the ribbon's own materials: dark lacquer on the faces, rose gold along the thickness
      .replace('#include <color_fragment>', `#include <color_fragment>
        float side = 1. - smoothstep(.45, .85, abs(normalize(vOn).z));
        diffuseColor.rgb = mix(vec3(.150, .0035, .0075), vec3(.60, .27, .19), side);`)
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, .62, side);');
  };
  mat.customProgramCacheKey = () => 'bridge';

  const group = new THREE.Group(), figure = new THREE.Group();
  const nodes = {} as Record<Part, { o: THREE.Group; home: THREE.Vector3 }>;
  gltf.scene.updateMatrixWorld(true);
  for (const name of PARTS) {
    const src = gltf.scene.getObjectByName(name)!;
    let mesh!: THREE.Mesh;
    src.traverse((o) => { if ((o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh; });
    const m = new THREE.Mesh(mesh.geometry, mat);
    m.matrixAutoUpdate = false; m.matrix.copy(mesh.matrixWorld);
    m.castShadow = true; m.frustumCulled = false;
    // each part turns around its own middle
    const home = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    const o = new THREE.Group(), inner = new THREE.Group();
    inner.position.copy(home).negate(); inner.add(m); o.add(inner);
    figure.add(o); nodes[name] = { o, home };
  }
  figure.position.y = -BASE;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.15), new THREE.MeshBasicMaterial({ map: contactShadow(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; shadow.renderOrder = 2;
  group.add(figure, shadow);
  group.visible = false;

  return {
    group,
    /** p: 0 not there, 1 complete, 2 gone again. turn: around its own axis. lean: pointer */
    set(p: number, time: number, turn: number, lean: number) {
      group.visible = p > 0.001 && p < 1.999;
      if (!group.visible) return;
      const inn = clamp01(p), out = clamp01(p - 1);
      const settled = smoother(0.8, 1, inn) * (1 - smoother(0, 0.2, out));
      for (const name of PARTS) {
        const { a, b, from } = COME[name], { o, home } = nodes[name];
        // out: the last to come is the first to leave
        const away = 1 - smoother(a, b, inn) + smoother((1 - b) * 0.62, (1 - b) * 0.62 + 0.62, out);
        o.position.set(home.x + from[0] * away, home.y + from[1] * away, home.z + from[2] * away);
        let nod = 0;
        if (name !== 'bridge') {
          // one speaks, the other listens
          const dir = name.endsWith('L') ? -1 : 1, t = time * 1.15 + (dir > 0 ? Math.PI : 0);
          const talk = Math.max(0, Math.sin(t)) ** 2 * Math.sin(time * 2.9);
          const k = name.startsWith('head') ? 1 : 0.28;
          nod = dir * 0.05 * k * talk * settled;
          o.position.y += 0.011 * k * talk * settled;
          o.position.x -= dir * 0.012 * k * Math.sin(t) * settled;
        }
        o.rotation.z = from[3] * away + nod;
        o.visible = away < 0.999;
      }
      figure.rotation.y = shadow.rotation.z = turn + lean;
      (shadow.material as THREE.MeshBasicMaterial).opacity = smoother(0.22, 0.5, inn) * (1 - smoother(0.3, 0.7, out));
    },
    dispose() { group.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); }); mat.dispose(); (shadow.material as THREE.MeshBasicMaterial).map?.dispose(); (shadow.material as THREE.Material).dispose(); },
  };
}
