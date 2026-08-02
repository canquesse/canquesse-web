// The CANQUESSE wordmark is a CSS mask, so each placement can use its own
// theme-aware colour while staying razor-sharp at any size.
export default function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`cq-wordmark ${className}`.trim()} role="img" aria-label="CANQUESSE" />;
}
