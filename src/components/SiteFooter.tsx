'use client';
import { config } from '@/lib/config';
import { useLang } from './LangProvider';
import LogoMark from './LogoMark';
import Wordmark from './Wordmark';

export default function SiteFooter() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <span className="footer-rule" aria-hidden="true" />

      <div className="footer-grid">
        <div className="footer-brand">
          <span className="footer-wordmark">
            <LogoMark />
            <Wordmark className="footer-wordmark-img" />
          </span>
          <p className="footer-motto">{t.footer.motto}</p>
        </div>

        <nav className="footer-links mono" aria-label={t.nav.contact}>
          {config.links.map((l, index) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
              <span className="fl-label">{t.footer.links[index]}</span>
              <span className="fl-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="footer-base mono">
        <span>© {year} Canquesse — {t.studio}</span>
        <button
          type="button"
          className="to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {t.footer.toTop} <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
