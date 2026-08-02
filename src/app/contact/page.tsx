'use client';
import { useLang } from '@/components/LangProvider';
import Contact from '@/components/Contact';

export default function ContactPage() {
  const { t } = useLang();
  return <Contact t={t} />;
}
