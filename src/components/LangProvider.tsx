'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { translations, type Lang, type T } from '@/data/translations';

const LANGS: Lang[] = ['de', 'en', 'tr'];
const LANGUAGE_NAMES: Record<Lang, string> = {
  tr: 'TÜRKÇE',
  en: 'ENGLISH',
  de: 'DEUTSCH',
};
const LANGUAGE_GLYPHS: Record<Lang, string[]> = {
  tr: ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'],
  en: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  de: ['A', 'Ä', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'Q', 'R', 'S', 'ß', 'T', 'U', 'Ü', 'V', 'W', 'X', 'Y', 'Z'],
};
const SHIFT_LABEL: Record<Lang, string> = {
  tr: 'DİL DEĞİŞİMİ',
  en: 'LANGUAGE SHIFT',
  de: 'SPRACHWECHSEL',
};

type LanguageFlight = { from: Lang; to: Lang; id: number };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: T };
const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);
  const [flight, setFlight] = useState<LanguageFlight | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cq_lang') as Lang | null;
      if (saved && LANGS.includes(saved)) {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {}
    setReady(true);

    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      document.documentElement.classList.remove('lang-transitioning', 'lang-stage-exit', 'lang-stage-enter');
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('cq_lang', lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang, ready]);

  const setLang = useCallback((next: Lang) => {
    if (next === lang || flight) return;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    root.classList.remove('lang-stage-exit', 'lang-stage-enter');

    if (reduceMotion) {
      setLangState(next);
      return;
    }

    setFlight({ from: lang, to: next, id: Date.now() });
    root.classList.add('lang-transitioning', 'lang-stage-exit');
    const swapTimer = window.setTimeout(() => {
      setLangState(next);
      root.classList.remove('lang-stage-exit');
      window.requestAnimationFrame(() => {
        root.classList.add('lang-stage-enter');
      });
    }, 420);
    const finishTimer = window.setTimeout(() => {
      root.classList.remove('lang-transitioning', 'lang-stage-enter');
      setFlight(null);
    }, 1120);
    timers.current.push(swapTimer, finishTimer);
  }, [flight, lang]);

  const flightRows = flight ? [
    {
      kind: 'route',
      characters: Array.from(`${LANGUAGE_NAMES[flight.from]}  /  ${flight.from.toUpperCase()}  →  ${flight.to.toUpperCase()}  /  ${LANGUAGE_NAMES[flight.to]}`),
    },
    {
      kind: 'alphabet',
      characters: LANGUAGE_GLYPHS[flight.to],
    },
    {
      kind: 'brand',
      characters: Array.from(`CANQUESSE  /  ${flight.from.toUpperCase()}  →  ${flight.to.toUpperCase()}  /  ${SHIFT_LABEL[flight.to]}`),
    },
  ] : [];

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
      {flight && createPortal(
        <div className="lang-flight" aria-hidden="true" key={flight.id}>
          {flightRows.map((row, rowIndex) => (
            <div
              className={`lang-flight-row lang-flight-row--${row.kind} ${rowIndex % 2 ? 'is-reverse' : ''}`}
              key={`${flight.id}-${rowIndex}`}
              style={{
                '--flight-row': rowIndex,
                '--row-delay': `${rowIndex * 35}ms`,
              } as CSSProperties}
            >
              <div className={`lang-flight-copy lang-flight-copy--${row.kind}`}>
                {row.characters.map((character, charIndex) => {
                  const direction = (charIndex + rowIndex) % 2 ? 1 : -1;
                  const isAlphabet = row.kind === 'alphabet';
                  return (
                    <span
                      className="lang-flight-char"
                      key={`${charIndex}-${character}`}
                      style={{
                        '--char-index': charIndex,
                        '--char-in': `${direction * (isAlphabet ? 12 + (charIndex % 3) * 3 : 42 + (charIndex % 4) * 13)}px`,
                        '--char-out': `${direction * -1 * (isAlphabet ? 14 + (charIndex % 3) * 3 : 54 + (charIndex % 5) * 11)}px`,
                        '--char-rotate': `${direction * (isAlphabet ? 1.4 : 5 + (charIndex % 3) * 4)}deg`,
                        '--char-rotate-out': `${direction * -1 * (isAlphabet ? 1.8 : 5 + (charIndex % 3) * 4)}deg`,
                        '--char-delay': isAlphabet ? '88ms' : `${80 + rowIndex * 35 + charIndex * 4}ms`,
                      } as CSSProperties}
                    >
                      {character === ' ' ? '\u00A0' : character}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="lang-flight-counter mono">
            <span>{flight.from.toUpperCase()}</span>
            <span aria-hidden="true">↗</span>
            <span>{flight.to.toUpperCase()}</span>
          </div>
        </div>,
        document.body,
      )}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
