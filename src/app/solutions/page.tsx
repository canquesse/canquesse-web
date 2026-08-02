'use client';
import { useLang } from '@/components/LangProvider';
import Solutions from '@/components/Solutions';

export default function SolutionsPage() {
  const { t } = useLang();
  return <Solutions t={t} />;
}
