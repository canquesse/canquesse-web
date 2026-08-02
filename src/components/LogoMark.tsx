import Image from 'next/image';

// The user's final, pre-masked CQ monogram. Keep this source unprocessed.
export default function LogoMark({
  className = '',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      className={`logo-mark ${className}`.trim()}
      src="/brand/canquesse-mark-ready.webp"
      alt=""
      width={1024}
      height={1024}
      sizes="(max-width: 760px) 96px, 140px"
      aria-hidden="true"
      decoding="async"
      priority={priority}
    />
  );
}
