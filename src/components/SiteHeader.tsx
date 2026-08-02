'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { config } from '@/lib/config';
import { useLang } from './LangProvider';
import LangSwitcher from './LangSwitcher';
import ThemeToggle from './ThemeToggle';
import LogoMark from './LogoMark';
import Wordmark from './Wordmark';
import ScrollProgress from './ScrollProgress';

export default function SiteHeader() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();

  const links = [
    { href: '/solutions', label: t.nav.solutions },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label={`${config.name} — home`}>
          <LogoMark priority />
          <Wordmark className="brand-wordmark" />
        </Link>

        <nav className="site-nav" aria-label="Pages">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="nav-text">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="header-controls">
          <LangSwitcher lang={lang} setLang={setLang} />
          <span className="hc-divider" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}
