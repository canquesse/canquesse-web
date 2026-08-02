'use client';

import { useLang } from './LangProvider';
import LogoMark from './LogoMark';

export default function TechMarquee() {
  const { t } = useLang();
  const row = [...t.home.marquee, ...t.home.marquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((concept, i) => (
          <span key={i} className="marquee-item">
            {concept}
            <span className="marquee-sep"><LogoMark className="marquee-mark" /></span>
          </span>
        ))}
      </div>
    </div>
  );
}
