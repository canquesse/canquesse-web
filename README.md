# canquesse-web

Canquesse AI Solutions'ın kurumsal sitesi. Next.js 16 (App Router) + React 19 +
TypeScript ile yazıldı, statik olarak export edilip Cloudflare Pages üzerinden
yayınlanıyor.

## Geliştirme

```bash
npm install
npm run dev
```

http://localhost:3000

## Build

```bash
npm run build
```

Çıktı `out/` klasörüne statik HTML/CSS/JS olarak yazılır. Yerelde denemek için:

```bash
npx serve out
```

## Cloudflare Pages

| Ayar | Değer |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | 20 veya üzeri (`NODE_VERSION` env) |

Site tamamen statiktir — çalışan bir sunucu, veritabanı veya API ucu yoktur.
Güvenlik başlıkları (CSP, HSTS, `X-Frame-Options`, `Permissions-Policy`) `public/_headers`
dosyasından Cloudflare'e verilir; bu dosya build sırasında `out/` içine kopyalanır.

## Yapı

```
src/app/          route'lar (hepsi client-rendered)
src/components/   UI bileşenleri
src/data/         portföy içeriği + TR/EN/DE çeviriler
src/lib/          site konfigürasyonu
src/app/globals.css   tüm stil (Tailwind kullanılmıyor)
public/_headers   Cloudflare güvenlik & cache başlıkları
```

Metinler `src/data/translations.ts` içinde tutulur; bileşenlere hardcode edilmez.
