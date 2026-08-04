'use client';
import { useId, useState, type ReactNode } from 'react';

/**
 * Accessible click-to-expand disclosure. Collapsed: title + meta always visible.
 * Expanded: detail panel animates open via grid-rows (no height measurement).
 * Honors reduced-motion through the global transition override.
 */
export default function Disclosure({
  title,
  meta,
  summary,
  defaultOpen = false,
  children,
}: {
  title: ReactNode;
  meta?: ReactNode;
  /** Kapalıyken de görünen tek cümlelik özet — liste açmadan taranabilsin diye. */
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={`disc ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="disc-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="disc-titles">
          <span className="disc-title">{title}</span>
          {meta && <span className="disc-meta mono">{meta}</span>}
          {summary && <span className="disc-summary">{summary}</span>}
        </span>
        <span className="disc-icon" aria-hidden="true">
          <span className="disc-icon-bar" />
          <span className="disc-icon-bar disc-icon-bar--v" />
        </span>
      </button>

      <div className="disc-panel" id={panelId} role="region">
        <div className="disc-panel-inner" inert={!open ? true : undefined}>
          <div className="disc-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
