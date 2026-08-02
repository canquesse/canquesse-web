'use client';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

type Theme = 'dark' | 'light';
type ThemeTransition = {
  x: number;
  y: number;
  next: Theme;
};

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [transition, setTransition] = useState<ThemeTransition | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const current = (document.documentElement.getAttribute('data-theme') as Theme) || 'dark';
      setTheme(current);
    }, 0);
    return () => {
      window.clearTimeout(id);
      timers.current.forEach((timer) => window.clearTimeout(timer));
      document.documentElement.classList.remove('theme-transitioning');
    };
  }, []);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    if (transition || root.classList.contains('theme-transitioning')) return;

    const next = theme === 'dark' ? 'light' : 'dark';
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const x = buttonRect.left + buttonRect.width / 2;
    const y = buttonRect.top + buttonRect.height / 2;

    const applyTheme = () => {
      setTheme(next);
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('cq_theme', next); } catch {}
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme();
      return;
    }

    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    root.classList.add('theme-transitioning');
    setTransition({ x, y, next });

    const swapTimer = window.setTimeout(() => {
      applyTheme();
    }, 540);
    const finishTimer = window.setTimeout(() => {
      setTransition(null);
      root.classList.remove('theme-transitioning');
    }, 1080);
    timers.current.push(swapTimer, finishTimer);
  }

  return (
    <>
      <button
        className={`theme-toggle ${transition ? 'is-transitioning' : ''}`}
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'light' : 'dark'}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </button>

      {transition && createPortal(
        <div
          className="theme-cut"
          data-next-theme={transition.next}
          aria-hidden="true"
          style={{
            '--cut-x': `${transition.x}px`,
            '--cut-y': `${transition.y}px`,
          } as CSSProperties}
        >
          <span className="theme-cut-blade theme-cut-blade--wide" />
          <span className="theme-cut-blade theme-cut-blade--narrow" />
          <span className="theme-cut-blade theme-cut-blade--counter" />
          <span className="theme-cut-trace" />
          <span className="theme-cut-cross theme-cut-cross--h" />
          <span className="theme-cut-cross theme-cut-cross--v" />
        </div>,
        document.body,
      )}
    </>
  );
}
