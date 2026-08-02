'use client';

import { useState } from 'react';
import type { T } from '@/data/translations';

type SignalCopy = T['home']['signal'];

export default function ReadinessCheck({ copy }: { copy: SignalCopy }) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const current = answers.length;
  const complete = current === copy.questions.length;
  const score = answers.filter(Boolean).length;

  const answer = (value: boolean) => setAnswers((previous) => [...previous, value]);
  const restart = () => {
    setAnswers([]);
    setStarted(true);
  };

  const result = score === 3
    ? copy.resultHigh
    : score >= 1
      ? copy.resultMid
      : copy.resultLow;

  return (
    <div className={`signal-band readiness-band ${started ? 'is-open' : ''}`}>
      <span className="signal-band-kicker mono">{copy.label}</span>
      <p className="signal-band-text display">{copy.title}</p>

      {!started && (
        <button type="button" className="btn-ghost readiness-start" onClick={() => setStarted(true)}>
          {copy.cta}<span aria-hidden="true">→</span>
        </button>
      )}

      {started && (
        <div className="readiness-flow" aria-live="polite">
          {!complete ? (
            <>
              <div className="readiness-progress mono" aria-hidden="true">
                <span>{String(current + 1).padStart(2, '0')}</span>
                <span className="readiness-progress-track">
                  <span style={{ width: `${((current + 1) / copy.questions.length) * 100}%` }} />
                </span>
                <span>{String(copy.questions.length).padStart(2, '0')}</span>
              </div>
              <p className="readiness-question display">{copy.questions[current]}</p>
              <div className="readiness-actions">
                <button type="button" className="readiness-choice" onClick={() => answer(true)}>{copy.yes}</button>
                <button type="button" className="readiness-choice" onClick={() => answer(false)}>{copy.no}</button>
              </div>
            </>
          ) : (
            <div className="readiness-result">
              <span className="readiness-result-label mono">{copy.resultLabel}</span>
              <p className="display">{result}</p>
              <button type="button" className="readiness-restart mono" onClick={restart}>
                {copy.restart}<span aria-hidden="true">↻</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
