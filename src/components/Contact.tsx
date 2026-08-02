import { config } from '@/lib/config';
import { portfolio } from '@/data/portfolio';
import { type T } from '@/data/translations';

export default function Contact({ t }: { t: T }) {
  return (
    <section className="section page-section contact" id="contact">
      <div className="page-hero contact-hero">
        <p className="cover-kicker mono">{t.nav.contact}</p>
        <h1 className="contact-title display">{t.contact.big}</h1>
        <p className="page-sub">{t.contact.sub}</p>
      </div>

      <div className="contact-grid">
        <div className="contact-links" aria-label={t.nav.contact}>
          {/* Etiketler çeviriden gelir — config.links[].label sabit Türkçe
              ("E-POSTA") olduğu için her dilde aynı görünüyordu. SiteFooter da
              aynı deseni kullanıyor. */}
          {config.links.map((l, index) => (
            <a key={l.label} className="contact-link" href={l.href} target="_blank" rel="noreferrer">
              <span className="contact-link-label">{t.footer.links[index]}</span>
              <span className="contact-link-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>

        <aside className="contact-brief">
          <h2 className="contact-brief-title display">{t.contact.responseTitle}</h2>
          <ul>
            {t.contact.responseItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {portfolio.about.availability && (
            <p className="contact-avail">
              <span className="signal" />
              {t.contact.available}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
