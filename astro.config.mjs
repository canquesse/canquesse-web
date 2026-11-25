import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://canquesse.com',
  output: 'static',
  devToolbar: { enabled: false },
  vite: {
    // known up front, so the dev server never has to re-bundle in the middle of a page load
    optimizeDeps: {
      include: [
        'three', 'three/addons/loaders/GLTFLoader.js', 'three/addons/libs/meshopt_decoder.module.js', 'three/addons/geometries/RoundedBoxGeometry.js',
        'gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'gsap/CustomEase', 'lenis',
      ],
    },
  },
});
