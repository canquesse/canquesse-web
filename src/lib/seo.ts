import type { Metadata } from "next";

export const SITE_URL = "https://canquesse.com";

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Canquesse AI Solutions",
};

/**
 * Alt sayfalar için metadata üretir.
 *
 * Next.js child route'ta tanımlanan `openGraph` / `twitter` nesnesini parent ile
 * derin birleştirmez — komple değiştirir. Yani alt sayfada sadece `title` verirsek
 * root'taki `images` ve `card: summary_large_image` sessizce düşer ve sayfa
 * görselsiz küçük kart olarak paylaşılır. Bu yüzden her sayfa tam nesneyi
 * buradan alıyor.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: `/${string}/`;
}): Metadata {
  const fullTitle = `${title} — Canquesse`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Canquesse AI Solutions",
      locale: "en",
      title: fullTitle,
      description,
      url: path,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
