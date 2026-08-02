import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Canquesse AI Solutions",
  description: "Canquesse AI Solutions — yapay zekâ çözümleri tasarlıyor ve uçtan uca geliştiriyoruz. Full-stack studio.",
};

// Set the theme before first paint to avoid a flash of the wrong palette.
const themeScript = `(function(){try{var t=localStorage.getItem('cq_theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LangProvider>
          <a href="#main" className="skip-link">SKIP TO CONTENT</a>
          <div className="grain" aria-hidden="true" />
          <SiteHeader />
          <main className="shell" id="main">{children}</main>
          <SiteFooter />
        </LangProvider>
      </body>
    </html>
  );
}
