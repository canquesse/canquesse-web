import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Statik export'ta sitemap build anında bir kez üretilir.
export const dynamic = "force-static";

// İçerik gerçekten değiştiğinde elle güncelle. Build zamanını kullanmak
// her deploy'da "sayfa değişti" sinyali verir ki bu doğru olmaz.
const LAST_MODIFIED = "2026-08-02";

// trailingSlash: true ile servis edilen gerçek adresler — canonical'larla aynı
// kalsın diye sondaki slash'ler bilerek duruyor.
const ROUTES = [
  { path: "/", priority: 1 },
  { path: "/solutions/", priority: 0.8 },
  { path: "/about/", priority: 0.7 },
  { path: "/contact/", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority,
  }));
}
