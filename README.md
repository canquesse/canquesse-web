# canquesse portfolio (v4)

Astro + TypeScript, düz CSS, GSAP (ScrollTrigger, SplitText), Lenis, three.js.

```sh
npm install
npm run dev
npm run build
```

Deploy: `main` dalına push, Cloudflare Workers Builds derleyip canquesse.com'a koyar (`npm run build`, çıktı `dist/`, ayar `wrangler.jsonc`). Güvenlik başlıkları `public/_headers`, eski adreslerin yönlendirmeleri `public/_redirects`. Model çözücüsü WebAssembly kullanır, bu yüzden CSP'de `wasm-unsafe-eval` kalmalı.

## Dosyalar

| Dosya | Ne yapar |
| --- | --- |
| `src/content/en.ts`, `tr.ts`, `de.ts` | Üç dilin metinleri, hepsi aynı yapıda (`Site`, `site.ts`). `null` olan alan sayfada görünmez. |
| `src/content/shared.ts` | Dilden bağımsız olanlar: mail, linkler, teknolojiler, proje bağlantıları. |
| `src/components/Page.astro` | Sayfanın kendisi. `/` İngilizce, `/tr/` Türkçe, `/de/` Almanca. Dil değişince aynı yerde devam eder. |
| `src/scripts/shapes.ts` | Şeridin iki hali: CQ monogramı ve tek parça uzun hat (dalga, halka, sarmal, makara, ince sarmal). |
| `src/scripts/score.ts` | Hareket matematiği: yaylı oynatma kafası (`Playhead`), köşesiz eğri (`Curve`), yumuşak pin (`soften`). |
| `src/scripts/stage.ts` | 3D sahne: malzeme, cam kırılması, gölge, poz, şeridin esneme gecikmesi, 3D wordmark. |
| `src/scripts/sculpture.ts` | CQ heykeli (Meshy modeli): yükleme, lake/cam malzeme, çizilerek oluşma. |
| `public/models/` | Modelin web sürümü: geometri (meshopt), 4K/2K renk, normal, pürüzlülük. |
| `src/scripts/weave.ts` | Community: tezgâhtaki gibi dokunan kilim, önce çözgü, sonra sıra sıra atkı. |
| `src/scripts/bridge.ts` | Türk Tech Almanya logosu: Meshy modelinin beş parçası, kilim serilince üstüne kurulur. `public/models/tta.glb` |
| `src/components/QrCard.astro`, `src/content/qr.ts` | WhatsApp QR kartı. `--q` 0 köşede yatık, 1 düz (`motion.ts`). Link değişirse `qr.ts` yeniden üretilmeli. |
| `src/scripts/gate.ts`, `src/components/Gate.astro` | CAUTRUM kartı: granit C kapı, istekler, karar ışığı. Kendi küçük renderer'ı var, yalnızca kart görünürken çalışır. `public/models/cautrum.glb` (doku yok, taş shader'da kurulur) |
| `src/components/FooterMark.astro` | Footer linklerinin küçük çizimleri. Üstteki ip `motion.ts` içinde. |
| `src/components/Cover.astro` | Proje kartlarının çizimleri (gerçek ekran görüntüsü gelene kadar). |
| `src/scripts/motion.ts` | Intro, `desktop` / `mobile` koreografisi, zemin renkleri, DOM hareketleri. |
| `src/styles/tokens.css` | Palet ve temel ölçüler. |
| `src/components/Logo.astro` | Meshy modelinden alınan CQ işareti ve Canquesse yazısı. |
| `public/brand/` | 3D modelden alınan logo, favicon ve Apple Touch Icon. Düz tek renkli logo kullanılmaz. |

## Koreografi

`motion.ts` içindeki her satır bir cue: `[bölüm, yer, poz]`. `yer` 0-1 arası bölümün kendi scroll mesafesi, negatifse "bölüm tepeye gelmeden kaç ekran önce". Poz sadece değişeni yazar, gerisi önceki cue'dan devralınır.

Poz alanları: `q` hattaki odak noktası (`TRACK` içindeki duraklar), `fy`/`fz` odağın sapması, `px`/`py` ekrandaki yeri, `s` ölçek, `rx`/`ry`/`rz` dönüş, `spin` şeridin kendi ekseninde dönüşü, `glass`, `text`, `fill` (wordmark dolgusu), `head` (ne kadarı çizili), `flat` (düz kırmızı).

Kurallar:
- Scroll'a bağlı her şey tek saatten okur: yaylı `Playhead`. Kendi scrub'ını açma, `link()` kullan.
- Şerit yalnızca dönüşlerde ve en çok `FLEX` kadar esner; ilerleme, ölçek ve spin rijittir. Bu yüzden hızda iç içe geçmez.
- Tekerlek hızı `SPEED` (saniyede ekran) ile sınırlı, fazlası birikmez. End tuşu, scrollbar ve uzak linkler sahneleri oynatmaz, sahne söner ve yeni yerde açılır.
- Formdan forma morph yok. Şeklin kendisi hiç değişmez, kamera hat boyunca gider.
- Zemin rengi de aynı saatte (`colours` listesi), süreli tween değil.
- `[data-refract]` olan her kelime camın içinden kırılarak görünür.
- Şeridin satırları işlemcide, kesiti köşe gölgelendiricisinde kurulur (`uRows`). Yoğunluk `shapes.ts` içindeki `N` ve `DS`.
- Hero'da ad heykelin çevresinde durur; yerleri `site.css` içindeki `--x` / `--y` (heykel birimi `--u`). Scroll'da camın arkasında buluşurlar (`meet`).
- Katmanlar: `.under` (0) < 3D canvas (1) < `.layer` (2).

## Model

Şeridin dokusu da modelden: kırmızı ve altın bantlar atlastan düzleştirilip dikişsiz hale getirildi (`public/models/strip-*.webp`). Renk ve cila ayarı ortak: `sculpture.ts` içindeki `daylight` ve `COAT`.

Kaynak: `canquesse-meshy-8k.glb` (55 MB). Siteye giren sürüm 180° çevrildi, sıkıştırıldı (masaüstü yaklaşık 4,5 MB, mobil 2,8 MB) ve her noktasına gövde boyunca konumu (`_t`, gövdeye dik kesitlerle ölçülür) ve parçası (`_part`) işlendi. Modeli değiştirirsen bu iki özellik ve `sculpture.ts` içindeki `SPINE` yeniden hesaplanmalı. Model yüklenemezse site eski çizim CQ ile çalışır.
