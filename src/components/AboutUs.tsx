'use client';

import { useState } from 'react';
import { type T } from '@/data/translations';
import Disclosure from './Disclosure';
import Reveal from './Reveal';
import SelectionGlider from './SelectionGlider';

type AboutTab = 'studio' | 'can';

export default function AboutUs({ t }: { t: T }) {
  const [active, setActive] = useState<AboutTab>('studio');

  const tabs: Array<{ id: AboutTab; label: string }> = [
    { id: 'studio', label: t.about.tabs.studio },
    { id: 'can', label: t.about.tabs.can },
  ];

  return (
    <section className="section page-section about-page" id="about">
      <div className="page-hero">
        <p className="cover-kicker mono">{t.nav.about}</p>
        <h1 className="page-title display">{t.about.headline}</h1>
        <p className="page-sub">{t.about.extended}</p>
      </div>

      <div className="profile-shell">
        <div className="profile-tabs" role="tablist" aria-label={t.nav.about}>
          <SelectionGlider activeKey={active} className="selection-glider--profile" />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`profile-tab ${active === tab.id ? 'is-active' : ''}`}
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`about-panel-${tab.id}`}
              id={`about-tab-${tab.id}`}
              data-selection-key={tab.id}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="profile-panel"
          id={`about-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`about-tab-${active}`}
        >
          {active === 'studio' && (
            <Reveal>
              <div className="about-company-grid">
                <div>
                  <span className="profile-panel-kicker mono" lang="en">Canquesse AI Solutions</span>
                  <h2 className="profile-panel-title display">{t.about.companyTitle}</h2>
                </div>
                <p className="profile-panel-copy">{t.about.companyBody}</p>
              </div>
            </Reveal>
          )}

          {active === 'can' && (
            <Reveal>
              <div className="can-profile">
                <div className="can-profile-head">
                  <span className="profile-panel-kicker mono">{t.about.founderTitle}</span>
                  <div className="founder-head">
                    <span className="founder-name display">{t.founder.name}</span>
                    <span className="founder-role mono">{t.founder.role}</span>
                    <span className="founder-studio mono">{t.founder.studioLine}</span>
                  </div>
                  <p className="founder-bio">{t.founder.bio}</p>
                </div>

                <div className="can-profile-grid">
                  <div>
                    <h3 className="profile-subtitle mono">{t.about.experienceTitle}</h3>
                    <div className="disc-list">
                      {t.experience.map((exp, i) => (
                        <Disclosure
                          key={i}
                          defaultOpen={i === 0}
                          title={exp.company}
                          meta={
                            <>
                              <span className="disc-role">{exp.role}</span>
                              <span className="dot"> · </span>{exp.period}
                            </>
                          }
                        >
                          <p className="disc-desc">{exp.desc}</p>
                          {exp.bullets.length > 0 && (
                            <ul className="disc-bullets">
                              {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                            </ul>
                          )}
                        </Disclosure>
                      ))}
                    </div>
                  </div>

                  <div className="education-panel">
                    <h3 className="profile-subtitle mono">{t.about.educationTitle}</h3>
                    <span className="edu-school display">{t.education.field}</span>
                    <span className="edu-meta mono">
                      {t.education.school}<span className="dot"> · </span>{t.education.period}
                    </span>
                    <div className="disc-tags">
                      {t.education.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
