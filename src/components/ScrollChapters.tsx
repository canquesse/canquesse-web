'use client';

import { useEffect } from 'react';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const documentTop = (element: HTMLElement) => {
  let top = 0;
  let node: HTMLElement | null = element;

  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }

  return top;
};

export default function ScrollChapters() {
  useEffect(() => {
    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-chapter]')
    );
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!chapters.length || reduceMotion.matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;

      chapters.forEach((chapter) => {
        const top = documentTop(chapter) - window.scrollY;
        const bottom = top + chapter.offsetHeight;
        const isNear = bottom > -viewport * 0.2 && top < viewport * 1.2;
        const entry = clamp((viewport - top) / (viewport * 0.72));
        const exit = clamp((viewport * 0.42 - bottom) / (viewport * 0.56));

        const scaleX = 0.95 + entry * 0.05 - exit * 0.045;
        const scaleY = 0.88 + entry * 0.12 - exit * 0.2;
        const translateY = (1 - entry) * 56 - exit * 54;
        const opacity = Math.max(0.18, 0.2 + entry * 0.8 - exit * 0.62);

        chapter.style.setProperty('--chapter-scale-x', scaleX.toFixed(4));
        chapter.style.setProperty('--chapter-scale-y', scaleY.toFixed(4));
        chapter.style.setProperty('--chapter-y', `${translateY.toFixed(2)}px`);
        chapter.style.setProperty('--chapter-opacity', opacity.toFixed(3));
        chapter.style.setProperty('--chapter-exit', exit.toFixed(3));
        chapter.classList.toggle('is-scroll-active', isNear);
      });
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(schedule);
    chapters.forEach((chapter) => resizeObserver.observe(chapter));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      chapters.forEach((chapter) => {
        chapter.style.removeProperty('--chapter-scale-x');
        chapter.style.removeProperty('--chapter-scale-y');
        chapter.style.removeProperty('--chapter-y');
        chapter.style.removeProperty('--chapter-opacity');
        chapter.style.removeProperty('--chapter-exit');
        chapter.classList.remove('is-scroll-active');
      });
    };
  }, []);

  return null;
}
