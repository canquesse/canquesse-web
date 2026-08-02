'use client';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useLang } from '@/components/LangProvider';
import { portfolio } from '@/data/portfolio';
import Reveal from '@/components/Reveal';
import TechMarquee from '@/components/TechMarquee';
import Tesseract from '@/components/Tesseract';
import ScrollChapters from '@/components/ScrollChapters';
import ReadinessCheck from '@/components/ReadinessCheck';

export default function Home() {
  const { t } = useLang();
  const featured = portfolio.projects.slice(0, 3);
  const words = t.home.lede.split(' ');

  return (
    <>
      <ScrollChapters />
      {/* Hero — oversized headline over a full-bleed interactive tesseract */}
      <section className="home-hero" id="top">
        <Tesseract />
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <p className="cover-kicker mono" lang="en">{t.home.eyebrow}</p>
            <h1 className="home-h1 display" aria-label={t.home.lede}>
              {words.map((w, i) => (
                <span className="hw" key={i} style={{ '--i': i } as CSSProperties} aria-hidden="true">
                  {w}
                </span>
              ))}
            </h1>
            <p className="home-sub">{t.home.sub}</p>
            <div className="home-cta">
              <Link href="/solutions" className="btn-primary">{t.home.ctaPrimary}</Link>
              <Link href="#process" className="btn-ghost btn-process">{t.home.ctaSecondary}</Link>
            </div>
          </div>

          <div className="hero-proof" aria-label="Canquesse proof points">
            {t.home.proof.map((item) => (
              <div className="hero-proof-item" key={item.label}>
                <span className="hero-proof-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TechMarquee />

      {/* Selected work */}
      <section className="section section--operating scroll-chapter" data-scroll-chapter>
        <div className="section-head">
          <h2 className="section-label">{t.solutionsPage.work}</h2>
          <span className="section-rule" />
          <Link href="/solutions" className="section-more mono">{t.home.ctaPrimary}</Link>
        </div>
        <div className="work-index">
          {featured.map((p, i) => {
            const tp = t.projects[i];
            return (
              <Reveal key={p.id} delay={i * 90}>
                <a
                  className="hero-row"
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${p.name} — ${tp?.tagline ?? ''}`}
                >
                  <span className="hero-row-name">{p.name}</span>
                  <span className="hero-row-tagline">{tp?.tagline}</span>
                  <span className="hero-row-meta">{t.statusMap[p.status]}</span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Operating model */}
      <section className="section scroll-chapter" id="process" data-scroll-chapter>
        <div className="section-head">
          <h2 className="section-label">{t.home.approach.label}</h2>
          <span className="section-rule" />
        </div>

        <div className="approach-layout">
          <Reveal>
            <div className="approach-copy">
              <h2 className="approach-title display">{t.home.approach.title}</h2>
              <p className="approach-desc">{t.home.approach.desc}</p>
            </div>
          </Reveal>
          <div className="approach-steps">
            {t.home.approach.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <article className="approach-step">
                  <h3 className="approach-step-title display">{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section scroll-chapter" data-scroll-chapter>
        <div className="section-head">
          <h2 className="section-label">{t.capabilities.label}</h2>
          <span className="section-rule" />
        </div>

        <div className="caps-grid">
          {t.capabilities.items.map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="cap-card">
                <h3 className="cap-card-title display">{c.title}</h3>
                <p className="cap-card-desc">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Signal band */}
      <section className="section scroll-chapter" data-scroll-chapter>
        <Reveal>
          <ReadinessCheck copy={t.home.signal} />
        </Reveal>
      </section>

      {/* Project outcomes */}
      <section className="section section--last scroll-chapter" data-scroll-chapter>
        <Reveal>
          <div className="outcome-band">
            <span className="outcome-label mono">{t.home.outcomes.label}</span>
            <div className="outcome-grid">
              {t.home.outcomes.items.map((item) => (
                <article className="outcome-item" key={item.title}>
                  <h2 className="display">{item.title}</h2>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
