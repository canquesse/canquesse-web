'use client';
import { type Lang } from '@/data/translations';
import SelectionGlider from './SelectionGlider';

const LANGS: Lang[] = ['de', 'en', 'tr'];
const FLAGS: Record<Lang, string> = { de: '🇩🇪', en: '🇬🇧', tr: '🇹🇷' };
const LABELS: Record<Lang, string> = { de: 'Deutsch', en: 'English', tr: 'Türkçe' };

export default function LangSwitcher({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="lang" role="group" aria-label="Language">
      <SelectionGlider activeKey={lang} className="selection-glider--lang" />
      {LANGS.map((l, i) => (
        <span key={l} className="lang-option">
          {i > 0 && <span className="lang-sep" aria-hidden="true">/</span>}
          <button
            className="lang-btn"
            aria-pressed={lang === l}
            aria-label={LABELS[l]}
            data-selection-key={l}
            onClick={() => setLang(l)}
          >
            <span className="lang-code">{l.toUpperCase()}</span>
            <span className="lang-flag" aria-hidden="true">{FLAGS[l]}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
