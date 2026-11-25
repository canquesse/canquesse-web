/**
 * The CQ sculpture: the Meshy model, prepared for the web (see README, "Model").
 *
 * Besides position / normal / uv every vertex carries
 *   _t     where it lies along its stroke, 0..1, measured square to the stroke
 *   _part  0 = the C running out into the tail, 1 = the ring of the Q
 *
 * It is drawn in one gesture, like metal leaving a die: a clean cut travels along the C, hot at the
 * face and cooling behind it. The ring opens out from behind the C in both directions and closes
 * behind the tail, so neither its beginning nor its end is ever seen; the tail finishes last.
 * Posing and flexing happen in the vertex shader (uM0 now, uM1 trailing).
 */
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms as Shader } from 'three';
import { Curve } from './score';

/** model units → stage units */
export const SCULPT = 5.1;
/** the clear spot inside the C, in stage units: the camera leaves the hero through it */
export const SCULPT_HOLE: [number, number, number] = [-0.428 * SCULPT, 0.18 * SCULPT, 0.06 * SCULPT];

/** the spine of the C stroke, start to tail: the camera follows the pen along it */
const SPINE = [[-0.066, 0.383, -0.161], [-0.106, 0.431, -0.12], [-0.183, 0.477, -0.067], [-0.279, 0.493, -0.028], [-0.377, 0.495, 0.009], [-0.476, 0.47, 0.031], [-0.571, 0.43, 0.052], [-0.661, 0.379, 0.063], [-0.74, 0.31, 0.071], [-0.793, 0.222, 0.06], [-0.821, 0.121, 0.053], [-0.815, 0.017, 0.051], [-0.779, -0.08, 0.064], [-0.717, -0.159, 0.091], [-0.63, -0.205, 0.127], [-0.537, -0.227, 0.168], [-0.438, -0.219, 0.203], [-0.339, -0.19, 0.219], [-0.244, -0.149, 0.214], [-0.156, -0.111, 0.171], [-0.082, -0.099, 0.1], [-0.05, -0.156, 0.023], [0.001, -0.243, 0.005], [0.073, -0.317, 0.019], [0.161, -0.372, 0.033], [0.254, -0.417, 0.047], [0.349, -0.456, 0.07], [0.447, -0.491, 0.081], [0.547, -0.521, 0.088], [0.65, -0.533, 0.099], [0.754, -0.534, 0.084], [0.853, -0.53, 0.05], [0.92, -0.525, 0.019]];
const penX = new Curve(SPINE.map((_, i) => i / (SPINE.length - 1)), SPINE.map((p) => p[0]));
const penY = new Curve(SPINE.map((_, i) => i / (SPINE.length - 1)), SPINE.map((p) => p[1]));
const penZ = new Curve(SPINE.map((_, i) => i / (SPINE.length - 1)), SPINE.map((p) => p[2]));

const DEFORM = /* glsl */ `
  attribute float _t; attribute float _part;
  uniform mat4 uM0, uM1; uniform vec3 uFocus; uniform float uHead, uLag, uTime, uLive, uVel;
  varying float vCut, vOrder;
  vec3 drawn(vec3 p){
    float k = clamp((uHead - .632) / .288, 0., 1.);
    float h = mix(uHead * 1.03, mix(k, k * k * (3. - 2. * k), .5) * 1.03, step(.5, _part));
    vCut = uHead > .9995 ? -9. : _t - h;
    vOrder = mix(_t, .632 + .288 * _t, _part);
    float a = _t * mix(9., 6.28318531, _part);
    float r = uLive * (.006 * sin(a + _part * 2. - uTime * .9) + uVel * .014 * sin(a - uTime * 2.1));
    return p + vec3(0., r, r * .8);
  }
  float late(vec3 p){ return min(1., length((p - uFocus) * vec3(1., .6, .6)) * uLag); }
`;
const bendVertex = (src: string, withNormal: boolean) => {
  src = src.replace('#include <common>', `#include <common>\n${DEFORM}\nvarying float vT; varying vec3 vSmooth;`);
  if (withNormal) src = src.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
    float lk = late(position);
    objectNormal = normalize(mix(mat3(uM0) * objectNormal, mat3(uM1) * objectNormal, lk));
    vSmooth = normalMatrix * objectNormal; vT = _t + _part * .4;`);
  return src.replace('#include <begin_vertex>', `
    vec3 dp = drawn(position);
    vec3 transformed = mix(uM0 * vec4(dp, 1.), uM1 * vec4(dp, 1.), late(dp)).xyz;
    ${withNormal ? '' : 'vT = 0.; vSmooth = vec3(0.);'}`);
};

/** what the lacquer and the metal are, for the sculpture and the ribbon alike */
export const DAYLIGHT = /* glsl */ `
  // the scan was baked dark, this brings it into the page's daylight
  vec3 daylight(vec3 c, float gold){
    return mix(pow(c, vec3(.86)) * vec3(1.5, 1.1, 1.1), pow(c, vec3(.8)) * vec3(1.78, 1.56, 1.38), gold);
  }
`;
export const COAT = { clearcoat: 0.6, clearcoatRoughness: 0.16, envMapIntensity: 1.3 };

/** one dropped connection must not cost the sculpture: try twice more before giving up */
async function get(url: string, tries = 3): Promise<Response> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url}: ${res.status}`);
      return res;
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 350 * i));
    }
  }
}

