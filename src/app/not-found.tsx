'use client';
import Link from 'next/link';
import { useLang } from '@/components/LangProvider';

export default function NotFound() {
  const { t } = useLang();

  return (
    <section className="section page-section notfound">
      <div className="page-hero notfound-hero">
        <p className="cover-kicker mono">{t.notFound.kicker}</p>
        <p className="notfound-code mono">404</p>
        <h1 className="page-title display">{t.notFound.title}</h1>
        <p className="page-sub">{t.notFound.desc}</p>
        <div className="home-cta">
          <Link href="/" className="btn-primary">{t.notFound.home}</Link>
          <Link href="/contact/" className="btn-ghost">{t.notFound.contact}</Link>
        </div>
      </div>

      <nav className="notfound-index" aria-label={t.nav.solutions}>
        <Link className="notfound-index-row" href="/solutions/">
          <span className="notfound-index-name">{t.nav.solutions}</span>
          <span className="notfound-index-arrow" aria-hidden="true">↗</span>
        </Link>
        <Link className="notfound-index-row" href="/about/">
          <span className="notfound-index-name">{t.nav.about}</span>
          <span className="notfound-index-arrow" aria-hidden="true">↗</span>
        </Link>
        <Link className="notfound-index-row" href="/contact/">
          <span className="notfound-index-name">{t.nav.contact}</span>
          <span className="notfound-index-arrow" aria-hidden="true">↗</span>
        </Link>
      </nav>
    </section>
  );
}
