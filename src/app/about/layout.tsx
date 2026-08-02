import { pageMetadata } from "@/lib/seo";

// Sayfanın kendisi 'use client' olduğu için metadata'yı buradan veriyoruz —
// client component'ler metadata export edemez.
export const metadata = pageMetadata({
  title: "About",
  description:
    "Canquesse AI Solutions builds AI-powered software from idea to product, bringing product engineering, adaptive experiences and AI systems into one flow.",
  path: "/about/",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
