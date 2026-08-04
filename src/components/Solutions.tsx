import { portfolio } from '@/data/portfolio';
import { type T } from '@/data/translations';
import Disclosure from './Disclosure';
import Reveal from './Reveal';

const statusClass = (s: string) =>
  s === 'canlı' ? 'live' : s === 'wip' ? 'wip' : 'arch';

export default function Solutions({ t }: { t: T }) {
  return (
    <section className="section page-section solutions-page" id="solutions">
      <div className="page-hero">
        <p className="cover-kicker mono">{t.solutionsPage.eyebrow}</p>
        <h1 className="page-title display">{t.solutionsPage.title}</h1>
        <p className="page-sub">{t.solutionsPage.desc}</p>
      </div>

      <div className="section-head section-head--tight">
        <h2 className="section-label">{t.solutionsPage.framework}</h2>
        <span className="section-rule" />
      </div>

      <div className="solution-suite">
        {t.capabilities.items.map((capability, i) => (
          <Reveal key={capability.title} delay={i * 80}>
            <article className="solution-lane">
              <h2 className="solution-lane-title display">{capability.title}</h2>
              <p>{capability.desc}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="section-head section-head--work">
        <h2 className="section-label">{t.solutionsPage.work}</h2>
        <span className="section-rule" />
      </div>

      <div className="disc-list work-ledger">
        {portfolio.projects.map((p, i) => {
          const tp = t.projects[i];
          return (
            <Disclosure
              key={p.id}
              defaultOpen={i === 0}
              title={p.name}
              meta={
                <>
                  {tp?.tagline}
                  <span className="dot"> · </span>{p.year}
                  <span className="dot"> · </span>
                  <span className={`work-status work-status--${statusClass(p.status)}`}>
                    {t.statusMap[p.status]}
                  </span>
                </>
              }
            >
              <p className="disc-desc">{tp?.desc}</p>
              {tp && tp.bullets.length > 0 && (
                <ul className="disc-bullets">
                  {tp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
              <div className="disc-tags">
                {p.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
              {p.href && (
                <div className="work-actions">
                  <a className="work-link" href={p.href} target="_blank" rel="noreferrer">
                    {p.link === 'instagram'
                      ? t.projectMeta.instagram
                      : t.contact.viewProject.replace(' ↗', '')}
                    <span className="arrow"> ↗</span>
                  </a>
                  {/* Kaynak kapalıysa bunu söylüyoruz — ziyaretçiyi olmayan bir
                      repoya göndermektense durumu belirtmek daha dürüst. */}
                  {p.privateRepo && (
                    <span className="work-private mono">{t.projectMeta.privateRepo}</span>
                  )}
                </div>
              )}
            </Disclosure>
          );
        })}
      </div>
      <div className="work-archive-action">
        <a
          className="section-more mono"
          href="https://github.com/canquesse?tab=repositories"
          target="_blank"
          rel="noreferrer"
        >
          {t.solutionsPage.allProjects}
        </a>
      </div>
    </section>
  );
}
