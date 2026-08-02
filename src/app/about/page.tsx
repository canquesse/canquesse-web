'use client';
import { useLang } from '@/components/LangProvider';
import AboutUs from '@/components/AboutUs';

export default function AboutPage() {
  const { t } = useLang();
  return <AboutUs t={t} />;
}
