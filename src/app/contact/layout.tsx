import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Have a project or an idea? Let's build a solution together — Canquesse AI Solutions is open to new projects.",
  path: "/contact/",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
