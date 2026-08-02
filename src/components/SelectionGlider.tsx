'use client';

import { useLayoutEffect, useRef } from 'react';

export default function SelectionGlider({
  activeKey,
  className = '',
}: {
  activeKey: string;
  className?: string;
}) {
  const gliderRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const glider = gliderRef.current;
    const group = glider?.parentElement;
    if (!glider || !group) return;

    let readyFrame = 0;
    const target = group.querySelector<HTMLElement>(`[data-selection-key="${activeKey}"]`);

    const measure = () => {
      if (!target) return;
      const groupRect = group.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      glider.style.setProperty('--selection-x', `${targetRect.left - groupRect.left}px`);
      glider.style.setProperty('--selection-y', `${targetRect.top - groupRect.top}px`);
      glider.style.setProperty('--selection-width', `${targetRect.width}px`);
      glider.style.setProperty('--selection-height', `${targetRect.height}px`);

      if (glider.dataset.ready !== 'true') {
        readyFrame = requestAnimationFrame(() => { glider.dataset.ready = 'true'; });
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    if (target) observer.observe(target);

    return () => {
      cancelAnimationFrame(readyFrame);
      observer.disconnect();
    };
  }, [activeKey]);

  return (
    <span
      ref={gliderRef}
      className={`selection-glider ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
