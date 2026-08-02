'use client';
import { useEffect, useState } from 'react';

type Kind = 'cmd' | 'out' | 'ok';
const SEQ: { kind: Kind; text: string }[] = [
  { kind: 'cmd', text: 'canquesse init --ai' },
  { kind: 'out', text: 'models · llm · embeddings · vision' },
  { kind: 'out', text: 'stack · java · spring · typescript · next.js' },
  { kind: 'cmd', text: 'build && deploy --prod' },
  { kind: 'out', text: 'compiling solution…' },
  { kind: 'ok',  text: 'shipped ✓' },
];

export default function TerminalWindow() {
  const [lines, setLines] = useState<{ kind: Kind; text: string }[]>([]);
  const [typing, setTyping] = useState('');
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimated(false);
      setLines(SEQ);
      return;
    }

    let i = 0, ch = 0;
    let timer: ReturnType<typeof setTimeout>;
    let acc: { kind: Kind; text: string }[] = [];

    const step = () => {
      if (i >= SEQ.length) {
        timer = setTimeout(() => { acc = []; i = 0; ch = 0; setLines([]); setTyping(''); step(); }, 2800);
        return;
      }
      const line = SEQ[i];
      if (line.kind === 'cmd') {
        if (ch <= line.text.length) {
          setTyping(line.text.slice(0, ch));
          ch++;
          timer = setTimeout(step, 46);
        } else {
          acc = [...acc, line];
          setLines(acc); setTyping(''); i++; ch = 0;
          timer = setTimeout(step, 360);
        }
      } else {
        acc = [...acc, line];
        setLines(acc); i++; ch = 0;
        timer = setTimeout(step, line.kind === 'ok' ? 700 : 520);
      }
    };

    timer = setTimeout(step, 650);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="term" aria-hidden="true">
      <div className="term-bar">
        <span className="term-dot" />
        <span className="term-dot" />
        <span className="term-dot" />
        <span className="term-title mono">canquesse — ~/studio</span>
      </div>
      <div className="term-body mono">
        {lines.map((l, idx) => (
          <div key={idx} className={`term-line term-line--${l.kind}`}>
            {l.kind === 'cmd' && <span className="term-prompt">$</span>}
            {l.kind === 'out' && <span className="term-arrow">→</span>}
            <span>{l.text}</span>
          </div>
        ))}
        {animated && (
          <div className="term-line term-line--cmd">
            <span className="term-prompt">$</span>
            <span>{typing}</span>
            <span className="term-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}