async function bitmap(url: string, srgb: boolean, tick: () => void) {
  const res = await get(url);
  const img = await createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  const t = new THREE.Texture(img);
  t.flipY = false; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  tick();
  return t;
}

/** the model's own surfaces, straightened into seamless bands for the ribbon */
export async function loadBands(renderer: THREE.WebGLRenderer, tick: () => void) {
  const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/models/`;
  const [red, gold, redN, goldN] = await Promise.all(['red', 'gold', 'red-n', 'gold-n'].map((n, i) => bitmap(`${base}strip-${n}.webp`, i < 2, tick)));
  for (const t of [red, gold, redN, goldN]) { t.wrapT = THREE.MirroredRepeatWrapping; renderer.initTexture(t); }
  return { red, gold, redN, goldN };
}

export type Sculpture = Awaited<ReturnType<typeof loadSculpture>>;

export async function loadSculpture(renderer: THREE.WebGLRenderer, shared: Record<string, { value: unknown }>, small: boolean, progress: (p: number) => void) {
  let n = 0;
  const tick = () => progress(++n / 4);
  const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/models/`;
  const geometry = async () => {
    const [{ GLTFLoader }, { MeshoptDecoder }, buf] = await Promise.all([
      import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js'),
      get(`${base}cq.glb`).then((r) => r.arrayBuffer()),
    ]);
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buf, '');
    let src: THREE.Mesh | undefined;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) src = o as THREE.Mesh; });
    const g = src!.geometry, out = new THREE.BufferGeometry();
    // unpack the quantized attributes; positions also carry the node's transform
    const unpack = (name: string, as = name) => {
      const a = g.getAttribute(name), arr = new Float32Array(a.count * a.itemSize);
      for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) arr[i * a.itemSize + k] = a.getComponent(i, k);
      out.setAttribute(as, new THREE.BufferAttribute(arr, a.itemSize));
    };
    unpack('position'); unpack('normal'); unpack('uv'); unpack('_t'); unpack('_part');
    out.getAttribute('position').applyMatrix4(src!.matrixWorld);
    out.setIndex(g.getIndex());
    tick();
    return out;
  };
  const [geo, color, normal, rough] = await Promise.all([
    geometry(), bitmap(`${base}cq-color-${small ? '2k' : '4k'}.webp`, true, tick), bitmap(`${base}cq-normal.webp`, false, tick), bitmap(`${base}cq-rough.webp`, false, tick),
  ]);

  const uniforms = {
    ...shared,
    uM0: { value: new THREE.Matrix4() }, uM1: { value: new THREE.Matrix4() }, uFocus: { value: new THREE.Vector3() },
    uHead: { value: 1 }, uHot: { value: 0 }, uLag: { value: 0 }, uTime: { value: 0 }, uLive: { value: 1 }, uVel: { value: 0 },
  };
  const mat = new THREE.MeshPhysicalMaterial({ map: color, normalMap: normal, roughnessMap: rough, roughness: 1, metalness: 1, side: THREE.DoubleSide, ...COAT });
  mat.onBeforeCompile = (sh: Shader) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = bendVertex(sh.vertexShader, true);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying float vT, vCut, vOrder; varying vec3 vSmooth;
        uniform float uHot;
        uniform float uGlass, uTint, uAspect; uniform vec3 uBg, uPale; uniform vec2 uRes;
        uniform sampler2D uPage, uBack;
        float gGold;
        ${DAYLIGHT}
        vec3 pageAt(vec2 uv){ vec4 t = texture2D(uPage, uv); return mix(uBg, t.rgb / max(t.a, .001), t.a); }
        vec3 filmic(vec3 x){ return clamp((x*(2.35*x+.04))/(x*(2.25*x+.55)+.12), 0., 1.); }`)
      .replace('#include <color_fragment>', `
        if (vCut > 0.) discard;
        gGold = smoothstep(.18, .5, diffuseColor.g / max(diffuseColor.r, .02));
        vec3 pale = uPale * (.72 + .5 * smoothstep(0., .5, dot(diffuseColor.rgb, vec3(.5, .3, .2))));
        diffuseColor.rgb = daylight(diffuseColor.rgb, gGold);
        // bare metal first, then the lacquer runs along the stroke
        float pour = (1. - uTint) * 1.3;
        float bare = uTint > .0005 ? smoothstep(pour - .26, pour, vOrder) : 0.;
        diffuseColor.rgb = mix(diffuseColor.rgb, pale, bare);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.), uGlass * .9);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor + .14, .06, uGlass);`)
      .replace('#include <metalnessmap_fragment>', `float metalnessFactor = mix(mix(mix(.46, .82, gGold), .86, bare), 0., uGlass);`)
      .replace('#include <opaque_fragment>', `
        outgoingLight = filmic(outgoingLight * 1.02);
        if (uHot > .001) {
          // the cut face glows, the metal behind it cools from cream over coral back to itself
          float heat = exp(min(vCut, 0.) * 21.);
          vec3 glow = mix(vec3(.86, .15, .06), vec3(1., .50, .24), smoothstep(.06, .5, heat));
          glow = mix(glow, vec3(1., .90, .74), smoothstep(.45, 1., heat));
          glow *= .7 + .36 * abs(dot(normalize(vViewPosition), normal)) + .25 * clamp(normal.y, 0., 1.);
          outgoingLight = mix(outgoingLight, glow, smoothstep(.015, .85, heat) * uHot);
          if (!gl_FrontFacing && vCut > -8.) outgoingLight = mix(outgoingLight, vec3(1., .95, .84), uHot);
        }
        if (uGlass > .001) {
          vec2 suv = gl_FragCoord.xy / uRes;
          vec3 nv = normalize(vSmooth);
          vec2 off = -nv.xy * vec2(1. / uAspect, 1.) * .044;
          vec3 bent = vec3(pageAt(suv + off * .9).r, pageAt(suv + off).g, pageAt(suv + off * 1.12).b);
          vec4 inner = texture2D(uBack, suv + off * .55);
          bent *= mix(vec3(1.), inner.rgb, inner.a);
          float fres = pow(1. - clamp(abs(dot(normalize(vViewPosition), nv)), 0., 1.), 2.2);
          vec3 body = mix(vec3(1., .945, .93), vec3(.74, .07, .09), clamp(fres * 1.05 + gGold * .05, 0., .9));
          vec3 spec = filmic((totalSpecular * 1.1 + clearcoatSpecularDirect + clearcoatSpecularIndirect * 1.4) * .62);
          vec3 irid = .5 + .5 * cos(6.283 * (fres * 1.3 + vT * 3. + vec3(0., .33, .67)));
          outgoingLight = mix(outgoingLight, bent * body + spec + irid * fres * .16, uGlass);
        }
        #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => 'sculpture';

  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  depth.onBeforeCompile = (sh: Shader) => { Object.assign(sh.uniforms, uniforms); sh.vertexShader = bendVertex(sh.vertexShader, false); sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'varying float vCut;\nvoid main() {\nif (vCut > 0.) discard;'); };
  depth.customProgramCacheKey = () => 'sculpture-depth';

  // the far side, seen through the glass
  const back = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthFunc: THREE.GreaterEqualDepth, uniforms,
    vertexShader: `${DEFORM} varying vec3 vN; varying vec3 vV;
      void main(){ vec3 dp = drawn(position); float k = late(dp);
        vec4 mv = modelViewMatrix * vec4(mix(uM0 * vec4(dp, 1.), uM1 * vec4(dp, 1.), k).xyz, 1.);
        vV = -mv.xyz; vN = normalMatrix * mix(mat3(uM0) * normal, mat3(uM1) * normal, k); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; varying float vCut;
      void main(){ if (vCut > 0.) discard; float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.6);
        gl_FragColor = vec4(mix(vec3(1., .955, .945), vec3(.70, .08, .10), clamp(f * .85, 0., 1.)), 1.); }`,
  });

  const mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material> = new THREE.Mesh(geo, mat);
  mesh.customDepthMaterial = depth;
  mesh.castShadow = true; mesh.frustumCulled = false; mesh.visible = false;
  for (const t of [color, normal, rough]) renderer.initTexture(t);

  return {
    mesh, mat, back, uniforms,
    /** m0 / m1: 3x4 row matrices in stage units */
    pose(m0: Float64Array, m1: Float64Array, focus: [number, number, number], lag: number) {
      const put = (t: THREE.Matrix4, m: Float64Array) => t.set(
        m[0] * SCULPT, m[1] * SCULPT, m[2] * SCULPT, m[3], m[4] * SCULPT, m[5] * SCULPT, m[6] * SCULPT, m[7],
        m[8] * SCULPT, m[9] * SCULPT, m[10] * SCULPT, m[11], 0, 0, 0, 1);
      put(uniforms.uM0.value, m0); put(uniforms.uM1.value, m1);
      uniforms.uFocus.value.set(focus[0] / SCULPT, focus[1] / SCULPT, focus[2] / SCULPT);
      uniforms.uLag.value = lag * SCULPT;
    },
    /** where the pen is, in stage units */
    pen(head: number): [number, number, number] { const u = Math.min(1, head * 1.03); return [penX.at(u) * SCULPT, penY.at(u) * SCULPT, penZ.at(u) * SCULPT]; },
    dispose() { geo.dispose(); mat.dispose(); back.dispose(); depth.dispose(); [color, normal, rough].forEach((t) => t.dispose()); },
  };
}
