import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Solutions",
  description:
    "AI, backend and interface decisions belong in the same product system. We separate the solution areas clearly so the result stays useful and maintainable.",
  path: "/solutions/",
});

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
