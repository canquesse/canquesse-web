import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_URL, OG_IMAGE } from "@/lib/seo";

const DESCRIPTION =
  "Canquesse is an independent product studio turning complex AI ideas into clear experiences and production-ready products.";

// Sayfa dili istemcide değişiyor ama statik HTML tek bir dille servis ediliyor
// (LangProvider varsayılanı: en). Paylaşım kartları ve arama motorları o HTML'i
// gördüğü için metadata da İngilizce tutuluyor.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Canquesse AI Solutions",
    template: "%s — Canquesse",
  },
  description: DESCRIPTION,
  applicationName: "Canquesse",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Canquesse AI Solutions",
    locale: "en",
    url: "/",
    title: "Canquesse AI Solutions",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canquesse AI Solutions",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Set the theme before first paint to avoid a flash of the wrong palette.
// İlk ziyaret aydınlık başlar; daha önce tema seçmiş biri kendi tercihini görür.
const themeScript = `(function(){try{var t=localStorage.getItem('cq_theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
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
